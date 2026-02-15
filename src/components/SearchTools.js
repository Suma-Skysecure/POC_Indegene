"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, AlertCircle } from "lucide-react";

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

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const buildLicenseRequestLink = (tool) => {
        const params = new URLSearchParams({
            requestType: "new_license",
            toolId: tool.id,
            toolName: tool.softwareName,
            category: tool.category,
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
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {loading ? "Loading tools..." : `Tools Found (${total.toLocaleString()})`}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <th className="px-4 py-3">Software Name</th>
                                <th className="px-4 py-3">Version</th>
                                <th className="px-4 py-3">Manufacturer</th>
                                <th className="px-4 py-3">License Type</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Network ID</th>
                                <th className="px-4 py-3">Managed ID</th>
                                <th className="px-4 py-3">Software Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                            {!loading && !error && rows.map((tool) => (
                                <tr key={tool.id} className="hover:bg-gray-50/60">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                        <Link href={buildLicenseRequestLink(tool)} className="hover:text-blue-700 hover:underline">
                                            {tool.softwareName}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{tool.version}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{tool.manufacturer}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{tool.licenseType}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{tool.category}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tool.networkInstallations}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{tool.managedInstallations}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{tool.softwareType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
