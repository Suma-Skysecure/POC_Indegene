import { requestsData as requestSeedData } from "@/data/mockData";
import { buildShadowItList } from "@/lib/shadowIt";
import {
    addRuntimeCatalogItem,
    getAllCatalogItems,
    removeCatalogItems,
} from "@/lib/server/softwareCatalog";
import {
    ANALYTICS_PAGES_SEED,
    DASHBOARD_CHARTS_SEED,
    DASHBOARD_KPI_SEED,
    DASHBOARD_RECENT_LIMIT,
} from "@/lib/admin/sharedData";

const STORE_KEY = "adminStore";

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getLicenseStatus = (total, used) => {
    if (used > total) return "Over-utilized";
    if (total <= 0) return "Underutilized";
    const utilization = used / total;
    if (utilization >= 0.9) return "Near Limit";
    if (utilization >= 0.5) return "Healthy";
    return "Underutilized";
};

function toRequestIdNumber(id = "") {
    const match = String(id).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
}

function buildInitialStore() {
    return {
        requests: requestSeedData.map((item) => ({ ...item })),
        shadowStatusByKey: {},
    };
}

function getOrCreateAdminStore() {
    if (!globalThis[STORE_KEY]) {
        globalThis[STORE_KEY] = buildInitialStore();
    }
    return globalThis[STORE_KEY];
}

export function getAdminStore() {
    return getOrCreateAdminStore();
}

export async function listCatalogRecords() {
    return getAllCatalogItems();
}

export async function getCatalog() {
    return listCatalogRecords();
}

export async function addCatalogRecord(payload) {
    return addRuntimeCatalogItem(payload || {});
}

export async function deleteCatalogRecords(ids) {
    return removeCatalogItems(ids || []);
}

export function listRequests() {
    const store = getOrCreateAdminStore();
    return [...store.requests].sort((a, b) => toRequestIdNumber(b.id) - toRequestIdNumber(a.id));
}

export function getRequests() {
    return listRequests();
}

export function upsertRequests(records = []) {
    const store = getOrCreateAdminStore();
    const map = new Map(store.requests.map((item) => [item.id, item]));
    records.forEach((item) => {
        if (!item?.id) return;
        map.set(item.id, { ...map.get(item.id), ...item });
    });
    store.requests = Array.from(map.values());
    return listRequests();
}

export function updateRequestStatus(id, status) {
    const store = getOrCreateAdminStore();
    const normalizedId = String(id || "").trim();
    if (!normalizedId) return null;
    let updated = null;
    store.requests = store.requests.map((item) => {
        if (item.id !== normalizedId) return item;
        updated = { ...item, status };
        return updated;
    });
    return updated;
}

export function deleteRequests(ids = []) {
    const store = getOrCreateAdminStore();
    const deleteSet = new Set((Array.isArray(ids) ? ids : []).map((id) => String(id)));
    const before = store.requests.length;
    store.requests = store.requests.filter((item) => !deleteSet.has(String(item.id)));
    return { removedCount: before - store.requests.length };
}

export async function listShadowItRecords() {
    const store = getOrCreateAdminStore();
    const catalog = await listCatalogRecords();
    return buildShadowItList(catalog).map((row) => {
        const key = `${String(row.softwareName || "").toLowerCase()}::${String(row.manufacturer || "").toLowerCase()}`;
        return {
            ...row,
            status: store.shadowStatusByKey[key] || "Unreviewed",
            rowKey: key,
        };
    });
}

export async function getShadowIt() {
    return listShadowItRecords();
}

export async function listLicenseRecords() {
    const catalog = await listCatalogRecords();
    const approved = catalog.filter(
        (item) => String(item.category || "").toLowerCase() === "approved softwares"
    );
    return approved.map((item, index) => {
        const isRuntimeAdded = String(item.id || "").startsWith("runtime-");
        const total = isRuntimeAdded
            ? Math.max(toNumber(item.networkInstallations), 100)
            : 100 + (index % 6) * 25;
        const used = isRuntimeAdded ? 0 : Math.max(0, total - (10 + (index % 5) * 7));
        return {
            rowKey: item.id,
            tool: item.softwareName || "-",
            vendor: item.manufacturer || "-",
            version: item.version || "-",
            softwareType: item.softwareType || "-",
            category: item.category || "Approved Softwares",
            total,
            used,
            available: total - used,
            status: isRuntimeAdded ? "Healthy" : getLicenseStatus(total, used),
            icon: item.logoUrl || "",
            logoDomain: item.logoDomain || "",
        };
    });
}

export async function getLicenses() {
    return listLicenseRecords();
}

export async function getDashboardPayload() {
    const [catalog, requests, shadowIt, licenses] = await Promise.all([
        listCatalogRecords(),
        Promise.resolve(listRequests()),
        listShadowItRecords(),
        listLicenseRecords(),
    ]);

    const approvedCount = requests.filter((item) => String(item.status).toLowerCase() === "approved").length;
    const pendingCount = requests.filter((item) => String(item.status).toLowerCase() === "pending").length;
    const rejectedCount = requests.filter((item) => String(item.status).toLowerCase() === "rejected").length;

    const recentRequests = requests.slice(0, DASHBOARD_RECENT_LIMIT);
    const recentLicenses = licenses.slice(0, DASHBOARD_RECENT_LIMIT);

    return {
        metrics: {
            ...DASHBOARD_KPI_SEED,
            totalTools: catalog.length,
            totalRequests: requests.length,
            pendingRequests: pendingCount,
            approvedRequests: approvedCount,
            rejectedRequests: rejectedCount,
            totalLicenses: licenses.length,
            shadowItCount: shadowIt.length,
        },
        recent: {
            requests: recentRequests,
            licenses: recentLicenses,
        },
        recentRequests,
        recentLicenses,
        charts: {
            ...DASHBOARD_CHARTS_SEED,
        },
        data: {
            catalog,
            requests,
            shadowIt,
            licenses,
        },
    };
}

export async function getAnalyticsPayload() {
    const dashboard = await getDashboardPayload();
    const topTools = dashboard.charts.toolUsage;
    const trends = dashboard.charts.spendTrend;
    return {
        pages: ANALYTICS_PAGES_SEED,
        topTools,
        trends,
        counts: {
            requests: dashboard.metrics.totalRequests,
            approved: dashboard.metrics.approvedRequests,
            rejected: dashboard.metrics.rejectedRequests,
            tools: dashboard.metrics.totalTools,
            licenses: dashboard.metrics.totalLicenses,
            shadowIt: dashboard.metrics.shadowItCount,
        },
        charts: {
            spendTrend: dashboard.charts.spendTrend,
            toolUsage: dashboard.charts.toolUsage,
        },
    };
}
