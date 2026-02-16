"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Info, ChevronDown, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { addRequestFromFormAndSync } from '@/lib/requestStore';

function deriveRequestType(tool = {}) {
    const category = String(tool.category || '').toLowerCase();
    const licenseType = String(tool.licenseType || '').toLowerCase();
    const treatedAsExistingSoftware = category.includes('approved')
        || (licenseType && licenseType !== 'unidentified' && licenseType !== '-');
    return treatedAsExistingSoftware ? 'new_license' : 'new_software';
}

export default function CreateRequest() {
    const searchParams = useSearchParams();
    const requestedType = String(searchParams.get('requestType') || '').trim();
    const requestTypeFromQuery = requestedType === 'new_license' || requestedType === 'new_software'
        ? requestedType
        : deriveRequestType({
            category: searchParams.get('category'),
            licenseType: searchParams.get('licenseType'),
        });
    const initialRequiredLicenses = Number.parseInt(String(searchParams.get('users') || ''), 10);

    const [requestType, setRequestType] = useState(requestTypeFromQuery);
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState('');
    const [toolSuggestions, setToolSuggestions] = useState([]);
    const [showToolSuggestions, setShowToolSuggestions] = useState(false);
    const [toolSuggestionLoading, setToolSuggestionLoading] = useState(false);
    const suggestionTimerRef = useRef(null);
    const suggestionAbortRef = useRef(null);
    const [formData, setFormData] = useState({
        toolName: String(searchParams.get('toolName') || '').trim(),
        useCase: String(searchParams.get('useCase') || '').trim(),
        vendor: String(searchParams.get('vendor') || '').trim(),
        requiredLicenses: Number.isFinite(initialRequiredLicenses) && initialRequiredLicenses > 0
            ? initialRequiredLicenses
            : 1,
        timeline: '',
        department: String(searchParams.get('department') || '').trim(),
        businessJustification: '',
    });

    useEffect(() => () => {
        if (suggestionTimerRef.current) {
            clearTimeout(suggestionTimerRef.current);
        }
        if (suggestionAbortRef.current) {
            suggestionAbortRef.current.abort();
        }
    }, []);

    const fetchToolSuggestions = async (query) => {
        const trimmed = String(query || '').trim();
        const normalizedQuery = trimmed.toLowerCase();
        if (!trimmed) {
            setToolSuggestions([]);
            setShowToolSuggestions(false);
            setToolSuggestionLoading(false);
            return;
        }

        if (suggestionAbortRef.current) {
            suggestionAbortRef.current.abort();
        }

        const controller = new AbortController();
        suggestionAbortRef.current = controller;
        setToolSuggestionLoading(true);

        try {
            const params = new URLSearchParams({
                namePrefix: trimmed,
                sort: 'softwareName',
                order: 'asc',
                limit: '12',
                offset: '0',
            });
            const response = await fetch(`/api/software?${params.toString()}`, {
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            const seen = new Set();
            const suggestions = (Array.isArray(payload.items) ? payload.items : [])
                .filter((item) => String(item.softwareName || '').toLowerCase().includes(normalizedQuery))
                .filter((item) => {
                    const key = String(item.softwareName || '').toLowerCase();
                    if (!key || seen.has(key)) return false;
                    seen.add(key);
                    return true;
                })
                .map((item) => ({
                    id: item.id,
                    softwareName: item.softwareName || '',
                    manufacturer: item.manufacturer || '',
                    networkInstallations: item.networkInstallations,
                    category: item.category || '',
                    licenseType: item.licenseType || '',
                }));

            setToolSuggestions(suggestions);
            setShowToolSuggestions(suggestions.length > 0);

            const exactMatch = suggestions.find(
                (item) => String(item.softwareName).toLowerCase() === normalizedQuery
            );
            if (exactMatch) {
                applyToolData(exactMatch);
                setShowToolSuggestions(false);
            }
        } catch (fetchError) {
            if (fetchError.name !== 'AbortError') {
                setToolSuggestions([]);
                setShowToolSuggestions(false);
            }
        } finally {
            setToolSuggestionLoading(false);
        }
    };

    const queueToolSuggestions = (query) => {
        if (suggestionTimerRef.current) {
            clearTimeout(suggestionTimerRef.current);
        }
        suggestionTimerRef.current = setTimeout(() => {
            void fetchToolSuggestions(query);
        }, 250);
    };

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (field === 'toolName') {
            queueToolSuggestions(value);
        }
    };

    const applyToolData = (tool) => {
        setFormData((prev) => ({
            ...prev,
            toolName: tool.softwareName || prev.toolName,
            vendor: tool.manufacturer || prev.vendor,
            requiredLicenses: Number.isFinite(Number(tool.networkInstallations)) && Number(tool.networkInstallations) > 0
                ? Number(tool.networkInstallations)
                : prev.requiredLicenses,
        }));
        setRequestType(deriveRequestType(tool));
    };

    const applyToolSuggestion = (suggestion) => {
        applyToolData(suggestion);
        setShowToolSuggestions(false);
    };

    const handleSubmit = async () => {
        const isValid = requestType
            && formData.toolName.trim()
            && formData.useCase.trim()
            && formData.vendor.trim()
            && Number(formData.requiredLicenses) > 0
            && formData.timeline
            && formData.department
            && formData.businessJustification.trim();

        if (!isValid) {
            setError('Please fill all required fields before submitting.');
            return;
        }

        setError('');
        await addRequestFromFormAndSync({ requestType, formData });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setFormData({
            toolName: '',
            useCase: '',
            vendor: '',
            requiredLicenses: 1,
            timeline: '',
            department: '',
            businessJustification: '',
        });
        setRequestType('');
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {showToast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#E6F4EA] border border-[#34A853] px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                        <div className="bg-[#34A853] p-1 rounded-full text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold text-[#1B5E20]">
                            Your request has been submitted and is waiting for approval.
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Request</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">Submit a request for a new license or a new software tool.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}
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

                {requestType && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Tool Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.toolName}
                                        onChange={(e) => handleFieldChange('toolName', e.target.value)}
                                        onFocus={() => {
                                            if (toolSuggestions.length > 0) {
                                                setShowToolSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setShowToolSuggestions(false), 120);
                                        }}
                                        placeholder="e.g. Notion"
                                        className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                    {(showToolSuggestions || toolSuggestionLoading) && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                                            {toolSuggestionLoading && (
                                                <p className="px-4 py-3 text-sm text-gray-500">Searching tools...</p>
                                            )}
                                            {!toolSuggestionLoading && toolSuggestions.length === 0 && (
                                                <p className="px-4 py-3 text-sm text-gray-500">No matching tools found.</p>
                                            )}
                                            {!toolSuggestionLoading && toolSuggestions.length > 0 && (
                                                <ul className="max-h-60 overflow-auto">
                                                    {toolSuggestions.map((item) => (
                                                        <li key={item.id}>
                                                            <button
                                                                type="button"
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                onClick={() => applyToolSuggestion(item)}
                                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50"
                                                            >
                                                                <p className="text-sm font-semibold text-gray-900">{item.softwareName}</p>
                                                                <p className="text-xs text-gray-500">{item.manufacturer || 'Unknown vendor'}</p>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Vendor <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.vendor}
                                    onChange={(e) => handleFieldChange('vendor', e.target.value)}
                                    placeholder="e.g. Notion Labs Inc."
                                    className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Use Case <span className="text-red-500">*</span></label>
                            <textarea
                                rows={4}
                                value={formData.useCase}
                                onChange={(e) => handleFieldChange('useCase', e.target.value)}
                                placeholder="Describe the use case for this request..."
                                className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-5 py-5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Required Licenses <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    value={formData.requiredLicenses}
                                    onChange={(e) => handleFieldChange('requiredLicenses', e.target.value)}
                                    className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Timeline <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.timeline}
                                        onChange={(e) => handleFieldChange('timeline', e.target.value)}
                                        className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    >
                                        <option value="" disabled>Select timeline...</option>
                                        <option value="low">Low - No immediate deadline</option>
                                        <option value="medium">Medium - Needed within 2 weeks</option>
                                        <option value="high">High - Critical requirement</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Department <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={formData.department}
                                        onChange={(e) => handleFieldChange('department', e.target.value)}
                                        className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    >
                                        <option value="" disabled>Select department...</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Product Management">Product Management</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Business Justification <span className="text-red-500">*</span></label>
                                <span className="text-[10px] font-bold text-gray-300 uppercase">Required</span>
                            </div>
                            <textarea
                                rows={4}
                                value={formData.businessJustification}
                                onChange={(e) => handleFieldChange('businessJustification', e.target.value)}
                                placeholder="Explain why this request is needed for your role and how it benefits the team..."
                                className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-5 py-5 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 resize-none transition-all"
                            />
                        </div>

                        <div className="pt-6 space-y-4">
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-[#002D72] hover:bg-[#001D4A] text-white py-3 rounded-lg font-semibold text-base shadow-md transition-all active:scale-[0.99]"
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
