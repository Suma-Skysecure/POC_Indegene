"use client";

import React, { useState } from 'react';
import { requestsData } from '@/data/mockData';
import Table from '@/components/Table';
import { Search, Plus, Filter, Download, Clock, CheckCircle, Hourglass, AlertTriangle, MoreVertical } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All Types');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterRisk, setFilterRisk] = useState('All Risks');

    // Filter Logic
    const filteredData = requestsData.filter(item => {
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
            header: 'Request ID',
            accessor: 'id',
            className: 'text-blue-600 font-medium',
            render: (row) => <Link href="#" className="hover:underline">{row.id}</Link>
        },
        {
            header: 'User',
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
            className: 'text-right',
            render: () => (
                <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical className="w-5 h-5" />
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
                    <button className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Request
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Avg. Response Time"
                    value="4.2 Days"
                    icon={Clock}
                    bgClass="bg-blue-50"
                    colorClass="text-blue-600"
                />
                <StatCard
                    title="Approval Rate"
                    value="86%"
                    icon={CheckCircle}
                    bgClass="bg-green-50"
                    colorClass="text-green-600"
                />
                <StatCard
                    title="Pending Review"
                    value="42"
                    icon={Hourglass}
                    bgClass="bg-amber-50"
                    colorClass="text-amber-600"
                />
                <StatCard
                    title="High Risk Items"
                    value="8"
                    icon={AlertTriangle}
                    bgClass="bg-red-50"
                    colorClass="text-red-500"
                />
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID, User, Tool..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-sm whitespace-nowrap">Type:</span>
                            <select
                                className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>New</option>
                                <option>Reuse</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-sm whitespace-nowrap">Status:</span>
                            <select
                                className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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
                            <span className="text-gray-500 text-sm whitespace-nowrap">Risk:</span>
                            <select
                                className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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

                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('All Types');
                            setFilterStatus('All Status');
                            setFilterRisk('All Risks');
                        }}
                        className="text-blue-600 text-sm font-medium hover:text-blue-800 whitespace-nowrap"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Table columns={columns} data={filteredData} />

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing 1 to {filteredData.length > 7 ? 7 : filteredData.length} of 248 requests
                    </span>
                    <div className="flex items-center space-x-1">
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">&lt;</button>
                        <button className="px-3 py-1 border border-blue-600 bg-blue-600 text-white rounded">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">3</button>
                        <span className="px-2 text-gray-400">...</span>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">12</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
