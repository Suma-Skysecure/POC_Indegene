"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Grid, List as ListIcon, Cloud, Info, X } from 'lucide-react';
import { toolsData, EQUIVALENTS } from '@/data/toolsData';

// Data is now imported from @/data/toolsData


export default function SearchTools() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [dismissedAlert, setDismissedAlert] = useState(false);

    const categories = ['All Categories', ...new Set(toolsData.map(tool => tool.category.split(' / ').pop()))];

    const filteredTools = toolsData.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' ||
            tool.category.toLowerCase().includes(selectedCategory.toLowerCase());
        return matchesSearch && matchesCategory;
    });

    const equivalentMatch = EQUIVALENTS[searchTerm.toLowerCase().trim()];
    const isEquivalentFound = !!equivalentMatch && filteredTools.length === 0;
    const isNoResultFound = searchTerm.length > 0 && filteredTools.length === 0 && !equivalentMatch;

    const displayTools = isEquivalentFound
        ? toolsData.filter(t => t.name === equivalentMatch.name)
        : filteredTools;

    const buildLicenseRequestLink = (tool) => {
        const params = new URLSearchParams({
            requestType: 'new_license',
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
            {/* Header */}
            <div className="flex items-center space-x-5">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#002D72] rounded-lg flex flex-col justify-center items-center gap-[3px] p-2">
                        <div className="w-full h-[2.5px] bg-white rounded-full opacity-60"></div>
                        <div className="w-full h-[2.5px] bg-white rounded-full"></div>
                        <div className="w-full h-[2.5px] bg-white rounded-full opacity-60"></div>
                    </div>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#002D72] tracking-tight">Search Tools</h1>
                    <p className="text-gray-500 text-sm font-medium">Browse and manage all purchased tools across the organization</p>
                </div>
            </div>

            {/* Search Box */}
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
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
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

            {/* Equivalent Banner */}
            {isEquivalentFound && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                    <button className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 opacity-100 transition-opacity">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <Cloud className="w-6 h-6" />
                        </div>
                        <div className="pt-0.5">
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-900 font-bold text-lg leading-tight">We don&apos;t have {searchTerm}</h3>
                                <span className="text-gray-400 font-semibold">•</span>
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Alternative found</span>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm font-medium leading-relaxed max-w-2xl">
                                <span className="text-[#002D72] font-bold">{equivalentMatch.name}</span> is an approved equivalent tool available in our catalogue.
                                Using approved tools speeds up the access process and ensures compliance.
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

            {/* No Alternative Found Banner */}
            {isNoResultFound && !dismissedAlert && (
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
                                <h3 className="text-gray-900 font-bold text-lg leading-tight">We don&apos;t have {searchTerm}</h3>
                                <span className="text-gray-400 font-semibold">•</span>
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">No Alternative found</span>
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

            {/* Content Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEquivalentFound ? `Equivalent Tools (${displayTools.length})` : searchTerm ? `Tools Found (${filteredTools.length})` : `Tools (${toolsData.length})`}
                    </h2>
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200/50">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayTools.map((tool) => (
                        <div key={tool.id} className={`bg-white rounded-3xl border ${tool.warning ? 'border-red-100 ring-1 ring-red-50' : 'border-gray-100'} shadow-sm p-7 flex flex-col justify-between group hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative`}>

                            <div className="space-y-6">
                                {/* Tool Header */}
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 bg-gray-50 rounded-2xl p-3 flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors">
                                        <img src={tool.icon} alt={tool.name} className="h-full w-full object-contain" />
                                    </div>
                                    <div className="pt-1">
                                        <h3 className="font-extrabold text-[#002D72] text-lg leading-tight group-hover:text-blue-600 transition-colors">{tool.name}</h3>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {tool.id} • {tool.category}</p>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div>
                                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-green-100/50">
                                        {tool.status}
                                    </span>
                                </div>

                                {/* Availability Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end text-[11px] font-bold uppercase tracking-widest">
                                        <div className="space-y-1">
                                            <span className="text-gray-400 block">License Availability</span>
                                            <span className="text-[#002D72] text-sm tabular-nums">
                                                <span className="font-black">{tool.available.toLocaleString()}</span>
                                                <span className="text-gray-300 mx-1">/</span>
                                                <span className="text-gray-400">{tool.totalLicenses.toLocaleString()} Available</span>
                                            </span>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-gray-400 block">Users</span>
                                            <span className="text-[#002D72] text-sm font-black tabular-nums">{tool.users.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${tool.warning ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-[#002D72]'}`}
                                            style={{ width: `${(tool.available / tool.totalLicenses) * 100}%` }}
                                        ></div>
                                    </div>

                                    {tool.warning && (
                                        <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                                            <Info className="w-3.5 h-3.5" />
                                            <p className="text-[10px] font-bold uppercase tracking-tight">{tool.warning}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8">
                                <Link
                                    href={buildLicenseRequestLink(tool)}
                                    className="block text-center w-full py-4 text-[#002D72] font-black text-sm border-2 border-[#002D72]/10 rounded-2xl hover:bg-[#002D72] hover:text-white hover:border-[#002D72] hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Request License
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Text */}
            <div className="pt-10 border-t border-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <p>© 2024 Enterprise Software Governance Portal</p>
                <div className="flex gap-6">
                    <button className="hover:text-gray-600 transition-colors">Privacy Policy</button>
                    <button className="hover:text-gray-600 transition-colors">Terms of Service</button>
                    <button className="hover:text-gray-600 transition-colors">Help Center</button>
                </div>
            </div>
        </div>
    );
}
