"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Package, AlertCircle, Shield, LayoutGrid, List, Plus } from "lucide-react";
import { useCatalogData } from "@/lib/useCatalogData";

export default function CatalogPage() {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedLicense, setSelectedLicense] = useState("");
    const [sortBy, setSortBy] = useState("rowIndex");
    const [sortOrder, setSortOrder] = useState("asc");
    const [limit, setLimit] = useState(50);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState("grid");
    const [logoAttemptById, setLogoAttemptById] = useState({});
    const [selectedToolIds, setSelectedToolIds] = useState(new Set());
    const [removedToolIds, setRemovedToolIds] = useState(new Set());
    const [isAddToolOpen, setIsAddToolOpen] = useState(false);
    const [isRemoveToolOpen, setIsRemoveToolOpen] = useState(false);
    const [removeReason, setRemoveReason] = useState("");
    const [deleteToast, setDeleteToast] = useState("");
    const [actionToast, setActionToast] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [newToolForm, setNewToolForm] = useState({
        softwareName: "",
        version: "",
        manufacturer: "",
        totalLicense: "",
        licenseType: "",
        category: "",
        softwareType: "",
    });
    const offset = (page - 1) * limit;

    const {
        items: rows,
        total,
        facets,
        loading,
        error,
    } = useCatalogData({
        q: debouncedQuery,
        category: selectedCategory,
        type: selectedType,
        license: selectedLicense,
        sort: sortBy,
        order: sortOrder,
        limit,
        offset,
        refreshKey,
    });

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedQuery(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [searchInput]);

    useEffect(() => {
        setLogoAttemptById({});
    }, [rows]);

    useEffect(() => {
        if (!isAddToolOpen && !isRemoveToolOpen) return;
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            setIsAddToolOpen(false);
            setIsRemoveToolOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isAddToolOpen, isRemoveToolOpen]);

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

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const visibleRows = rows.filter((tool) => !removedToolIds.has(tool.id));
    const selectedVisibleRows = visibleRows.filter((tool) => selectedToolIds.has(tool.id));
    const selectedVisibleCount = visibleRows.filter((tool) => selectedToolIds.has(tool.id)).length;
    const isAllVisibleSelected = visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
    const displayTotal = Math.max(total - removedToolIds.size, 0);

    const normalizeCategory = (value) => {
        const category = String(value || "").trim().toLowerCase();
        if (category === "approved") return "Approved Softwares";
        if (category === "other tools") return "Other Tools";
        if (category === "internet") return "Internet";
        if (category === "not assigned") return "Not Assigned";
        if (category === "pending") return "Pending";
        return value || "-";
    };

    const handleAddToolSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch("/api/software", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    softwareName: newToolForm.softwareName,
                    version: newToolForm.version,
                    manufacturer: newToolForm.manufacturer,
                    networkInstallations: Number(newToolForm.totalLicense) || 0,
                    managedInstallations: 0,
                    licenseType: newToolForm.licenseType,
                    category: normalizeCategory(newToolForm.category),
                    softwareType: newToolForm.softwareType,
                }),
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            setActionToast(`"${newToolForm.softwareName}" added successfully`);
            setRefreshKey((value) => value + 1);
        } catch {
            setActionToast("Failed to add tool");
        } finally {
            setIsAddToolOpen(false);
            setNewToolForm({
                softwareName: "",
                version: "",
                manufacturer: "",
                totalLicense: "",
                licenseType: "",
                category: "",
                softwareType: "",
            });
        }
    };

    const handleToggleToolSelection = (toolId) => {
        setSelectedToolIds((prev) => {
            const next = new Set(prev);
            if (next.has(toolId)) {
                next.delete(toolId);
            } else {
                next.add(toolId);
            }
            return next;
        });
    };

    const handleToggleSelectAllVisible = (checked) => {
        setSelectedToolIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                visibleRows.forEach((tool) => next.add(tool.id));
            } else {
                visibleRows.forEach((tool) => next.delete(tool.id));
            }
            return next;
        });
    };

    const handleRemoveSelected = () => {
        if (selectedVisibleCount === 0) return;
        setIsRemoveToolOpen(true);
    };

    const handleConfirmRemove = async (event) => {
        event.preventDefault();
        if (selectedVisibleCount === 0) return;
        const selectedRows = selectedVisibleRows;
        const selectedIds = selectedRows.map((tool) => tool.id);
        setRemovedToolIds((prev) => {
            const next = new Set(prev);
            selectedRows.forEach((tool) => {
                next.add(tool.id);
            });
            return next;
        });
        setSelectedToolIds((prev) => {
            const next = new Set(prev);
            selectedRows.forEach((tool) => next.delete(tool.id));
            return next;
        });
        setIsRemoveToolOpen(false);
        setRemoveReason("");
        try {
            await fetch("/api/admin/catalog", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            });
            setRefreshKey((value) => value + 1);
        } catch {
            // keep optimistic UI deletion even if API call fails
        }
        if (selectedRows.length === 1) {
            setDeleteToast(`"${selectedRows[0].softwareName}" deleted successfully`);
        } else if (selectedRows.length > 1) {
            setDeleteToast(`"${selectedRows[0].softwareName}" and ${selectedRows.length - 1} more deleted successfully`);
        }
    };

    const getLogoCandidates = (tool) => {
        const domain = String(tool.logoDomain || "").trim().toLowerCase();
        if (!domain) return [];
        return [
            `/api/logo?domain=${encodeURIComponent(domain)}`,
            `https://logo.clearbit.com/${domain}`,
            `https://unavatar.io/${domain}`,
            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
        ];
    };

    const getCategoryBadge = (category, fullLabel = false) => {
        const normalized = String(category || "").trim();
        const lower = normalized.toLowerCase();
        if (lower.includes("approved")) {
            return {
                label: fullLabel ? "Approved Softwares" : "Approved",
                className: "bg-emerald-100 text-emerald-700",
            };
        }
        if (lower.includes("not assigned")) {
            return {
                label: "Not Assigned",
                className: "bg-slate-100 text-slate-600",
            };
        }
        return {
            label: normalized || "-",
            className: "bg-slate-100 text-slate-600",
        };
    };

    const getRequestType = (tool) => {
        const category = String(tool.category || "").toLowerCase();
        const licenseType = String(tool.licenseType || "").toLowerCase();
        const treatedAsExistingSoftware = category.includes("approved")
            || (licenseType && licenseType !== "unidentified" && licenseType !== "-");
        return treatedAsExistingSoftware ? "new_license" : "new_software";
    };

    const buildRequestLink = (tool) => {
        const params = new URLSearchParams({
            requestType: getRequestType(tool),
            toolId: tool.id,
            toolName: tool.softwareName || "",
            vendor: tool.manufacturer || "",
            users: String(tool.networkInstallations ?? 1),
            category: tool.category || "",
            licenseType: tool.licenseType || "",
            softwareType: tool.softwareType || "",
        });
        return `/user/request-new?${params.toString()}`;
    };

    const getDummyLicenseMetrics = (index) => {
        const total = 100 + (index % 6) * 25;
        const used = Math.max(0, total - (10 + (index % 5) * 7));
        return {
            total,
            used,
            available: total - used,
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Tools Catalogue</h1>
                    </div>
                    <p className="text-gray-500 mt-1 ml-11">Browse and manage all purchased tools across the organization</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddToolOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tool
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tools by name, vendor, or category..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 text-gray-900 placeholder:text-gray-500 font-medium"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        {facets.categories.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.value} ({item.count})
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Departments</option>
                        {facets.softwareTypes.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.value} ({item.count})
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={selectedLicense}
                        onChange={(e) => {
                            setSelectedLicense(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Licenses</option>
                        {facets.licenseTypes.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.value} ({item.count})
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="rowIndex">Sort: Original Order</option>
                        <option value="softwareName">Sort: Software Name</option>
                        <option value="version">Sort: Version</option>
                        <option value="manufacturer">Sort: Manufacturer</option>
                        <option value="category">Sort: Category</option>
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={sortOrder}
                        onChange={(e) => {
                            setSortOrder(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {loading ? "Software Inventory" : `Software Inventory (${displayTotal.toLocaleString()})`}
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
                    <button
                        type="button"
                        onClick={handleRemoveSelected}
                        disabled={selectedVisibleCount === 0}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Remove Tool
                    </button>
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

            {viewMode === "list" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-[0.08em] font-bold">
                            <th className="px-4 py-3.5">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    checked={isAllVisibleSelected}
                                    onChange={(e) => handleToggleSelectAllVisible(e.target.checked)}
                                />
                            </th>
                            <th className="px-4 py-3.5">Software Name</th>
                            <th className="px-4 py-3.5">Version</th>
                            <th className="px-4 py-3.5">Manufacturer</th>
                            <th className="px-4 py-3.5">License Type</th>
                            <th className="px-4 py-3.5">Category</th>
                            <th className="px-4 py-3.5">Total</th>
                            <th className="px-4 py-3.5">Used</th>
                            <th className="px-4 py-3.5">Available</th>
                            <th className="px-4 py-3.5">Software Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                                    Loading software catalog...
                                </td>
                            </tr>
                        )}
                        {!loading && error && (
                            <tr>
                                <td colSpan={10} className="px-4 py-8">
                                    <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-medium">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && !error && rows.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                                    No software found for the selected filters.
                                </td>
                            </tr>
                        )}
                        {!loading && !error && visibleRows.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                                    No software available after removal.
                                </td>
                            </tr>
                        )}
                        {!loading && !error && visibleRows.map((tool, index) => {
                            const badge = getCategoryBadge(tool.category);
                            const logoCandidates = getLogoCandidates(tool);
                            const logoAttempt = logoAttemptById[tool.id] || 0;
                            const logoSrc = logoCandidates[logoAttempt] || "";
                            const metrics = getDummyLicenseMetrics(index);
                            return (
                            <tr key={tool.id} className="hover:bg-slate-50/70">
                                <td className="px-4 py-3.5">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedToolIds.has(tool.id)}
                                        onChange={() => handleToggleToolSelection(tool.id)}
                                    />
                                </td>
                                <td className="px-4 py-3.5 text-sm font-semibold text-slate-900">
                                    <Link href={buildRequestLink(tool)} className="group inline-flex items-start gap-2.5 hover:text-blue-700">
                                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 overflow-hidden">
                                            {logoSrc ? (
                                                <img
                                                    key={`${tool.id}-table-${logoAttempt}`}
                                                    src={logoSrc}
                                                    alt={`${tool.manufacturer} logo`}
                                                    className="h-5 w-5 object-contain bg-white"
                                                    loading="lazy"
                                                    onError={() => {
                                                        setLogoAttemptById((prev) => ({ ...prev, [tool.id]: logoAttempt + 1 }));
                                                    }}
                                                />
                                            ) : (
                                                <Shield className="h-3 w-3" />
                                            )}
                                        </span>
                                        <span className="leading-5 group-hover:underline">{tool.softwareName}</span>
                                    </Link>
                                </td>
                                <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{tool.version}</td>
                                <td className="px-4 py-3.5 text-xs text-slate-600 leading-5">{tool.manufacturer}</td>
                                <td className="px-4 py-3.5 text-xs text-slate-600">{tool.licenseType}</td>
                                <td className="px-4 py-3.5 text-xs text-slate-700">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-semibold ${badge.className}`}>
                                        {badge.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{metrics.total}</td>
                                <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{metrics.used}</td>
                                <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{metrics.available}</td>
                                <td className="px-4 py-3.5 text-xs text-slate-600">{tool.softwareType}</td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
            )}

            {viewMode === "grid" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading && (
                        <div className="col-span-full bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500 text-center">
                            Loading software catalog...
                        </div>
                    )}
                    {!loading && error && (
                        <div className="col-span-full bg-white rounded-xl border border-red-200 p-6 text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}
                    {!loading && !error && rows.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500 text-center">
                            No software found for the selected filters.
                        </div>
                    )}
                    {!loading && !error && visibleRows.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500 text-center">
                            No software available after removal.
                        </div>
                    )}
                    {!loading && !error && visibleRows.map((tool) => {
                        const categoryBadge = getCategoryBadge(tool.category, true);
                        const logoCandidates = getLogoCandidates(tool);
                        const logoAttempt = logoAttemptById[tool.id] || 0;
                        const logoSrc = logoCandidates[logoAttempt] || "";
                        return (
                            <div
                                key={tool.id}
                                className={`relative bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
                                    selectedToolIds.has(tool.id) ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200"
                                }`}
                            >
                                <div className="absolute top-3 right-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedToolIds.has(tool.id)}
                                        onChange={() => handleToggleToolSelection(tool.id)}
                                    />
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 overflow-hidden">
                                        {logoSrc ? (
                                            <img
                                                key={`${tool.id}-${logoAttempt}`}
                                                src={logoSrc}
                                                alt={`${tool.manufacturer} logo`}
                                                className="h-8 w-8 object-contain bg-white"
                                                loading="lazy"
                                                onError={() => {
                                                    setLogoAttemptById((prev) => ({ ...prev, [tool.id]: logoAttempt + 1 }));
                                                }}
                                            />
                                        ) : (
                                            <Shield className="h-4 w-4" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <Link href={buildRequestLink(tool)} className="text-sm font-semibold text-slate-900 truncate hover:text-blue-700 hover:underline block pr-6">
                                            {tool.softwareName}
                                        </Link>
                                        <p className="text-xs text-slate-500">Version {tool.version}</p>
                                        <p className="text-xs text-slate-500 truncate">{tool.manufacturer}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold bg-slate-100 text-slate-600">
                                        {tool.licenseType}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${categoryBadge.className}`}>
                                        {categoryBadge.label}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between"><span>Type:</span><span className="font-semibold text-slate-800">{tool.softwareType}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex items-center justify-between text-sm">
                <p className="text-gray-500">
                    Showing {visibleRows.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min((page - 1) * limit + visibleRows.length, displayTotal)} of {displayTotal.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    >
                        Previous
                    </button>
                    <span className="text-gray-700 font-medium">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-50"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                    >
                        Next
                    </button>
                </div>
            </div>

            {isAddToolOpen && (
                <div
                    className="fixed inset-0 z-50 bg-gradient-to-br from-slate-200/70 via-slate-300/60 to-slate-400/60 backdrop-blur-[1px] flex items-center justify-center p-4"
                    onClick={() => setIsAddToolOpen(false)}
                >
                    <div
                        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <form onSubmit={handleAddToolSubmit} className="p-6 md:p-7 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Add Tool</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Software Name</label>
                                    <input
                                        type="text"
                                        value={newToolForm.softwareName}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, softwareName: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Version</label>
                                    <input
                                        type="text"
                                        value={newToolForm.version}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, version: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer</label>
                                    <input
                                        type="text"
                                        value={newToolForm.manufacturer}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, manufacturer: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total License</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={newToolForm.totalLicense}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, totalLicense: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">License Type</label>
                                    <select
                                        value={newToolForm.licenseType}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, licenseType: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">Select License Type</option>
                                        <option value="Unidentified">Unidentified</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Non Commercial">Non Commercial</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <select
                                        value={newToolForm.category}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, category: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Internet">Internet</option>
                                        <option value="Other Tools">Other Tools</option>
                                        <option value="Not Assigned">Not Assigned</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Software Type</label>
                                    <select
                                        value={newToolForm.softwareType}
                                        onChange={(e) => setNewToolForm((prev) => ({ ...prev, softwareType: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        required
                                    >
                                        <option value="">Select Software Type</option>
                                        <option value="Desktop Apps">Desktop Apps</option>
                                        <option value="Web Apps">Web Apps</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddToolOpen(false)}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-blue-700 border border-blue-600 text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRemoveToolOpen && (
                <div
                    className="fixed inset-0 z-50 bg-gradient-to-br from-slate-200/70 via-slate-300/60 to-slate-400/60 backdrop-blur-[1px] flex items-center justify-center p-4"
                    onClick={() => {
                        setIsRemoveToolOpen(false);
                        setRemoveReason("");
                    }}
                >
                    <div
                        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <form onSubmit={handleConfirmRemove} className="p-6 space-y-5">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Remove Tool</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedVisibleRows.length === 1
                                        ? `Provide a reason before deleting "${selectedVisibleRows[0].softwareName}".`
                                        : `Provide a reason before deleting ${selectedVisibleCount} selected tools.`}
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
                                        setIsRemoveToolOpen(false);
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

            {actionToast && (
                <div className="fixed bottom-6 left-6 z-[60] bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-semibold">
                    {actionToast}
                </div>
            )}
        </div>
    );
}
