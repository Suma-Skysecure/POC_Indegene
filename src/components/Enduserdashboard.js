"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, List, Mic, HelpCircle, CheckCircle, Cloud, X } from 'lucide-react';
import { toolsData as internalTools, EQUIVALENTS } from '@/data/toolsData';

const StatCard = ({ title, value, status, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
            <div className={`text-3xl font-bold mt-2 ${status === 'pending' ? 'text-blue-600' : status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                {value}
            </div>
        </div>
        <div className={`p-3 rounded-full ${status === 'pending' ? 'bg-blue-50 text-blue-600' : status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {icon}
        </div>
    </div>
);

// internalTools and EQUIVALENTS are now imported from @/data/toolsData


export default function Enduserdashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [dismissedAlert, setDismissedAlert] = useState(false);

    const filteredTools = internalTools.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const equivalentMatch = EQUIVALENTS[searchTerm.toLowerCase().trim()];
    const showSuggestions = searchTerm.length > 0 && filteredTools.length === 0 && !!equivalentMatch;
    const isNoResultFound = searchTerm.length > 0 && filteredTools.length === 0 && !equivalentMatch;

    const displayTools = showSuggestions
        ? internalTools.filter(t => t.name === equivalentMatch.name)
        : (searchTerm.length > 0 ? filteredTools : internalTools);

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header Text */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Real-time governance and tool utilization metrics</p>
                </div>
                <Link href="/user/request-new" className="bg-[#002D72] hover:bg-[#001D4A] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-md transition-all active:scale-95">
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                </Link>
            </div>

            {/* Big Search Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for a tool (e.g., Figma, Canva, Tableau)"
                        className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400 font-medium bg-gray-50/50"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setDismissedAlert(false);
                        }}
                    />
                    <Mic className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" />
                </div>

                {showSuggestions && (
                    <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                        <button
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-opacity"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div className="pt-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-gray-900 font-bold text-lg leading-tight">We don't have {searchTerm}</h3>
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

                {isNoResultFound && !dismissedAlert && (
                    <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 relative group">
                        <button
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-opacity"
                            onClick={() => setDismissedAlert(true)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div className="pt-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-gray-900 font-bold text-lg leading-tight">We don't have {searchTerm}</h3>
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
            </div>

            {/* Default Dashboard Content */}
            {!showSuggestions && (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Pending Requests" value="2" status="pending" icon={<div className="font-bold text-lg">?</div>} />
                        <StatCard title="Approved" value="5" status="approved" icon={<div className="font-bold text-lg">✓</div>} />
                        <StatCard title="Rejected" value="1" status="rejected" icon={<div className="font-bold text-lg">✕</div>} />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-extrabold text-[#002D72]">My Assigned Licenses</h2>
                            <button className="text-sm text-blue-600 font-bold hover:underline">View All</button>
                        </div>
                        <table className="w-full">
                            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">
                                <tr>
                                    <th className="px-8 py-4 text-left">Tool</th>
                                    <th className="px-8 py-4 text-left">Assigned Date</th>
                                    <th className="px-8 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 flex items-center">
                                        <div className="h-10 w-10 bg-gray-50 rounded-lg p-2 mr-4 border border-gray-100">
                                            <img src="https://cdn.worldvectorlogo.com/logos/playstation-logomark.svg" alt="PSN" className="h-full w-full object-contain" />
                                        </div>
                                        <span className="font-bold text-gray-900">PlayStation Network</span>
                                    </td>
                                    <td className="px-8 py-5 text-gray-500 font-medium text-sm">Oct 10, 2023</td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#E8F5E9] text-[#2E7D32] uppercase tracking-wider">Active</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Tools Area */}
            <div>
                <h2 className="text-lg font-extrabold text-[#002D72] mb-6">
                    {showSuggestions ? `Equivalent Tools (${displayTools.length})` : searchTerm ? `Tools Found (${filteredTools.length})` : 'Recommended Tools'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayTools.map((tool, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-14 w-14 bg-gray-50 rounded-xl p-3 flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors">
                                    <img src={tool.icon} alt={tool.name} className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-[#002D72] text-lg">{tool.name}</h3>
                                    <p className="text-xs text-gray-400 font-medium">{tool.vendor}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32]">
                                    {tool.status}
                                </span>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    {tool.available} Available
                                </span>
                            </div>
                            <button className="w-full py-3.5 font-extrabold text-sm rounded-xl border-2 border-[#002D72] text-[#002D72] hover:bg-[#F5F8FF] transition-all">
                                Request License
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
