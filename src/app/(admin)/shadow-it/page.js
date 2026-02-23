"use client";

import React, { useEffect, useMemo, useState } from "react";
import Table from "@/components/Table";
import { useCatalogData } from "@/lib/useCatalogData";
import { buildShadowItList } from "@/lib/shadowIt";
import {
    Search,
    Download,
    Shield,
    AlertTriangle,
    Smartphone,
    Ban,
    Eye,
} from "lucide-react";
import clsx from "clsx";

const BLOCKED_STATUS_STORAGE_KEY = "shadow_it_blocked_statuses";

const ShadowStatCard = ({ title, value, subtext, subtextColor, icon: Icon, iconColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <div className="flex items-baseline mt-4">
                    <span className="text-3xl font-bold text-gray-900 mr-2">{value}</span>
                    {subtext ? (
                        <span className={clsx("text-sm font-medium", subtextColor)}>
                            {subtext}
                        </span>
                    ) : null}
                </div>
            </div>
            <div className={clsx("p-2 rounded-lg bg-gray-50", iconColor)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const toCsvValue = (value) => {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes("\n") || text.includes('"')) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
};

const getStatusColor = (status) => {
    const normalized = String(status).toLowerCase();
    if (normalized === "blocked") return "text-red-600";
    return "text-gray-600";
};

const getRiskColor = (riskLevel) => {
    if (riskLevel === "High") return "text-red-600";
    if (riskLevel === "Medium") return "text-orange-500";
    return "text-green-600";
};

const getRowKey = (row) =>
    `${String(row.softwareName || "").toLowerCase()}::${String(row.manufacturer || "").toLowerCase()}`;

const normalizeDomain = (value = "") => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const noProtocol = raw
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0];
    if (noProtocol.includes("@")) return noProtocol.split("@")[1] || "";
    if (noProtocol.includes(".")) return noProtocol.replace(/[^a-z0-9.-]/g, "");
    const token = noProtocol.replace(/[^a-z0-9]/g, "");
    return token ? `${token}.com` : "";
};

const buildFallbackSvgLogo = (name = "") => {
    const label = String(name || "?").trim().charAt(0).toUpperCase() || "?";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='12' fill='#e2e8f0'/><text x='50%' y='53%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='28' font-weight='700' fill='#334155'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const buildLogoCandidates = (row, shouldGuaranteeLogo) => {
    const softwareDomain = normalizeDomain(row.softwareName);
    const manufacturerDomain = normalizeDomain(row.manufacturer);
    const domainCandidates = [row.logoDomain, manufacturerDomain, softwareDomain]
        .map(normalizeDomain)
        .filter(Boolean);
    const uniqueDomains = [...new Set(domainCandidates)];

    const candidates = [row.logoUrl].filter(Boolean);
    uniqueDomains.forEach((domain) => {
        candidates.push(`/api/logo?domain=${encodeURIComponent(domain)}`);
        candidates.push(`https://logo.clearbit.com/${domain}`);
        candidates.push(`https://unavatar.io/${domain}`);
        candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`);
    });

    // Guarantee visible logo for top 50 entries.
    if (shouldGuaranteeLogo) {
        candidates.push(buildFallbackSvgLogo(row.softwareName));
    }

    return [...new Set(candidates.filter(Boolean))];
};

function AppLogo({ row, shouldGuaranteeLogo }) {
    const [attempt, setAttempt] = useState(0);
    const logoCandidates = useMemo(
        () => buildLogoCandidates(row, shouldGuaranteeLogo),
        [row, shouldGuaranteeLogo]
    );
    const src = logoCandidates[attempt] || "";

    if (!src) {
        return (
            <div className="text-xs font-bold text-gray-500">
                {String(row.softwareName || "?").charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <img
            key={`${row.rowKey || row.id}-${attempt}`}
            src={src}
            alt={row.softwareName}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={() => setAttempt((value) => value + 1)}
        />
    );
}

export default function ShadowItPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState("Risk Levels");
    const [pageSize, setPageSize] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusByKey, setStatusByKey] = useState({});

    const { items: catalogRows, loading, error } = useCatalogData({
        sort: "rowIndex",
        order: "asc",
        limit: 50000,
        offset: 0,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const value = window.localStorage.getItem(BLOCKED_STATUS_STORAGE_KEY);
            const parsed = value ? JSON.parse(value) : {};
            setStatusByKey(parsed && typeof parsed === "object" ? parsed : {});
        } catch {
            setStatusByKey({});
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(BLOCKED_STATUS_STORAGE_KEY, JSON.stringify(statusByKey));
    }, [statusByKey]);

    const shadowItRows = useMemo(() => buildShadowItList(catalogRows), [catalogRows]);

    const rowsWithStatus = useMemo(
        () =>
            shadowItRows.map((row, idx) => {
                const key = getRowKey(row);
                return {
                    ...row,
                    status: statusByKey[key] || "Unreviewed",
                    rowKey: key,
                    globalIndex: idx,
                };
            }),
        [shadowItRows, statusByKey]
    );

    const searchMatchedRows = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return rowsWithStatus.filter((row) => {
            const matchesSearch =
                !query ||
                String(row.softwareName || "").toLowerCase().includes(query) ||
                String(row.manufacturer || "").toLowerCase().includes(query) ||
                String(row.category || "").toLowerCase().includes(query) ||
                String(row.licenseType || "").toLowerCase().includes(query);
            return matchesSearch;
        });
    }, [rowsWithStatus, searchTerm]);

    const riskCounts = useMemo(() => {
        return searchMatchedRows.reduce(
            (acc, row) => {
                if (row.riskLevel === "High") acc.high += 1;
                if (row.riskLevel === "Medium") acc.medium += 1;
                if (row.riskLevel === "Low") acc.low += 1;
                return acc;
            },
            { high: 0, medium: 0, low: 0 }
        );
    }, [searchMatchedRows]);

    const filteredRows = useMemo(() => {
        if (riskFilter === "Risk Levels") return searchMatchedRows;
        return searchMatchedRows.filter((row) => row.riskLevel === riskFilter);
    }, [searchMatchedRows, riskFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, riskFilter, pageSize]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const paginatedRows = useMemo(() => {
        const offset = (currentPage - 1) * pageSize;
        return filteredRows.slice(offset, offset + pageSize);
    }, [filteredRows, currentPage, pageSize]);

    const blockedCount = useMemo(
        () => rowsWithStatus.filter((row) => row.status === "Blocked").length,
        [rowsWithStatus]
    );
    const highRiskCount = useMemo(
        () => rowsWithStatus.filter((row) => row.riskLevel === "High").length,
        [rowsWithStatus]
    );

    const handleBlock = (row) => {
        setStatusByKey((prev) => ({ ...prev, [row.rowKey]: "Blocked" }));
    };

    const exportCsv = () => {
        const headers = [
            "App Name",
            "Category",
            "Risk Level",
            "Network Installations",
            "Managed Installations",
            "Manufacturer",
            "License Type",
            "Status",
        ];
        const lines = [headers.join(",")];
        filteredRows.forEach((row) => {
            lines.push(
                [
                    row.softwareName,
                    row.category,
                    row.riskLevel,
                    row.networkInstallations,
                    row.managedInstallations,
                    row.manufacturer,
                    row.licenseType,
                    row.status,
                ]
                    .map(toCsvValue)
                    .join(",")
            );
        });
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "shadow-it-report.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const columns = [
        {
            header: "App Name",
            accessor: "softwareName",
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded mr-3 overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <AppLogo row={row} shouldGuaranteeLogo={row.globalIndex < 50} />
                    </div>
                    <span className="font-medium text-gray-900">{row.softwareName}</span>
                </div>
            ),
        },
        { header: "Category", accessor: "category", className: "text-gray-500" },
        {
            header: "Risk Level",
            accessor: "riskLevel",
            render: (row) => (
                <span className={clsx("font-medium", getRiskColor(row.riskLevel))}>{row.riskLevel}</span>
            ),
        },
        {
            header: "Installations",
            accessor: "installations",
            className: "text-gray-900 font-medium",
            render: (row) => `${row.networkInstallations} / ${row.managedInstallations}`,
        },
        { header: "Manufacturer", accessor: "manufacturer", className: "text-gray-500" },
        { header: "License Type", accessor: "licenseType", className: "text-gray-500" },
        {
            header: "Status",
            accessor: "status",
            render: (row) => (
                <span className={clsx("font-medium text-sm", getStatusColor(row.status))}>{row.status}</span>
            ),
        },
        {
            header: "Action",
            accessor: "action",
            className: "text-right",
            render: (row) => (
                <div className="flex justify-end">
                    {row.riskLevel === "High" || row.riskLevel === "Medium" ? (
                        <button
                            onClick={() => handleBlock(row)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                            Block
                        </button>
                    ) : (
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm font-medium transition-colors inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            View
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 text-red-500 mr-2" />
                        Shadow IT Monitoring
                    </h1>
                    <p className="text-gray-500 mt-1">Unauthorized apps detected across organization</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={exportCsv}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">{highRiskCount} High-Risk apps</span>
                    <span className="ml-1">require immediate action - Review and block unauthorized applications</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ShadowStatCard
                    title="Total Apps Detected"
                    value={String(rowsWithStatus.length)}
                    subtext=""
                    subtextColor="text-gray-500"
                    icon={Smartphone}
                    iconColor="text-gray-400"
                />
                <ShadowStatCard
                    title="High Risk Apps"
                    value={String(highRiskCount)}
                    subtext="Critical"
                    subtextColor="text-red-600"
                    icon={AlertTriangle}
                    iconColor="text-red-500"
                />
                <ShadowStatCard
                    title="Blocked Apps"
                    value={String(blockedCount)}
                    subtext="Protected"
                    subtextColor="text-green-600"
                    icon={Ban}
                    iconColor="text-gray-400"
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Detected Applications</h2>

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search app, manufacturer, category..."
                                className="border border-gray-200 rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                            />
                        </div>
                        <select
                            className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                        >
                            <option>Risk Levels</option>
                            <option value="High">High ({riskCounts.high})</option>
                            <option value="Medium">Medium ({riskCounts.medium})</option>
                            <option value="Low">Low ({riskCounts.low})</option>
                        </select>
                        <select
                            className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={25}>25 / page</option>
                            <option value={50}>50 / page</option>
                            <option value={100}>100 / page</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="px-6 py-8 text-sm text-gray-500 text-center">Loading shadow IT data...</div>
                ) : error ? (
                    <div className="px-6 py-8 text-sm text-red-600 text-center">{error}</div>
                ) : (
                    <Table columns={columns} data={paginatedRows} />
                )}

                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} applications
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            className="px-2 py-1 border border-gray-200 rounded text-gray-600 disabled:text-gray-400 hover:bg-gray-50"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        >
                            &lt;
                        </button>
                        <span className="text-sm text-gray-700 font-medium">{currentPage} of {totalPages}</span>
                        <button
                            className="px-2 py-1 border border-gray-200 rounded text-gray-600 disabled:text-gray-400 hover:bg-gray-50"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
