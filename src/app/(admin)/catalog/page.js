"use client";

import React, { useEffect, useState } from "react";
import { Search, Package, AlertCircle } from "lucide-react";

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
                        <option value="networkInstallations">Sort: Network Installations</option>
                        <option value="managedInstallations">Sort: Managed Installations</option>
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{tool.softwareName}</td>
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
    );
}
