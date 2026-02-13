"use client";

import React, { useState } from 'react';
import { shadowItData } from '@/data/mockData';
import Table from '@/components/Table';
import { Search, Download, Shield, AlertTriangle, Smartphone, ChevronRight, Ban, X, Eye } from 'lucide-react';
import clsx from 'clsx';

// Specific KPI Card for Shadow IT
const ShadowStatCard = ({ title, value, subtext, subtextColor, icon: Icon, iconColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <div className="flex items-baseline mt-4">
                    <span className="text-3xl font-bold text-gray-900 mr-2">{value}</span>
                    {subtext && (
                        <span className={clsx("text-sm font-medium", subtextColor)}>
                            {subtext}
                        </span>
                    )}
                </div>
            </div>
            <div className={clsx("p-2 rounded-lg bg-gray-50", iconColor)}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

export default function ShadowItPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('Risk Levels');

    // Filter Logic
    const filteredData = shadowItData.filter(item => {
        const matchesSearch = item.app.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRisk = riskFilter === 'Risk Levels' || item.riskLevel === riskFilter;
        return matchesSearch && matchesRisk;
    });

    const columns = [
        {
            header: 'App Name',
            accessor: 'app',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded mr-3 overflow-hidden">
                        {row.icon ? (
                            <img src={row.icon} alt={row.app} className="h-full w-full object-contain" />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {row.app.charAt(0)}
                            </div>
                        )}
                    </div>
                    <span className="font-medium text-gray-900">{row.app}</span>
                </div>
            )
        },
        { header: 'Category', accessor: 'category', className: 'text-gray-500' },
        {
            header: 'Risk Level',
            accessor: 'riskLevel',
            render: (row) => {
                let colorClass = 'text-gray-500';
                if (row.riskLevel === 'High') colorClass = 'text-red-600';
                if (row.riskLevel === 'Medium') colorClass = 'text-orange-500';
                if (row.riskLevel === 'Low') colorClass = 'text-green-600';
                return <span className={clsx("font-medium", colorClass)}>{row.riskLevel}</span>;
            }
        },
        { header: 'Users', accessor: 'users', className: 'text-gray-900 font-medium' },
        { header: 'Data Accessed', accessor: 'dataAccessed', className: 'text-gray-500' },
        { header: 'Last Activity', accessor: 'lastActivity', className: 'text-gray-500' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className="text-green-600 font-medium text-sm">
                    {row.status}
                </span>
            )
        },
        {
            header: 'Action',
            accessor: 'action',
            className: 'text-right',
            render: (row) => (
                <div className="flex justify-end">
                    {row.riskLevel === 'High' || row.riskLevel === 'Medium' ? (
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
                            Block
                        </button>
                    ) : (
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded text-sm font-medium transition-colors">
                            View
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 text-red-500 mr-2" />
                        Shadow IT Monitoring
                    </h1>
                    <p className="text-gray-500 mt-1">Unauthorized apps detected across organization</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors shadow-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </button>

                </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-3 text-red-600" />
                    <span className="font-medium">23 High-Risk apps</span>
                    <span className="ml-1">require immediate action - Review and block unauthorized applications</span>
                </div>
                <button className="text-red-600 font-medium text-sm hover:text-red-800 flex items-center">
                    Review All <X className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ShadowStatCard
                    title="Total Apps Detected"
                    value="128"
                    subtext="+12 New"
                    subtextColor="text-gray-500"
                    icon={Smartphone}
                    iconColor="text-gray-400"
                />
                <ShadowStatCard
                    title="High Risk Apps"
                    value="23"
                    subtext="Critical"
                    subtextColor="text-red-600"
                    icon={AlertTriangle}
                    iconColor="text-red-500"
                />
                <ShadowStatCard
                    title="Blocked Apps"
                    value="41"
                    subtext="Protected"
                    subtextColor="text-green-600"
                    icon={Ban}
                    iconColor="text-gray-400"
                />
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Detected Applications</h2>

                    <div className="flex space-x-3">
                        <select
                            className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                        >
                            <option>Risk Levels</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>
                        <select className="border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                </div>

                <Table columns={columns} data={filteredData} />

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing 5 of 128 applications
                    </span>
                    <div className="flex items-center space-x-2">
                        <button className="px-2 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50">&lt;</button>
                        <span className="text-sm text-gray-700 font-medium">1 of 26</span>
                        <button className="px-2 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
