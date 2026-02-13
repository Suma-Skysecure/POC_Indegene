"use client";

import React, { useState } from 'react';
import { Info, ChevronDown, PlusCircle, Users, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toolsData as existingTools } from '@/data/toolsData';

// existingTools is now imported from @/data/toolsData


export default function CreateRequest() {
    const [requestType, setRequestType] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Search & Selection State
    const [toolSearch, setToolSearch] = useState('');
    const [selectedTool, setSelectedTool] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredTools = existingTools.filter(t =>
        t.name.toLowerCase().includes(toolSearch.toLowerCase())
    );

    const handleToolSelect = (tool) => {
        setSelectedTool(tool);
        setToolSearch(tool.name);
        setIsDropdownOpen(false);
    };

    const handleSubmit = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#E6F4EA] border border-[#34A853] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                        <div className="bg-[#34A853] p-1 rounded-full text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <p className="text-[#137333] font-bold text-sm">Submitted successfully!</p>
                    </div>
                </div>
            )}

            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Request</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Submit a request for a new license or a new software tool.</p>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                <div className="max-w-xl">
                    <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                        Request Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <select
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer group-hover:bg-white group-hover:border-gray-300"
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value)}
                        >
                            <option value="" disabled>Select request type...</option>
                            <option value="new_software">New Software Tool</option>
                            <option value="new_license">New License for Existing Software</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
                    </div>
                </div>

                {/* Conditional New Tool Form */}
                {requestType === 'new_software' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 text-[#002D72]">
                            <PlusCircle className="w-6 h-6" />
                            <h2 className="text-lg font-bold">New Tool Request</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Tool Name</label>
                                <input type="text" placeholder="e.g. Notion" className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Vendor</label>
                                <input type="text" placeholder="e.g. Notion Labs Inc." className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Business Justification <span className="text-red-500">*</span></label>
                                <span className="text-[10px] font-bold text-gray-300 uppercase">Required</span>
                            </div>
                            <textarea
                                rows={4}
                                placeholder="Explain why this software is needed for your role and how it benefits the team..."
                                className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-5 py-5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Number of Users</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input type="number" defaultValue={1} className="w-full bg-gray-50/30 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Urgency</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <select className="w-full bg-gray-50/30 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                        <option>Low - No immediate deadline</option>
                                        <option>Medium - Needed within 2 weeks</option>
                                        <option>High - Critical requirement</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 space-y-4">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-[#002D72] hover:bg-[#001D4A] text-white py-4.5 rounded-xl font-bold text-lg shadow-md transition-all active:scale-[0.99]"
                            >
                                Submit Request
                            </button>
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <ShieldCheck className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">This request will go through governance and approval workflow.</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Conditional New License Form */}
                {requestType === 'new_license' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Section Header: License Details */}
                        <div className="flex items-center gap-3 text-[#002D72]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h2 className="text-lg font-bold">License Details</h2>
                        </div>

                        {/* Metadata Box */}
                        <div className="bg-[#F4F7FB] rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Request ID</label>
                                <p className="text-[#002D72] font-bold text-sm">REQ-2024-00128</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Requestor</label>
                                <p className="text-[#002D72] font-bold text-sm">Alex Rivera</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">Business Unit</label>
                                <p className="text-[#002D72] font-bold text-sm">Engineering</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Tool Name <span className="text-red-500">*</span></label>
                                <div className="relative group/search">
                                    <input
                                        type="text"
                                        placeholder="Search and select tool..."
                                        className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        value={toolSearch}
                                        onChange={(e) => {
                                            setToolSearch(e.target.value);
                                            setIsDropdownOpen(true);
                                            if (selectedTool) setSelectedTool(null);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                    />
                                    {isDropdownOpen && toolSearch && filteredTools.length > 0 && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {filteredTools.map(tool => (
                                                <button
                                                    key={tool.id}
                                                    className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                                                    onClick={() => handleToolSelect(tool)}
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{tool.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{tool.category}</p>
                                                    </div>
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Application ID</label>
                                <input type="text" readOnly value={selectedTool?.id || '—'} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-gray-500 font-bold cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Application Category</label>
                                <input type="text" readOnly value={selectedTool?.category || '—'} className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-gray-500 font-bold cursor-not-allowed" />
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Department <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                        <option value="" disabled selected>Select department...</option>
                                        <option>Engineering</option>
                                        <option>Product Management</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Licenses Required <span className="text-red-500">*</span></label>
                                <input type="number" defaultValue={1} className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">License Type</label>
                                <input type="text" readOnly value="Per User" className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-gray-500 font-bold cursor-not-allowed" />
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">License Duration</label>
                                <input type="text" readOnly value="1 Year" className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-gray-500 font-bold cursor-not-allowed" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Cost Estimate</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedTool ? selectedTool.price.toFixed(2) : '0.00'}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-8 pr-4 py-3 text-gray-900 font-bold cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Cost Justification</label>
                                <textarea
                                    rows={2}
                                    placeholder="Explain why this license is needed and how it benefits the team..."
                                    className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-5 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Number of Users</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <input type="number" defaultValue={1} className="w-full bg-gray-50/30 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Urgency</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                    <select className="w-full bg-gray-50/30 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                                        <option>Low - No immediate deadline</option>
                                        <option>Medium - Needed within 2 weeks</option>
                                        <option>High - Critical requirement</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 space-y-4">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-[#002D72] hover:bg-[#001D4A] text-white py-4.5 rounded-xl font-bold text-lg shadow-md transition-all active:scale-[0.99]"
                            >
                                Submit Request
                            </button>
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <ShieldCheck className="w-4 h-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">This request will go through governance and approval workflow.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Informational Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-6">
                <div className="bg-blue-50 p-2.5 rounded-full text-blue-600 shrink-0">
                    <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-0.5">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">What happens next?</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                        Once submitted, your request is reviewed by IT Security and the Legal department. You can track the real-time status of your request in the <Link href="/user/my-requests" className="text-blue-600 font-bold hover:underline">My Requests</Link> tab.
                    </p>
                </div>
            </div>
        </div>
    );
}
