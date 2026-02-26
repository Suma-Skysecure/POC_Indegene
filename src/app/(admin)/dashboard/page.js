"use client";

import React, { useEffect, useMemo, useState } from "react";
import KPICard from "@/components/KPICard";
import { SpendTrendChart, ToolUsageChart } from "@/components/DashboardCharts";
import RecentRequests from "@/components/RecentRequests";
import { IndianRupee, RefreshCw, PieChart, Clock, Database, Calendar } from "lucide-react";
import { DASHBOARD_CHARTS_SEED, DASHBOARD_KPI_SEED } from "@/lib/admin/sharedData";

const FALLBACK_DASHBOARD = {
    metrics: DASHBOARD_KPI_SEED,
    recent: { requests: [], licenses: [] },
    charts: DASHBOARD_CHARTS_SEED,
    data: {},
};

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState(FALLBACK_DASHBOARD);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/admin/dashboard", { cache: "no-store" })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed to load dashboard"))))
            .then((payload) => {
                if (!cancelled && payload) setDashboard(payload);
            })
            .catch(() => {
                if (!cancelled) setDashboard(FALLBACK_DASHBOARD);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const metrics = dashboard?.metrics || FALLBACK_DASHBOARD.metrics;
    const recentRequests = dashboard?.recent?.requests || [];
    const charts = useMemo(
        () => ({
            spendTrend: dashboard?.charts?.spendTrend || DASHBOARD_CHARTS_SEED.spendTrend,
            toolUsage: dashboard?.charts?.toolUsage || DASHBOARD_CHARTS_SEED.toolUsage,
        }),
        [dashboard]
    );

    return (
        <div className="space-y-6">
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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPICard
                    title="Total Software Spend"
                    value={metrics.totalSoftwareSpend}
                    change={metrics.softwareSpendChange}
                    isPositive={true}
                    icon={IndianRupee}
                />
                <KPICard
                    title="Cost Avoided via Reuse"
                    value={metrics.costAvoidedViaReuse}
                    change={metrics.costAvoidedChange}
                    isPositive={true}
                    icon={RefreshCw}
                />
                <KPICard
                    title="Known vs Unknown Tools"
                    value={`${metrics.knownToolsPercent}%`}
                    subtext={
                        <span>
                            Known {metrics.knownToolsPercent}%, <span className="text-red-500">{metrics.unknownToolsPercent}% Unknown</span>
                        </span>
                    }
                    icon={PieChart}
                />
                <KPICard
                    title="Avg Approval Time"
                    value={metrics.avgApprovalTime}
                    change={metrics.avgApprovalTimeChange}
                    isPositive={true}
                    icon={Clock}
                />
                <KPICard
                    title="Total Reuse Tools"
                    value={String(metrics.totalReuseTools)}
                    change={metrics.totalReuseToolsChange}
                    isPositive={true}
                    icon={Database}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendTrendChart data={charts.spendTrend} />
                <ToolUsageChart data={charts.toolUsage} />
            </div>

            <RecentRequests data={recentRequests} />
        </div>
    );
}
