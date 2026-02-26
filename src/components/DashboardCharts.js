"use client";

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { DASHBOARD_CHARTS_SEED } from '@/lib/admin/sharedData';

export function SpendTrendChart({ data = DASHBOARD_CHARTS_SEED.spendTrend }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spend Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#1F2937' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563EB"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ToolUsageChart({ data = DASHBOARD_CHARTS_SEED.toolUsage }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tool Usage by Department</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={data} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={10} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Sales" stackId="a" fill="#17479E" /> {/* Indegene Blue */}
                    <Bar dataKey="External" stackId="a" fill="#E31B6D" /> {/* Indegene Pink */}
                    <Bar dataKey="Internal" stackId="a" fill="#00A9E0" /> {/* Indegene Cyan */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
