"use client";

import React, { useState } from 'react';
import KPICard from '@/components/KPICard';
import Table from '@/components/Table';
import RequestDetailsSidebar from '@/components/RequestDetailsSidebar';
import { requestData, requestsData } from '@/data/mockData'; // Using the updated data
import { Search, Bell, Download, Filter, ChevronDown, CheckSquare, XSquare, GripHorizontal, LayoutGrid, List } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';

export default function ApprovalsPage() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Pending');
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Toggle selection
    const toggleSelection = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const toggleAll = () => {
        if (selectedItems.length === requestsData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(requestsData.map(item => item.id));
        }
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
    };

    const closeSidebar = () => {
        setSelectedRequest(null);
    };

    // Columns configuration
    const columns = [
        {
            header: <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" onChange={toggleAll} checked={selectedItems.length === requestsData.length && requestsData.length > 0} />,
            accessor: 'selection',
            className: 'w-12',
            render: (row) => (
                <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedItems.includes(row.id)}
                    onChange={() => toggleSelection(row.id)}
                    onClick={(e) => e.stopPropagation()}
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
            header: 'Requester',
            accessor: 'requester',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 mr-3 overflow-hidden">
                        <img src={row.avatar} alt={row.requester} className="h-full w-full object-cover" />
                    </div>
                    <span className="font-medium text-gray-900">{row.requester}</span>
                </div>
            )
        },
        { header: 'Tool Requested', accessor: 'tool', className: 'text-gray-900' },
        { header: 'Department', accessor: 'department', className: 'text-gray-500' },
        {
            header: 'Type',
            accessor: 'type',
            render: (row) => {
                let colorClass = 'text-gray-500';
                if (row.type === 'New') colorClass = 'text-blue-600';
                if (row.type === 'Reuse') colorClass = 'text-purple-600';
                if (row.type === 'Expansion') colorClass = 'text-teal-600';
                return <span className={clsx("font-medium", colorClass)}>{row.type}</span>;
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const isOverdue = row.status.includes('Overdue');
                return (
                    <span className={clsx("font-medium", isOverdue ? "text-red-600" : "text-amber-600")}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: 'Risk Level',
            accessor: 'risk',
            render: (row) => {
                let colorClass = 'text-gray-500';
                if (row.risk === 'Low') colorClass = 'text-green-600';
                if (row.risk === 'Medium') colorClass = 'text-orange-600';
                if (row.risk === 'High') colorClass = 'text-red-600';
                return <span className={clsx("font-medium", colorClass)}>{row.risk}</span>;
            }
        },
        {
            header: 'Action',
            accessor: 'action',
            render: () => (
                <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                    Review
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-gray-500 mt-1">Review and action requests awaiting your decision</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Approval Velocity"
                    value="1.8 Days"
                    change="+12% vs last week"
                    isPositive={true}
                    subtext="avg. turnaround"
                />
                <KPICard
                    title="Pending Value"
                    value="$142,500"
                    subtext="est. annual spend"
                    topRightLabel="Active Pipeline"
                    topRightLabelColor="text-gray-400"
                />
                <KPICard
                    title="Policy Compliance"
                    value="94%"
                    subtext="pre-screened requests"
                    topRightLabel="Auto-Vetted"
                    topRightLabelColor="text-blue-500"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
                {/* Tabs */}
                <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-200">
                    <div className="flex space-x-8">
                        {['All Pending (42)', 'High Priority (8)', 'Software Reuse (15)', 'New Acquisition (19)'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={clsx(
                                    "pb-4 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="pb-4 flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <div className="relative">
                            <select className="block w-full pl-3 pr-8 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md text-gray-900 border">
                                <option>Date (Newest First)</option>
                                <option>Date (Oldest First)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Selection Bar */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {selectedItems.length} items selected
                    </span>
                    <div className="flex space-x-3">
                        <button className={clsx("flex items-center px-4 py-1.5 rounded text-sm font-medium transition-colors",
                            selectedItems.length > 0 ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white cursor-not-allowed"
                        )}>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Approve Selected
                        </button>
                        <button className={clsx("flex items-center px-4 py-1.5 rounded text-sm font-medium transition-colors",
                            selectedItems.length > 0 ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}>
                            <XSquare className="w-4 h-4 mr-2" />
                            Reject Selected
                        </button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={requestsData}
                    onRowClick={(row) => toggleSelection(row.id)}
                />

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing 1 to 5 of 42 pending approvals
                    </div>
                    <div className="flex items-center space-x-1">
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-500">&lt;</button>
                        <button className="px-3 py-1 border border-blue-500 bg-blue-600 text-white rounded">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-700">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-700">3</button>
                        <span className="px-2 text-gray-500">...</span>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-700">9</button>
                        <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 text-gray-500">&gt;</button>
                    </div>
                </div>
            </div>

            {/* Request Details Sidebar */}
            <RequestDetailsSidebar
                isOpen={!!selectedRequest}
                onClose={closeSidebar}
                request={selectedRequest}
            />
        </div>
    );
}
