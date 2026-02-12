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

const spendData = [
    { month: 'May', value: 180 },
    { month: 'Jun', value: 210 },
    { month: 'Jul', value: 195 },
    { month: 'Aug', value: 230 },
    { month: 'Sep', value: 215 },
    { month: 'Oct', value: 250 },
];

const usageData = [
    { name: 'Figma', Sales: 80, External: 20, Internal: 30 },
    { name: 'Sketch', Sales: 60, External: 70, Internal: 100 },
    { name: 'XD', Sales: 25, External: 35, Internal: 90 },
    { name: 'PS', Sales: 100, External: 90, Internal: 15 },
    { name: 'AI', Sales: 90, External: 30, Internal: 90 },
    { name: 'Corel', Sales: 40, External: 85, Internal: 75 },
    { name: 'InDes', Sales: 65, External: 85, Internal: 70 },
    { name: 'Canva', Sales: 45, External: 35, Internal: 70 },
    { name: 'Webflow', Sales: 25, External: 20, Internal: 80 },
    { name: 'Affinity', Sales: 35, External: 55, Internal: 70 },
    { name: 'Marker', Sales: 30, External: 55, Internal: 30 }, // Assuming 'Marker' for Marvel/Figma repeat
    { name: 'Figma', Sales: 65, External: 35, Internal: 100 },
];

export function SpendTrendChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spend Trend (6 Months)</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={spendData}>
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

export function ToolUsageChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tool Usage by Department</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={usageData} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={10} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Sales" stackId="a" fill="#1D4ED8" /> {/* Darker Blue */}
                    <Bar dataKey="External" stackId="a" fill="#DB2777" /> {/* Pink */}
                    <Bar dataKey="Internal" stackId="a" fill="#2DD4BF" /> {/* Teal */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
