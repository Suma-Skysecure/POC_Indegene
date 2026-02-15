"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Grid, List as ListIcon, Cloud, X } from "lucide-react";
import { toolsData, EQUIVALENTS } from "@/data/toolsData";

export default function SearchTools() {
    const [searchTerm, setSearchTerm] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [dismissedAlert, setDismissedAlert] = useState(false);

    const categories = ["All Categories", ...new Set(toolsData.map((tool) => tool.category.split(" / ").pop()))];

    const normalizedQuery = searchTerm.trim().toLowerCase();
    const categoryFilteredTools = toolsData.filter((tool) =>
        selectedCategory === "All Categories"
            ? true
            : tool.category.toLowerCase().includes(selectedCategory.toLowerCase())
    );

    const exactMatches = normalizedQuery
        ? categoryFilteredTools.filter((tool) => tool.name.toLowerCase() === normalizedQuery)
        : categoryFilteredTools;

    const scoreRelated = (tool, query) => {
        if (!query) return 0;
        const name = tool.name.toLowerCase();
        const category = tool.category.toLowerCase();
        const tokens = query.split(/\s+/).filter(Boolean);
        let score = 0;

        if (name === query) score += 200;
        if (name.startsWith(query)) score += 80;
        if (name.includes(query)) score += 60;
        if (category.includes(query)) score += 20;
        tokens.forEach((token) => {
            if (name.includes(token)) score += 12;
            if (category.includes(token)) score += 5;
        });

        return score;
    };

    const rankedRelatedMatches = normalizedQuery
        ? categoryFilteredTools
            .map((tool) => ({ tool, score: scoreRelated(tool, normalizedQuery) }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.tool)
        : categoryFilteredTools;

    const mappedEquivalentName = EQUIVALENTS[normalizedQuery]?.name;
    const mappedEquivalentTool = mappedEquivalentName
        ? categoryFilteredTools.find((tool) => tool.name.toLowerCase() === mappedEquivalentName.toLowerCase())
        : null;

    const relatedMatches = mappedEquivalentTool
        ? [
            mappedEquivalentTool,
            ...rankedRelatedMatches.filter((tool) => tool.id !== mappedEquivalentTool.id),
        ]
        : rankedRelatedMatches;

    const isSearchCommitted = submittedQuery.length > 0 && submittedQuery === normalizedQuery;
    const isExactFound = normalizedQuery.length > 0 && exactMatches.length > 0;
    const isRelatedFound = normalizedQuery.length > 0 && !isExactFound && relatedMatches.length > 0;
    const isNoResultFound = normalizedQuery.length > 0 && !isExactFound && relatedMatches.length === 0;
    const showRelatedAlert = isSearchCommitted && isRelatedFound;
    const showNoResultAlert = isSearchCommitted && isNoResultFound;
    const displayTools = isExactFound ? exactMatches : relatedMatches;
    const topRelatedTool = isRelatedFound ? relatedMatches[0] : null;

    const buildLicenseRequestLink = (tool) => {
        const params = new URLSearchParams({
            requestType: "new_license",
            toolId: tool.id,
            toolName: tool.name,
            category: tool.category,
            price: String(tool.price ?? 0),
            users: String(tool.users ?? 1),
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
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setDismissedAlert(false);
                            setSubmittedQuery("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSubmittedQuery(searchTerm.trim().toLowerCase());
                            }
                        }}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                All Types
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <div className="relative group">
                            <select
                                className="appearance-none flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer pr-10"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                All Vendors
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">Sort by:</span>
                        <button className="font-bold text-gray-900 flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            Newest Added
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>

            {showRelatedAlert && !dismissedAlert && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                    <button
                        onClick={() => setDismissedAlert(true)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 opacity-100 transition-opacity"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <div className="pt-0.5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-900 font-bold text-lg leading-tight">We don&apos;t have &quot;{searchTerm}&quot;</h3>
                                <span className="text-gray-400 font-semibold">&bull;</span>
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Alternative found</span>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm font-medium leading-relaxed max-w-2xl">
                                <span className="text-[#1E40AF] font-bold">{topRelatedTool?.name}</span> The most relevant tool should be:
                                highest similarity score or best partial match.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-[#002D72] hover:bg-[#001D4A] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">
                            Request Equivalent
                        </button>
                        <button className="text-gray-600 hover:bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95">
                            New Tool Request
                        </button>
                    </div>
                </div>
            )}

            {showNoResultAlert && !dismissedAlert && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                    <button
                        onClick={() => setDismissedAlert(true)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 opacity-100 transition-opacity"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <div className="pt-0.5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-900 font-bold text-lg leading-tight">We don&apos;t have &quot;{searchTerm}&quot;</h3>
                                <span className="text-gray-400 font-semibold">&bull;</span>
                                <span className="text-gray-400 font-bold tracking-wider text-[10px]">No Alternative found</span>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm font-medium leading-relaxed max-w-2xl">
                                We could not find any approved or reusable tool matching your request in the current catalogue.
                                To proceed, please raise a New Tool Request.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/user/request-new" className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                            New Tool Request
                        </Link>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {normalizedQuery
                            ? `Tools Found (${displayTools.length})`
                            : `Tools Available (${toolsData.length})`}
                    </h2>
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200/50">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayTools.map((tool) => (
                        <div key={tool.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col min-h-[320px] group hover:shadow-lg hover:border-blue-100 transition-all duration-300 relative">
                            <div className="space-y-5 flex-1">
                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 bg-gray-50 rounded-xl p-2.5 flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors">
                                        <img src={tool.icon} alt={tool.name} className="h-full w-full object-contain" />
                                    </div>
                                    <div className="pt-0.5">
                                        <h3 className="font-extrabold text-[#002D72] text-base leading-tight group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {tool.id} &bull; {tool.category}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-green-100/50">
                                        {tool.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[11px] font-bold uppercase tracking-widest">
                                        <div className="space-y-1">
                                            <span className="text-gray-400 block">Users</span>
                                            <span className="text-[#002D72] text-sm font-black tabular-nums">{tool.users.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <Link
                                    href={buildLicenseRequestLink(tool)}
                                    className="block text-center w-full py-3 text-[#002D72] font-black text-sm border-2 border-[#002D72]/10 rounded-xl hover:bg-[#002D72] hover:text-white hover:border-[#002D72] hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Request License
                                </Link>
                            </div>
                        </div>
                    ))}
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
