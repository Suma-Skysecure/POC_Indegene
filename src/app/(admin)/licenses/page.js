"use client";

import React, { useEffect, useMemo, useState } from "react";
import Table from "@/components/Table";
import {
    Search,
    Plus,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpRight,
    AlertCircle,
    LayoutGrid,
    List,
} from "lucide-react";
import clsx from "clsx";
import { useCatalogData } from "@/lib/useCatalogData";

const LicenseStatCard = ({ title, value, subtext, trend, trendColor, badge, badgeColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-32">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <div className="flex flex-col items-end">
                {trend ? (
                    <span className={clsx("text-sm font-medium flex items-center", trendColor)}>
                        {trend.includes("+") ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
                        {trend}
                    </span>
                ) : null}
                {badge ? (
                    <span className={clsx("text-xs px-2 py-0.5 rounded font-medium flex items-center mt-1", badgeColor)}>
                        {badge === "Action Required" ? <AlertCircle className="w-3 h-3 mr-1" /> : null}
                        {badge}
                    </span>
                ) : null}
                {subtext ? <span className="text-xs text-gray-400 mt-1">{subtext}</span> : null}
            </div>
        </div>
    </div>
);

const normalizeDomain = (value = "") => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    const withoutProtocol = raw
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0];
    if (withoutProtocol.includes("@")) return withoutProtocol.split("@")[1] || "";
    if (withoutProtocol.includes(".")) return withoutProtocol.replace(/[^a-z0-9.-]/g, "");
    return "";
};

const getLogoCandidates = (row) => {
    const primary = String(row.icon || "").trim();
    const domains = [
        normalizeDomain(row.logoDomain),
        normalizeDomain(row.vendor),
    ].filter(Boolean);
    const uniqueDomains = [...new Set(domains)];

    const urls = [];
    if (primary) urls.push(primary);
    uniqueDomains.forEach((domain) => {
        urls.push(`/api/logo?domain=${encodeURIComponent(domain)}`);
        urls.push(`https://logo.clearbit.com/${domain}`);
        urls.push(`https://unavatar.io/${domain}`);
        urls.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`);
    });
    return [...new Set(urls)];
};

const getLicenseStatus = (total, used) => {
    if (used > total) return "Over-utilized";
    if (total <= 0) return "Underutilized";
    const utilization = used / total;
    if (utilization >= 0.9) return "Near Limit";
    if (utilization >= 0.5) return "Healthy";
    return "Underutilized";
};

export default function LicenseInventoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [vendorFilter, setVendorFilter] = useState("All Vendors");
    const [statusFilter, setStatusFilter] = useState("Status: All");
    const [viewMode, setViewMode] = useState("grid");
    const [logoAttemptByRowKey, setLogoAttemptByRowKey] = useState({});
    const [selectedLicenseIds, setSelectedLicenseIds] = useState(new Set());
    const [removedLicenseIds, setRemovedLicenseIds] = useState(new Set());
    const [isRemoveLicenseOpen, setIsRemoveLicenseOpen] = useState(false);
    const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
    const [removeReason, setRemoveReason] = useState("");
    const [deleteToast, setDeleteToast] = useState("");
    const [actionToast, setActionToast] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [addLicenseForm, setAddLicenseForm] = useState({
        toolKey: "",
        toolName: "",
        vendor: "",
        totalLicenses: "",
        expiryDate: "",
        licenseType: "",
    });

    const { items: approvedRows, loading, error } = useCatalogData({
        category: "Approved Softwares",
        sort: "rowIndex",
        order: "asc",
        limit: 50000,
        offset: 0,
        refreshKey,
    });

    const licenseRows = useMemo(() => {
        return approvedRows.map((item, index) => {
            const isRuntimeAdded = String(item.id || "").startsWith("runtime-");
            // Temporary dummy metrics for seeded rows; enforce Healthy defaults for newly added tools.
            const total = isRuntimeAdded
                ? Math.max(Number(item.networkInstallations) || 0, 100)
                : 100 + (index % 6) * 25;
            const used = isRuntimeAdded ? 0 : Math.max(0, total - (10 + (index % 5) * 7));
            return {
                rowKey: item.id || `${item.softwareName || "tool"}-${item.manufacturer || "vendor"}-${index}`,
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
    }, [approvedRows]);

    useEffect(() => {
        setLogoAttemptByRowKey({});
    }, [licenseRows]);

    const activeLicenseRows = useMemo(
        () => licenseRows.filter((item) => !removedLicenseIds.has(item.rowKey)),
        [licenseRows, removedLicenseIds]
    );

    const vendorOptions = useMemo(
        () =>
            [...new Set(activeLicenseRows.map((item) => item.vendor).filter(Boolean))].sort((a, b) =>
                a.localeCompare(b)
            ),
        [activeLicenseRows]
    );

    const filteredData = useMemo(
        () =>
            activeLicenseRows.filter((item) => {
                const query = searchTerm.toLowerCase();
                const matchesSearch = item.tool.toLowerCase().includes(query) || item.vendor.toLowerCase().includes(query);
                const matchesVendor = vendorFilter === "All Vendors" || item.vendor === vendorFilter;
                const matchesStatus = statusFilter === "Status: All" || item.status === statusFilter;
                return matchesSearch && matchesVendor && matchesStatus;
            }),
        [activeLicenseRows, searchTerm, vendorFilter, statusFilter]
    );

    const selectedVisibleRows = useMemo(
        () => filteredData.filter((row) => selectedLicenseIds.has(row.rowKey)),
        [filteredData, selectedLicenseIds]
    );
    const selectedVisibleCount = selectedVisibleRows.length;
    const isAllVisibleSelected = filteredData.length > 0 && selectedVisibleCount === filteredData.length;

    const totalLicenses = useMemo(
        () => activeLicenseRows.reduce((sum, item) => sum + item.total, 0),
        [activeLicenseRows]
    );
    const activeUsers = useMemo(
        () => activeLicenseRows.reduce((sum, item) => sum + item.used, 0),
        [activeLicenseRows]
    );
    const utilizationPercent = totalLicenses > 0 ? ((activeUsers / totalLicenses) * 100).toFixed(1) : "0.0";
    const nearLimitCount = useMemo(
        () => activeLicenseRows.filter((item) => item.status === "Near Limit").length,
        [activeLicenseRows]
    );
    const overUtilizedCount = useMemo(
        () => activeLicenseRows.filter((item) => item.status === "Over-utilized").length,
        [activeLicenseRows]
    );

    useEffect(() => {
        if (!isRemoveLicenseOpen && !isAddLicenseOpen) return;
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsRemoveLicenseOpen(false);
                setRemoveReason("");
                setIsAddLicenseOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isRemoveLicenseOpen, isAddLicenseOpen]);

    useEffect(() => {
        if (!deleteToast) return;
        const timer = setTimeout(() => setDeleteToast(""), 2500);
        return () => clearTimeout(timer);
    }, [deleteToast]);

    useEffect(() => {
        if (!actionToast) return;
        const timer = setTimeout(() => setActionToast(""), 2500);
        return () => clearTimeout(timer);
    }, [actionToast]);

    const handleToggleLicenseSelection = (rowKey) => {
        setSelectedLicenseIds((prev) => {
            const next = new Set(prev);
            if (next.has(rowKey)) next.delete(rowKey);
            else next.add(rowKey);
            return next;
        });
    };

    const handleToggleSelectAllVisible = (checked) => {
        setSelectedLicenseIds((prev) => {
            const next = new Set(prev);
            if (checked) filteredData.forEach((row) => next.add(row.rowKey));
            else filteredData.forEach((row) => next.delete(row.rowKey));
            return next;
        });
    };

    const handleRemoveSelected = () => {
        if (selectedVisibleCount === 0) return;
        setIsRemoveLicenseOpen(true);
    };

    const handleConfirmRemove = (event) => {
        event.preventDefault();
        if (selectedVisibleCount === 0) return;
        setRemovedLicenseIds((prev) => {
            const next = new Set(prev);
            selectedVisibleRows.forEach((row) => next.add(row.rowKey));
            return next;
        });
        setSelectedLicenseIds((prev) => {
            const next = new Set(prev);
            selectedVisibleRows.forEach((row) => next.delete(row.rowKey));
            return next;
        });
        setIsRemoveLicenseOpen(false);
        setRemoveReason("");
        if (selectedVisibleRows.length === 1) {
            setDeleteToast(`"${selectedVisibleRows[0].tool}" deleted successfully`);
        } else {
            setDeleteToast(`"${selectedVisibleRows[0].tool}" and ${selectedVisibleRows.length - 1} more deleted successfully`);
        }
    };

    const resetAddLicenseForm = () => {
        setAddLicenseForm({
            toolKey: "",
            toolName: "",
            vendor: "",
            totalLicenses: "",
            expiryDate: "",
            licenseType: "",
        });
    };

    const handleSaveLicense = (event) => {
        event.preventDefault();
        const normalizedTotal = Math.max(Number(addLicenseForm.totalLicenses) || 0, 0);
        const payload = {
            softwareName: addLicenseForm.toolName,
            version: "-",
            manufacturer: addLicenseForm.vendor || "-",
            licenseType: addLicenseForm.licenseType || "-",
            category: "Approved Softwares",
            softwareType: "-",
            networkInstallations: normalizedTotal,
            managedInstallations: 0,
        };

        fetch("/api/software", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
                setActionToast(`"${addLicenseForm.toolName}" added successfully`);
                setRefreshKey((value) => value + 1);
            })
            .catch(() => {
                setActionToast("Failed to add license");
            })
            .finally(() => {
                setIsAddLicenseOpen(false);
                resetAddLicenseForm();
            });
    };

    const columns = [
        {
            header: (
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={isAllVisibleSelected}
                    onChange={(e) => handleToggleSelectAllVisible(e.target.checked)}
                />
            ),
            accessor: "select",
            className: "w-10",
            render: (row) => (
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedLicenseIds.has(row.rowKey)}
                    onChange={() => handleToggleLicenseSelection(row.rowKey)}
                />
            ),
        },
        {
            header: "Tool",
            accessor: "tool",
            render: (row) => {
                const logoCandidates = getLogoCandidates(row);
                const attempt = logoAttemptByRowKey[row.rowKey] || 0;
                const logoSrc = logoCandidates[attempt] || "";
                return (
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center mr-3 p-1 border border-gray-100 overflow-hidden">
                            {logoSrc ? (
                                <img
                                    key={`${row.rowKey}-${attempt}`}
                                    src={logoSrc}
                                    alt={row.tool}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                    onError={() =>
                                        setLogoAttemptByRowKey((prev) => ({
                                            ...prev,
                                            [row.rowKey]: attempt + 1,
                                        }))
                                    }
                                />
                            ) : (
                                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                            )}
                        </div>
                        <span className="font-medium text-gray-900">{row.tool}</span>
                    </div>
                );
            },
        },
        { header: "Vendor", accessor: "vendor", className: "text-gray-600" },
        { header: "Total", accessor: "total", className: "text-gray-900 font-medium" },
        { header: "Used", accessor: "used", className: "text-gray-600" },
        {
            header: "Available",
            accessor: "available",
            render: (row) => (
                <span
                    className={clsx(
                        "font-medium",
                        row.available < 0 ? "text-red-600" : row.available < 5 ? "text-orange-600" : "text-gray-600"
                    )}
                >
                    {row.available}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: "status",
            render: (row) => {
                let colorClass = "text-gray-600";
                if (row.status === "Healthy") colorClass = "text-green-600";
                if (row.status === "Near Limit") colorClass = "text-orange-600";
                if (row.status === "Over-utilized") colorClass = "text-red-600";
                if (row.status === "Underutilized") colorClass = "text-blue-600";
                return <span className={clsx("text-xs font-bold", colorClass)}>{row.status}</span>;
            },
        },
        {
            header: "Actions",
            accessor: "actions",
            className: "text-right",
            render: () => (
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">License Inventory</h1>
                    <p className="text-gray-500 mt-1">Comprehensive view of approved software licenses across the enterprise</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                    <button
                        type="button"
                        onClick={handleRemoveSelected}
                        disabled={selectedVisibleCount === 0}
                        className="flex items-center px-4 py-2 border border-red-200 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remove License
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAddLicenseOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add License
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LicenseStatCard
                    title="Total Licenses"
                    value={totalLicenses.toLocaleString()}
                    trend={nearLimitCount > 0 ? `+${nearLimitCount}` : ""}
                    trendColor="text-green-600"
                />
                <LicenseStatCard
                    title="Active Users"
                    value={activeUsers.toLocaleString()}
                    subtext={`${utilizationPercent}% Utilized`}
                />
                <LicenseStatCard
                    title="Near Limit Tools"
                    value={String(nearLimitCount)}
                    badge="Action Required"
                    badgeColor="text-orange-600 bg-orange-50 border border-orange-100"
                />
                <LicenseStatCard
                    title="Over-utilized Tools"
                    value={String(overUtilizedCount)}
                    subtext="Needs Review"
                />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Filter by tool or vendor name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex space-x-3">
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px] text-gray-900 font-semibold"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                    >
                        <option>All Vendors</option>
                        {vendorOptions.map((vendor) => (
                            <option key={vendor} value={vendor}>
                                {vendor}
                            </option>
                        ))}
                    </select>
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px] text-gray-900 font-semibold"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>Status: All</option>
                        <option>Healthy</option>
                        <option>Near Limit</option>
                        <option>Over-utilized</option>
                        <option>Underutilized</option>
                    </select>
                    <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {loading ? "License Inventory" : `License Inventory (${filteredData.length.toLocaleString()})`}
                </h2>
                <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={isAllVisibleSelected}
                            onChange={(e) => handleToggleSelectAllVisible(e.target.checked)}
                        />
                        Select All
                    </label>
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                                viewMode === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"
                            }`}
                            aria-label="Grid view"
                            title="Grid view"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
                                viewMode === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"
                            }`}
                            aria-label="List view"
                            title="List view"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 px-6 py-10 text-sm text-gray-500 text-center shadow-sm">
                    Loading license inventory...
                </div>
            ) : error ? (
                <div className="bg-white rounded-lg border border-gray-200 px-6 py-10 text-sm text-red-600 text-center shadow-sm">
                    {error}
                </div>
            ) : viewMode === "list" ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <Table columns={columns} data={filteredData} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredData.map((row) => {
                        const logoCandidates = getLogoCandidates(row);
                        const attempt = logoAttemptByRowKey[row.rowKey] || 0;
                        const logoSrc = logoCandidates[attempt] || "";
                        const statusClass =
                            row.status === "Healthy"
                                ? "bg-emerald-100 text-emerald-700"
                                : row.status === "Near Limit"
                                    ? "bg-amber-100 text-amber-700"
                                    : row.status === "Over-utilized"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-blue-100 text-blue-700";

                        return (
                            <div
                                key={row.rowKey}
                                className={`relative bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
                                    selectedLicenseIds.has(row.rowKey) ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200"
                                }`}
                            >
                                <div className="absolute top-3 right-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedLicenseIds.has(row.rowKey)}
                                        onChange={() => handleToggleLicenseSelection(row.rowKey)}
                                    />
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 overflow-hidden">
                                        {logoSrc ? (
                                            <img
                                                key={`${row.rowKey}-card-${attempt}`}
                                                src={logoSrc}
                                                alt={row.tool}
                                                className="h-10 w-10 object-contain bg-white"
                                                loading="lazy"
                                                onError={() =>
                                                    setLogoAttemptByRowKey((prev) => ({
                                                        ...prev,
                                                        [row.rowKey]: attempt + 1,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <div className="w-4 h-4 bg-gray-300 rounded-full" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{row.tool}</p>
                                        <p className="text-xs text-slate-500 truncate">{row.vendor}</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}>
                                        {row.status}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Total:</span>
                                        <span className="font-semibold text-slate-800">{row.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Used:</span>
                                        <span className="font-semibold text-slate-800">{row.used}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Available:</span>
                                        <span className={clsx("font-semibold", row.available < 0 ? "text-red-600" : "text-slate-800")}>
                                            {row.available}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="bg-white px-6 py-4 flex items-center justify-between border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-500">
                    Showing {filteredData.length.toLocaleString()} of {activeLicenseRows.length.toLocaleString()} tools
                </span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Approved Category Data</span>
            </div>

            {actionToast && (
                <div className="fixed bottom-6 left-6 z-[60] bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-semibold">
                    {actionToast}
                </div>
            )}

            {isRemoveLicenseOpen && (
                <div
                    className="fixed inset-0 z-50 bg-gradient-to-br from-slate-200/70 via-slate-300/60 to-slate-400/60 backdrop-blur-[1px] flex items-center justify-center p-4"
                    onClick={() => {
                        setIsRemoveLicenseOpen(false);
                        setRemoveReason("");
                    }}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <form onSubmit={handleConfirmRemove} className="p-6 space-y-5">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Remove License</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedVisibleRows.length === 1
                                        ? `Provide a reason before deleting "${selectedVisibleRows[0].tool}".`
                                        : `Provide a reason before deleting ${selectedVisibleCount} selected licenses.`}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                                <textarea
                                    value={removeReason}
                                    onChange={(e) => setRemoveReason(e.target.value)}
                                    className="w-full min-h-[110px] rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="Enter reason for deletion..."
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRemoveLicenseOpen(false);
                                        setRemoveReason("");
                                    }}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-700 border border-blue-600 text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!removeReason.trim()}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteToast && (
                <div className="fixed bottom-6 right-6 z-[60] bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-semibold">
                    {deleteToast}
                </div>
            )}

            {isAddLicenseOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4"
                    onClick={() => {
                        setIsAddLicenseOpen(false);
                        resetAddLicenseForm();
                    }}
                >
                    <div
                        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <form onSubmit={handleSaveLicense} className="p-6 md:p-7 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Add License</h3>
                                <p className="text-sm text-slate-500 mt-1">Add new license allocation for a tool</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tool Name</label>
                                    <input
                                        type="text"
                                        value={addLicenseForm.toolName}
                                        onChange={(e) => {
                                            setAddLicenseForm((prev) => ({ ...prev, toolName: e.target.value }));
                                        }}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Enter tool name..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
                                    <input
                                        type="text"
                                        value={addLicenseForm.vendor}
                                        onChange={(e) => setAddLicenseForm((prev) => ({ ...prev, vendor: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Enter vendor"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Licenses</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={addLicenseForm.totalLicenses}
                                        onChange={(e) => setAddLicenseForm((prev) => ({ ...prev, totalLicenses: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        value={addLicenseForm.expiryDate}
                                        onChange={(e) => setAddLicenseForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">License Type</label>
                                    <select
                                        value={addLicenseForm.licenseType}
                                        onChange={(e) => setAddLicenseForm((prev) => ({ ...prev, licenseType: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">Select License Type</option>
                                        <option value="Subscription">Subscription</option>
                                        <option value="Perpetual">Perpetual</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddLicenseOpen(false);
                                        resetAddLicenseForm();
                                    }}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 border border-slate-300 text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
                                >
                                    Save License
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
