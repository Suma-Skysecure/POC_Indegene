"use client";

import React from 'react';
import { X, CheckCircle, RotateCcw, AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default function RequestDetailsSidebar({ isOpen, onClose, request }) {
    if (!isOpen || !request) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col h-full">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Request Details</h2>
                        <p className="text-sm text-gray-500">{request.id} • {request.date}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Requester Profile */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 mr-4">
                            <img
                                src={request.avatar}
                                alt={request.requester}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{request.requester}</h3>
                            <p className="text-sm text-gray-500">{request.role || 'Employee'} • {request.department}</p>
                        </div>
                    </div>

                    {/* Tool Requested */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
                            <span className="w-1 h-4 bg-blue-600 rounded-full mr-2"></span>
                            Tool Requested
                        </h4>
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-start mb-4">
                                <div className="h-12 w-12 rounded bg-gray-50 flex items-center justify-center mr-4 flex-shrink-0 border border-gray-200">
                                    {request.toolLogo ? (
                                        <img src={request.toolLogo} alt="Logo" className="h-8 w-8 object-contain" />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-400">{request.tool.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{request.tool}</h3>
                                    <p className="text-sm text-gray-500">{request.toolCategory}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {(request.toolTags || []).map((tag, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Business Justification */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
                            <span className="text-blue-600 mr-2 text-lg">“</span>
                            Business Justification
                        </h4>
                        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                            <p className="text-gray-700 italic leading-relaxed">
                                {request.justification ? `"${request.justification}"` : "No justification provided."}
                            </p>
                        </div>
                    </div>

                    {/* Equivalent Tools */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center">
                            <Shield className="w-4 h-4 text-blue-600 mr-2" />
                            Equivalent Tools Found
                        </h4>
                        <div className="space-y-3">
                            {(request.equivalentTools && request.equivalentTools.length > 0) ? (
                                request.equivalentTools.map((tool, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-gray-50 rounded flex items-center justify-center mr-3 border border-gray-200 p-1">
                                                {tool.icon ? <img src={tool.icon} className="h-full w-full object-contain" /> : <div className="w-4 h-4 bg-gray-300 rounded-full"></div>}
                                            </div>
                                            <span className="font-medium text-gray-900">{tool.name}</span>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                            {tool.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-gray-500 italic bg-gray-50 rounded border border-gray-200">
                                    No equivalent tools found in catalog.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg mb-3 flex items-center justify-center transition-colors shadow-md shadow-blue-200">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Request
                    </button>
                    <div className="flex space-x-3">
                        <button className="flex-1 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-700 font-medium py-2.5 rounded-lg flex items-center justify-center transition-all">
                            <X className="w-4 h-4 mr-2" />
                            Reject
                        </button>
                        <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg flex items-center justify-center transition-all">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reuse
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
