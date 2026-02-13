"use client";

import React, { useState } from 'react';
import { requestsData } from '@/data/mockData';
import Table from '@/components/Table';
import RequestDetailsSidebar from '@/components/RequestDetailsSidebar';
import { Search, Filter, Download, Clock, CheckCircle, Hourglass, AlertTriangle, CheckSquare, XSquare } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

// Simple Stat Card for this specific page layout
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center">
        <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mr-4", bgClass)}>
            <Icon className={clsx("w-6 h-6", colorClass)} />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default function RequestsPage() {
    const [currentRequests, setCurrentRequests] = useState(requestsData);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Requests');
    const [filterType, setFilterType] = useState('All Types');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterRisk, setFilterRisk] = useState('All Risks');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setSelectedIds([]); // Clear selection on action
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleApprove = (id) => {
        setCurrentRequests(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'Approved' } : item
        ));
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest(prev => ({ ...prev, status: 'Approved' }));
        }
        showNotification('Request approved successfully!');
    };

    const handleReject = (id) => {
        setCurrentRequests(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'Rejected' } : item
        ));
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest(prev => ({ ...prev, status: 'Rejected' }));
        }
        showNotification('Request rejected successfully!', 'error');
    };

    const handleBulkApprove = () => {
        setCurrentRequests(prev => prev.map(item =>
            selectedIds.includes(item.id) ? { ...item, status: 'Approved' } : item
        ));
        showNotification(`${selectedIds.length} requests approved successfully!`);
    };

    const handleBulkReject = () => {
        setCurrentRequests(prev => prev.map(item =>
            selectedIds.includes(item.id) ? { ...item, status: 'Rejected' } : item
        ));
        showNotification(`${selectedIds.length} requests rejected successfully!`, 'error');
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map(r => r.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
    };

    const closeSidebar = () => {
        setSelectedRequest(null);
    };

    // Filter Logic
    const filteredByTab = currentRequests.filter(item => {
        if (activeTab === 'All Pending (42)') return item.status === 'Pending';
        if (activeTab === 'Approved Requests') return item.status === 'Approved';
        if (activeTab === 'Reuse Requests') return item.type === 'Reuse';
        return true;
    });

    const filteredData = filteredByTab.filter(item => {
        const matchesSearch =
            item.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'All Types' || item.type === filterType;
        const matchesStatus = filterStatus === 'All Status' || item.status === filterStatus;
        const matchesRisk = filterRisk === 'All Risks' || (item.risk && item.risk === filterRisk);

        return matchesSearch && matchesType && matchesStatus && matchesRisk;
    });

    // Columns Configuration
    const columns = [
        {
            header: <input type="checkbox" checked={selectedIds.length === filteredData.length && filteredData.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />,
            accessor: 'selection',
            className: 'w-10',
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(row.id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            )
        },
        {
            header: 'Request ID',
            accessor: 'id',
            className: 'text-blue-600 font-medium',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(row);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none"
                >
                    {row.id}
                </button>
            )
        },
        {
            header: 'User',
            accessor: 'requester',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-700 font-bold text-xs">
                        {row.requester.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-900">{row.requester}</span>
                </div>
            )
        },
        { header: 'Tool', accessor: 'tool', className: 'text-gray-900 font-medium' },
        {
            header: 'Type',
            accessor: 'type',
            render: (row) => (
                <span className={clsx("font-medium", row.type === 'New' ? "text-purple-600" : "text-blue-600")}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                let colorClass = 'text-gray-500';
                if (row.status === 'Pending') colorClass = 'text-amber-600';
                if (row.status === 'Approved') colorClass = 'text-green-600';
                if (row.status === 'In Analysis') colorClass = 'text-blue-600';
                if (row.status === 'Risk') colorClass = 'text-red-600';
                return <span className={clsx("font-medium", colorClass)}>{row.status}</span>;
            }
        },
        { header: 'Department', accessor: 'department', className: 'text-gray-500' },
        { header: 'Date', accessor: 'date', className: 'text-gray-500' },
        {
            header: 'Action',
            accessor: 'action',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(row);
                    }}
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    Review
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
                    <p className="text-gray-500 mt-1">Manage and track all software acquisition and reuse requests</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-bold text-gray-900">Approval Velocity</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12% vs last week</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">1.8 Days</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">avg. turnaround</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-bold text-gray-900">Pending Value</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Pipeline</span>
                    </div>
                    <div className="flex items-baseline space-x-2 relative z-10">
                        <span className="text-3xl font-bold text-gray-900">$142,500</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">est. annual spend</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-bold text-gray-900">Policy Compliance</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Auto-Vetted</span>
                    </div>
                    <div className="flex items-baseline space-x-2 relative z-10">
                        <span className="text-3xl font-bold text-gray-900">94%</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">pre-screened requests</span>
                    </div>
                </div>
            </div>

            {/* Tabs & Sort */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-transparent pb-0">
                <div className="flex space-x-8">
                    {['All Requests', 'All Pending (42)', 'Approved Requests', 'Reuse Requests'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "pb-4 text-sm font-medium transition-colors relative",
                                activeTab === tab
                                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48">
                            <option>Date (Newest First)</option>
                            <option>Risk (High to Low)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-1">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID, User, Tool..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200" />

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>New</option>
                                <option>Reuse</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Risk</option>
                                <option>In Analysis</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Risk:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                            >
                                <option>All Risks</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('All Types');
                        setFilterStatus('All Status');
                        setFilterRisk('All Risks');
                    }}
                    className="text-blue-600 text-xs font-bold hover:text-blue-800 tracking-wider uppercase whitespace-nowrap"
                >
                    Clear Filters
                </button>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                    {selectedIds.length} items selected
                </span>
                <div className="flex space-x-3">
                    <button
                        onClick={handleBulkApprove}
                        disabled={selectedIds.length === 0}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                            selectedIds.length === 0
                                ? "bg-blue-100 text-white cursor-not-allowed opacity-80"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Selected
                    </button>
                    <button
                        onClick={handleBulkReject}
                        disabled={selectedIds.length === 0}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                            selectedIds.length === 0
                                ? "bg-red-100 text-white cursor-not-allowed opacity-80"
                                : "bg-red-600 text-white hover:bg-red-700"
                        )}
                    >
                        <XSquare className="w-4 h-4 mr-2" />
                        Reject Selected
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table columns={columns} data={filteredData} />

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-50">
                    <span className="text-sm font-medium text-gray-400">
                        Showing 1 to {filteredData.length > 7 ? 7 : filteredData.length} of {filteredData.length} total requests
                    </span>
                    <div className="flex items-center space-x-1">
                        <button className="px-3 py-1 border border-gray-100 rounded text-gray-400 hover:bg-gray-50 transition-colors">&lt;</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded shadow-sm font-bold">1</button>
                        <button className="px-3 py-1 border border-gray-100 rounded text-gray-400 hover:bg-gray-50 transition-colors">2</button>
                        <button className="px-3 py-1 border border-gray-100 rounded text-gray-400 hover:bg-gray-50 transition-colors">3</button>
                        <span className="px-2 text-gray-300">...</span>
                        <button className="px-3 py-1 border border-gray-100 rounded text-gray-400 hover:bg-gray-50 transition-colors">12</button>
                        <button className="px-3 py-1 border border-gray-100 rounded text-gray-400 hover:bg-gray-50 transition-colors">&gt;</button>
                    </div>
                </div>
            </div>
            {/* Request Details Sidebar */}
            <RequestDetailsSidebar
                isOpen={!!selectedRequest}
                onClose={closeSidebar}
                request={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
            />

            {/* Toast Notification */}
            {toast.show && (
                <div className={clsx(
                    "fixed bottom-6 right-6 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300",
                    toast.type === 'success' ? "bg-gray-900" : "bg-red-600"
                )}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    ) : (
                        <XSquare className="w-5 h-5 text-white mr-3" />
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
