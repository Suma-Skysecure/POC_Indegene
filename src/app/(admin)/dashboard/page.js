"use client";

import React from 'react';
import KPICard from '@/components/KPICard';
import { SpendTrendChart, ToolUsageChart } from '@/components/DashboardCharts';
import RecentRequests from '@/components/RecentRequests';
import { DollarSign, RefreshCw, PieChart, Clock, Database, Calendar, Plus } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time governance and tool utilization metrics</p>
                </div>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        Last 30 Days
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard
                    title="Total Software Spend"
                    value="$12.4M"
                    change="4% QoQ"
                    isPositive={true}
                    icon={DollarSign}
                />
                <KPICard
                    title="Cost Avoided via Reuse"
                    value="$1.2M"
                    change="18%"
                    isPositive={true}
                    icon={RefreshCw}
                />
                <KPICard
                    title="Known vs Unknown Tools"
                    value="68%"
                    subtext={<span>Known 68%, <span className="text-red-500">32% Unknown</span></span>}
                    icon={PieChart}
                // The prompt says "Unknown in red", but the metric itself is 68%. 
                // I'll stick to the cleaner look, maybe add a custom render for subtext if strictly needed,
                // but the current KPICard handles subtext simply.
                />
                <KPICard
                    title="Avg Approval Time"
                    value="2.4 days"
                    change="30%"
                    isPositive={true} // Prompt says "-30% (green)", meaning reduction is good.
                    icon={Clock}
                />
                <KPICard
                    title="Total Reuse Tools"
                    value="342"
                    change="12%"
                    isPositive={true}
                    icon={Database}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendTrendChart />
                <ToolUsageChart />
            </div>

            {/* Recent Requests Table */}
            <RecentRequests />
        </div>
    );
}
