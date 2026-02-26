import { NextResponse } from "next/server";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";
import {
    getAnalyticsPayload,
    getCatalog,
    getDashboardPayload,
    getLicenses,
    getRequests,
    getShadowIt,
} from "@/lib/server/adminStore";

export const runtime = "nodejs";

const MAX_RECENT = 10;
const MAX_TOP = 10;
const REQUESTS_API_URL = process.env.NEXT_PUBLIC_REQUESTS_API_URL || "http://localhost:5000/requests";
const REQUESTS_API_FALLBACKS = [
    REQUESTS_API_URL,
    "http://localhost:5000/requests",
    "http://localhost:5000/api/requests",
];

const safeArr = (value) => (Array.isArray(value) ? value : []);
const take = (arr, n) => safeArr(arr).slice(0, n);
const pick = (obj, keys) =>
    keys.reduce((acc, key) => {
        acc[key] = obj?.[key] ?? null;
        return acc;
    }, {});
const countBy = (arr, keyOrFn) => {
    const out = {};
    safeArr(arr).forEach((item) => {
        const raw = typeof keyOrFn === "function" ? keyOrFn(item) : item?.[keyOrFn];
        const key = String(raw || "Unknown");
        out[key] = (out[key] || 0) + 1;
    });
    return out;
};
const topByCount = (arr, keyOrFn, limit = MAX_TOP) =>
    Object.entries(countBy(arr, keyOrFn))
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

const extractRequestNumber = (id = "") => {
    const match = String(id).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
};

const toDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (value) => {
    const date = toDate(value);
    return date ? date.toISOString().slice(0, 10) : null;
};

function getCountsByDateLast30(requests) {
    const out = {};
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    safeArr(requests).forEach((item) => {
        const date = toDate(item?.createdAt || item?.date);
        if (!date || date < start || date > now) return;
        const key = date.toISOString().slice(0, 10);
        out[key] = (out[key] || 0) + 1;
    });
    return out;
}

const mergeRequests = (base, incoming) => {
    const map = new Map();
    [...safeArr(base), ...safeArr(incoming)].forEach((item) => {
        const id = String(item?.id || "").trim();
        if (!id) return;
        map.set(id, { ...map.get(id), ...item });
    });
    return Array.from(map.values());
};

const toRequestSortTime = (item) => {
    const createdAt = toDate(item?.createdAt);
    if (createdAt) return createdAt.getTime();
    const date = toDate(item?.date);
    if (date) return date.getTime();
    return 0;
};

async function loadExternalRequests() {
    for (const candidate of REQUESTS_API_FALLBACKS) {
        try {
            const response = await fetch(candidate, { cache: "no-store" });
            if (!response.ok) continue;
            const payload = await response.json();
            const records = Array.isArray(payload) ? payload : payload?.data;
            if (!Array.isArray(records)) continue;
            return records;
        } catch {
            // try next candidate
        }
    }
    return [];
}

function buildLinks(request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const base = `${proto}://${host}`;
    return {
        dashboard: `${base}/dashboard`,
        requests: `${base}/requests`,
        licenses: `${base}/licenses`,
        catalog: `${base}/catalog`,
        shadowIt: `${base}/shadow-it`,
        analytics: `${base}/analytics`,
    };
}

function buildExpiringSoon(licenses) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + 30);
    const expiring = safeArr(licenses).filter((item) => {
        const expiry = toDate(item?.expiryDate);
        return expiry && expiry >= now && expiry <= end;
    });
    return {
        count: expiring.length,
        data: take(expiring, MAX_RECENT).map((item) =>
            pick(item, ["tool", "vendor", "category", "total", "used", "available", "expiryDate", "status"])
        ),
    };
}

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const [requests, externalRequests, licenses, catalog, shadowIt, dashboard, analytics] = await Promise.all([
            Promise.resolve(getRequests()),
            loadExternalRequests(),
            getLicenses(),
            getCatalog(),
            getShadowIt(),
            getDashboardPayload(),
            getAnalyticsPayload(),
        ]);

        const allRequests = mergeRequests(requests, externalRequests).sort((a, b) => {
            const timeDiff = toRequestSortTime(b) - toRequestSortTime(a);
            if (timeDiff !== 0) return timeDiff;
            return extractRequestNumber(b?.id) - extractRequestNumber(a?.id);
        });

        const recentRequests = take(allRequests, MAX_RECENT).map((item) => ({
            ...pick(item, ["id", "tool", "requester", "department", "status", "type", "risk"]),
            title: item?.requestOverview?.type || item?.tool || null,
            createdAt: item?.createdAt || null,
            date: item?.date || null,
        }));

        const expiringSoon = buildExpiringSoon(licenses);

        const compactCatalogTopTools = take(catalog, MAX_TOP).map((item) => ({
            id: item?.id ?? null,
            name: item?.softwareName ?? null,
            category: item?.category ?? null,
            owner: item?.owningTeam || item?.manufacturer || null,
            status: item?.contractStatus || item?.category || null,
        }));

        const compactShadowTopDetected = take(shadowIt, MAX_TOP).map((item) => ({
            id: item?.id ?? null,
            name: item?.softwareName || item?.app || null,
            risk: item?.riskLevel || item?.risk || null,
            detectedOn: toIsoDate(item?.createdAt || item?.date) || null,
            owner: item?.owningTeam || item?.manufacturer || null,
        }));

        const firstTenLicenseTools = take(licenses, MAX_RECENT).map((item) =>
            pick(item, ["tool", "vendor", "category", "total", "used", "available", "expiryDate", "status"])
        );

        const response = {
            generatedAt: new Date().toISOString(),
            links: buildLinks(request),
            metrics: {
                totalRequests: dashboard?.metrics?.totalRequests ?? safeArr(requests).length,
                pending: dashboard?.metrics?.pendingRequests ?? 0,
                approved: dashboard?.metrics?.approvedRequests ?? 0,
                rejected: dashboard?.metrics?.rejectedRequests ?? 0,
                totalTools: dashboard?.metrics?.totalTools ?? safeArr(catalog).length,
                totalLicenses: dashboard?.metrics?.totalLicenses ?? safeArr(licenses).length,
                totalShadowIt: dashboard?.metrics?.shadowItCount ?? safeArr(shadowIt).length,
            },
            requests: {
                countsByStatus: countBy(allRequests, (item) => item?.status || "Unknown"),
                countsByDateLast30: getCountsByDateLast30(allRequests),
                recent: recentRequests,
            },
            licenses: {
                countsByStatus: countBy(licenses, (item) => item?.status || "Unknown"),
                expiringSoonNext30DaysCount: expiringSoon.count,
                expiringSoon: expiringSoon.data,
                topTools: firstTenLicenseTools,
            },
            catalog: {
                total: safeArr(catalog).length,
                topCategories: topByCount(catalog, (item) => item?.category || "Unknown", MAX_TOP),
                topTools: compactCatalogTopTools,
            },
            shadowIt: {
                total: safeArr(shadowIt).length,
                topRisks: topByCount(shadowIt, (item) => item?.riskLevel || item?.risk || "Unknown", MAX_TOP),
                topDetected: compactShadowTopDetected,
            },
            analytics: {
                pages: take(analytics?.pages, MAX_TOP),
                topTools: take(analytics?.topTools, MAX_TOP),
                trends: take(analytics?.trends, MAX_TOP),
                counts: analytics?.counts || {
                    requests: 0,
                    approved: 0,
                    rejected: 0,
                    tools: 0,
                    licenses: 0,
                    shadowIt: 0,
                },
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            {
                generatedAt: new Date().toISOString(),
                links: buildLinks(request),
                metrics: {
                    totalRequests: 0,
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    totalTools: 0,
                    totalLicenses: 0,
                    totalShadowIt: 0,
                },
                requests: {
                    countsByStatus: {},
                    countsByDateLast30: {},
                    recent: [],
                },
                licenses: {
                    countsByStatus: {},
                    expiringSoonNext30DaysCount: 0,
                    expiringSoon: [],
                    topTools: [],
                },
                catalog: {
                    total: 0,
                    topCategories: [],
                    topTools: [],
                },
                shadowIt: {
                    total: 0,
                    topRisks: [],
                    topDetected: [],
                },
                analytics: {
                    pages: [],
                    topTools: [],
                    trends: [],
                    counts: {
                        requests: 0,
                        approved: 0,
                        rejected: 0,
                        tools: 0,
                        licenses: 0,
                        shadowIt: 0,
                    },
                },
                error: "Failed to load agent snapshot",
                details: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
