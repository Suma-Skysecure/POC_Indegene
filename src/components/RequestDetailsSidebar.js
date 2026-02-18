"use client";

import React from 'react';
import { X, CheckCircle, RotateCcw, AlertTriangle, Shield, ExternalLink, FileText, Briefcase, Users, Layout, Clock, FileStack, Search } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default function RequestDetailsSidebar({ isOpen, onClose, request, onApprove, onReject, showActions = true }) {
    if (!isOpen || !request) return null;

    const overviewItems = [
        { label: 'Request Type', value: request.requestOverview?.type || 'New Tool Request', icon: FileStack },
        { label: 'Tool Required', value: request.requestOverview?.tool || request.tool, icon: Layout },
        { label: 'Vendor', value: request.requestOverview?.vendor || 'TBD', icon: Users },
        { label: 'Department', value: request.requestOverview?.department || request.department, icon: Briefcase },
        { label: 'Required Licenses', value: request.requestOverview?.licenses || 'TBD', icon: FileText },
        { label: 'Timeline', value: request.requestOverview?.timeline || 'Q1 2024 (3 months)', icon: Clock },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col h-full border-l border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                        <p className="text-sm text-gray-500">{request.id} • {request.date}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors mt-1"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">

                    {/* Requester Profile */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 flex items-center shadow-sm">
                        <div className="h-14 w-14 rounded-full bg-blue-100 overflow-hidden mr-4 flex items-center justify-center text-blue-700 font-bold text-xl">
                            {request.requester.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{request.userName || request.requester}</h3>
                            <p className="text-sm text-gray-500 font-medium">{request.role || 'Lead Data Scientist'} • {request.department}</p>
                            <p className="text-xs text-gray-500">User Name: {request.userName || request.requester || '-'}</p>
                            <p className="text-xs text-gray-500">User Email: {request.userEmail || request.formPayload?.userEmail || '-'}</p>
                        </div>
                    </div>

                    {/* Request Overview */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Request Overview
                        </h4>
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                            {overviewItems.map((item, idx) => (
                                <div key={idx} className={clsx(
                                    "flex items-center justify-between p-4",
                                    idx !== overviewItems.length - 1 && "border-b border-gray-50"
                                )}>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <item.icon className="w-4 h-4 mr-3" />
                                        <span>{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Use Case */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Use Case
                        </h4>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                {request.useCase || "No specific use case provided for this tool request."}
                            </p>
                        </div>
                    </div>

                    {/* Business Justification */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Business Justification
                        </h4>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                {request.justification || "No business justification provided for this tool request."}
                            </p>
                        </div>
                    </div>

                    {/* Equivalent Tools */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center">
                            <Search className="w-4 h-4 mr-2" />
                            Equivalent Tools Found
                        </h4>
                        <div className="space-y-3">
                            {(request.equivalentTools && request.equivalentTools.length > 0) ? (
                                request.equivalentTools.map((tool, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:border-blue-200 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center mr-4 border border-gray-100">
                                                {tool.icon ? <img src={tool.icon} className="h-6 w-6 object-contain grayscale" /> : <div className="w-4 h-4 bg-gray-300 rounded-full"></div>}
                                            </div>
                                            <span className="font-bold text-gray-800 text-sm">{tool.name}</span>
                                        </div>
                                        <span className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 font-bold rounded uppercase tracking-wider border border-gray-100">
                                            {tool.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    No equivalent tools found in catalog.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* License Status & Risk Posture */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">License Status</h4>
                            <div className="bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg flex items-center">
                                <X className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                                <span className="text-xs font-bold text-red-700">{request.licenseStatus || 'Not Available'}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk Posture</h4>
                            <div className="bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-lg flex items-center">
                                <AlertTriangle className="w-4 h-4 text-orange-500 mr-2 shrink-0" />
                                <span className="text-xs font-bold text-orange-700">{request.riskPosture || 'Medium'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                {showActions && (
                    <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                        {request.status === 'Approved' ? (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center mb-3">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                <span className="font-bold">Request Approved</span>
                            </div>
                        ) : request.status === 'Rejected' ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-center mb-3">
                                <X className="w-5 h-5 mr-2" />
                                <span className="font-bold">Request Rejected</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => onApprove(request.id)}
                                className="w-full bg-[#0047AB] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl mb-4 flex items-center justify-center transition-all shadow-lg shadow-blue-100"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Approve Request
                            </button>
                        )}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => onReject(request.id)}
                                className="flex-1 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-600 font-bold py-3 rounded-xl flex items-center justify-center transition-all"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                            </button>
                            <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl flex items-center justify-center transition-all">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reuse
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

