"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, AlertCircle, Shield, LayoutGrid, List } from "lucide-react";

export default function SearchTools() {
    const [searchInput, setSearchInput] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedLicense, setSelectedLicense] = useState("");
    const [sortBy, setSortBy] = useState("rowIndex");
    const [sortOrder, setSortOrder] = useState("asc");
    const [limit, setLimit] = useState(50);
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [facets, setFacets] = useState({ categories: [], softwareTypes: [], licenseTypes: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [logoAttemptById, setLogoAttemptById] = useState({});

    useEffect(() => {
        const handle = setTimeout(() => {
            setDebouncedQuery(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(handle);
    }, [searchInput]);

    useEffect(() => {
        const controller = new AbortController();
        const offset = (page - 1) * limit;
        const params = new URLSearchParams({
            q: debouncedQuery,
            category: selectedCategory,
            type: selectedType,
            license: selectedLicense,
            sort: sortBy,
            order: sortOrder,
            limit: String(limit),
            offset: String(offset),
        });

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`/api/software?${params.toString()}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload = await response.json();
                setRows(Array.isArray(payload.items) ? payload.items : []);
                setTotal(Number(payload.total) || 0);
                setFacets(payload.facets || { categories: [], softwareTypes: [], licenseTypes: [] });
            } catch (fetchError) {
                if (fetchError.name === "AbortError") return;
                setError(fetchError.message || "Failed to load software data");
                setRows([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [debouncedQuery, selectedCategory, selectedType, selectedLicense, sortBy, sortOrder, limit, page]);

    useEffect(() => {
        setLogoAttemptById({});
    }, [rows]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

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
            toolName: tool.softwareName,
            vendor: tool.manufacturer || "",
            category: tool.category,
            licenseType: tool.licenseType || "",
            softwareType: tool.softwareType || "",
            users: String(tool.networkInstallations ?? 1),
        });
        return `/user/request-new?${params.toString()}`;
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-12">
            <div className="flex items-center space-x-5">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#002D72] rounded-lg flex flex-col justify-center items-center gap-[3px] p-2">
                        <div className="w-full h-[2.5px] bg-white rounded-full opacity-60" />
                        <div className="w-full h-[2.5px] bg-white rounded-full" />
                        <div className="w-full h-[2.5px] bg-white rounded-full opacity-60" />
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#002D72] tracking-tight">Search Tools</h1>
                    <p className="text-gray-500 text-sm font-medium">
                        Browse and manage all purchased tools across the organization
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,45,114,0.08)] border border-gray-100 space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="w-full pl-12 pr-4 py-4.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 font-medium placeholder-gray-400"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <select
                                className="appearance-none flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer pr-10"
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
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select
                                className="appearance-none flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer pr-10"
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All Types</option>
                                {facets.softwareTypes.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.value} ({item.count})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <select
                                className="appearance-none flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer pr-10"
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
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm flex-wrap justify-end">
                        <span className="text-gray-400">Sort by:</span>
                        <select
                            className="appearance-none px-3 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="rowIndex">Original Order</option>
                            <option value="softwareName">Software Name</option>
                            <option value="version">Version</option>
                            <option value="manufacturer">Manufacturer</option>
                            <option value="category">Category</option>
                            <option value="networkInstallations">Network Installations</option>
                            <option value="managedInstallations">Managed Installations</option>
                        </select>
                        <select
                            className="appearance-none px-3 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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
                            className="appearance-none px-3 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {loading ? "Software Inventory" : `Software Inventory (${total.toLocaleString()})`}
                    </h2>
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

                {viewMode === "list" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-[0.08em] font-bold">
                                <th className="px-4 py-3.5">Software Name</th>
                                <th className="px-4 py-3.5">Version</th>
                                <th className="px-4 py-3.5">Manufacturer</th>
                                <th className="px-4 py-3.5">License Type</th>
                                <th className="px-4 py-3.5">Category</th>
                                <th className="px-4 py-3.5">Network ID</th>
                                <th className="px-4 py-3.5">Managed ID</th>
                                <th className="px-4 py-3.5">Software Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                                        Loading software catalog...
                                    </td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8">
                                        <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-medium">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No software found for the selected filters.
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && rows.map((tool) => {
                                const badge = getCategoryBadge(tool.category);
                                const logoCandidates = getLogoCandidates(tool);
                                const logoAttempt = logoAttemptById[tool.id] || 0;
                                const logoSrc = logoCandidates[logoAttempt] || "";
                                return (
                                <tr key={tool.id} className="hover:bg-slate-50/70">
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
                                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{tool.networkInstallations}</td>
                                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{tool.managedInstallations}</td>
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
                        {!loading && !error && rows.map((tool) => {
                            const categoryBadge = getCategoryBadge(tool.category, true);
                            const logoCandidates = getLogoCandidates(tool);
                            const logoAttempt = logoAttemptById[tool.id] || 0;
                            const logoSrc = logoCandidates[logoAttempt] || "";
                            return (
                                <Link
                                    key={tool.id}
                                    href={buildRequestLink(tool)}
                                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
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
                                            <p className="text-sm font-semibold text-slate-900 truncate">{tool.softwareName}</p>
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
                                        <div className="flex justify-between"><span>Network ID:</span><span className="font-semibold text-slate-800">{tool.networkInstallations}</span></div>
                                        <div className="flex justify-between"><span>Managed ID:</span><span className="font-semibold text-slate-800">{tool.managedInstallations}</span></div>
                                        <div className="flex justify-between"><span>Type:</span><span className="font-semibold text-slate-800">{tool.softwareType}</span></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-500">
                        Showing {rows.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()}
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
            </div>

            <div className="pt-10 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <p>&copy; 2024 Enterprise Software Governance Portal</p>
                <div className="flex gap-6">
                    <button className="hover:text-gray-600 transition-colors">Privacy Policy</button>
                    <button className="hover:text-gray-600 transition-colors">Terms of Service</button>
                    <button className="hover:text-gray-600 transition-colors">Help Center</button>
                </div>
            </div>
        </div>
    );
}
