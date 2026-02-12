"use client";

import React, { useState } from 'react';
import { licenseData } from '@/data/mockData';
import Table from '@/components/Table';
import { Search, Plus, Filter, Download, MoreHorizontal, ArrowUpRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

// Custom KPI Card for License Page
const LicenseStatCard = ({ title, value, subtext, trend, trendColor, badge, badgeColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-32">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <div className="flex flex-col items-end">
                {trend && (
                    <span className={clsx("text-sm font-medium flex items-center", trendColor)}>
                        {trend.includes('↑') && <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {trend}
                    </span>
                )}
                {badge && (
                    <span className={clsx("text-xs px-2 py-0.5 rounded font-medium flex items-center mt-1", badgeColor)}>
                        {badge === 'Action Required' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {badge}
                    </span>
                )}
                {subtext && <span className="text-xs text-gray-400 mt-1">{subtext}</span>}
            </div>
        </div>
    </div>
);

export default function LicenseInventoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [vendorFilter, setVendorFilter] = useState('All Vendors');
    const [statusFilter, setStatusFilter] = useState('Status: All');

    // Filter Logic
    const filteredData = licenseData.filter(item => {
        const matchesSearch =
            item.tool.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vendor.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = vendorFilter === 'All Vendors' || item.vendor === vendorFilter;
        // Simple status matching logic, could be refined
        const matchesStatus = statusFilter === 'Status: All' || item.status === statusFilter;

        return matchesSearch && matchesVendor && matchesStatus;
    });

    const columns = [
        {
            header: 'Tool',
            accessor: 'tool',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center mr-3 p-1 border border-gray-100">
                        {row.icon ? (
                            <img src={row.icon} alt={row.tool} className="h-full w-full object-contain" />
                        ) : (
                            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        )}
                    </div>
                    <span className="font-medium text-gray-900">{row.tool}</span>
                </div>
            )
        },
        { header: 'Vendor', accessor: 'vendor', className: 'text-gray-600' },
        { header: 'Total', accessor: 'total', className: 'text-gray-900 font-medium' },
        { header: 'Used', accessor: 'used', className: 'text-gray-600' },
        {
            header: 'Available',
            accessor: 'available',
            render: (row) => (
                <span className={clsx("font-medium", row.available < 0 ? "text-red-600" : row.available < 5 ? "text-orange-600" : "text-gray-600")}>
                    {row.available}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                let colorClass = 'text-gray-600';
                if (row.status === 'Healthy') colorClass = 'text-green-600';
                if (row.status === 'Near Limit') colorClass = 'text-orange-600';
                if (row.status === 'Over-utilized') colorClass = 'text-red-600';
                if (row.status === 'Underutilized') colorClass = 'text-blue-600';
                return <span className={clsx("text-xs font-bold", colorClass)}>{row.status}</span>;
            }
        },
        {
            header: 'Actions',
            accessor: 'actions',
            className: 'text-right',
            render: () => (
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">License Inventory</h1>
                    <p className="text-gray-500 mt-1">Comprehensive view of all software licenses across the enterprise</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add License
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <LicenseStatCard
                    title="Total Licenses"
                    value="1,248"
                    trend="↑ 12%"
                    trendColor="text-green-600"
                />
                <LicenseStatCard
                    title="Active Users"
                    value="982"
                    subtext="78.6% Utilized"
                />
                <LicenseStatCard
                    title="Renewals Due (30d)"
                    value="14"
                    badge="Action Required"
                    badgeColor="text-orange-600 bg-orange-50 border border-orange-100"
                />
                <LicenseStatCard
                    title="Total Annual Spend"
                    value="₹2.4M"
                    subtext="FY24 Budget"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Filter by tool or vendor name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex space-x-3">
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px] text-gray-900 font-semibold"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                    >
                        <option>All Vendors</option>
                        <option>Microsoft</option>
                        <option>Adobe</option>
                        <option>Salesforce</option>
                    </select>
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white min-w-[140px] text-gray-900 font-semibold"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>Status: All</option>
                        <option>Healthy</option>
                        <option>Near Limit</option>
                        <option>Over-utilized</option>
                    </select>
                    <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Table columns={columns} data={filteredData} />

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing 1-9 of 42 tools
                    </span>
                    <div className="flex items-center space-x-1">
                        <button className="px-2 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">&lt;</button>
                        <button className="px-3 py-1 border border-blue-600 bg-blue-600 text-white rounded">1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">3</button>
                        <span className="px-2 text-gray-400">...</span>
                        <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">5</button>
                        <button className="px-2 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
