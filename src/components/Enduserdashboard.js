"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    CheckCircle2,
    CircleX,
    Clock3,
    Search,
    Plus,
    Mic,
    Mail,
    Folder,
    Share2,
    Building2,
    Users,
    Gamepad2,
    Cpu,
} from 'lucide-react';

function StatCard({ label, value, tone, icon: Icon }) {
    const tones = {
        pending: { value: 'text-blue-700', iconWrap: 'bg-blue-50', icon: 'text-blue-600' },
        approved: { value: 'text-green-600', iconWrap: 'bg-green-50', icon: 'text-green-600' },
        rejected: { value: 'text-red-600', iconWrap: 'bg-red-50', icon: 'text-red-500' },
    };
    const style = tones[tone] || tones.pending;

    return (
        <div className="bg-white rounded-lg border border-gray-100 p-4 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
                <p className={`mt-1 text-3xl font-bold ${style.value}`}>{value}</p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${style.iconWrap}`}>
                <Icon className={`h-4 w-4 ${style.icon}`} />
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide font-bold ${
                status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
        >
            {status}
        </span>
    );
}

function RecommendedToolCard({ item }) {
    const used = item.users - item.available;
    const percent = Math.round((used / item.users) * 100);
    const remainingPercent = 100 - percent;
    const isCritical = item.available < item.users * 0.1;
    const isWarning = item.available < item.users * 0.3;

    return (
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-[11px] text-gray-400">ID: {item.id}</p>
                    <p className="text-[11px] text-gray-500">{item.category}</p>
                </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500">
                    <span>Users</span>
                    <span className="font-semibold text-gray-700">{item.users.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                    <span>License Availability</span>
                    <span className="font-semibold text-gray-700">{item.available.toLocaleString()} / {item.users.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    {isCritical ? (
                        <p className="text-[11px] font-medium text-red-500">Almost full. Only a few licenses left.</p>
                    ) : (
                        <span />
                    )}
                    <p className="text-[11px] text-gray-400 font-semibold">-{remainingPercent}%</p>
                </div>
            </div>
            <button className="mt-3 w-full border border-blue-500 rounded-md py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
                Request License
            </button>
        </div>
    );
}

const assignedLicenses = [
    { tool: 'Outlook (Office 365)', appId: '65539', category: 'Web Mail', assigned: 1, available: '5,599', status: 'ACTIVE', icon: Mail },
    { tool: 'OneDrive', appId: '1310789', category: 'File Sharing', assigned: 1, available: '5,594', status: 'ACTIVE', icon: Folder },
    { tool: 'SharePoint Online', appId: '655377', category: 'Collaboration', assigned: 1, available: '5,533', status: 'ACTIVE', icon: Share2 },
    { tool: 'Citrix', appId: '1245859', category: 'IT Services', assigned: 1, available: '993', status: 'ACTIVE', icon: Building2 },
    { tool: 'SAP SuccessFactors', appId: '2097159', category: 'Human Resources', assigned: 1, available: '4,763', status: 'ACTIVE', icon: Users },
];

const recommendedTools = [
    { name: 'PlayStation Network', id: '983261', category: 'Consumer / Gaming', users: 4820, available: 2410, icon: Gamepad2 },
    { name: 'Steam', id: '983262', category: 'Consumer / Gaming Platform', users: 6140, available: 60, icon: Activity },
    { name: 'NVIDIA GeForce NOW', id: '983263', category: 'Consumer / Cloud Gaming', users: 3950, available: 3670, icon: Cpu },
];

export default function Enduserdashboard() {
    const [searchTerm, setSearchTerm] = useState('');

    const visibleLicenses = useMemo(() => {
        const value = searchTerm.toLowerCase().trim();
        if (!value) return assignedLicenses;
        return assignedLicenses.filter((item) =>
            item.tool.toLowerCase().includes(value) ||
            item.appId.toLowerCase().includes(value) ||
            item.category.toLowerCase().includes(value)
        );
    }, [searchTerm]);

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="h-7 w-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                            <Activity className="h-4 w-4" />
                        </span>
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time governance and tool utilization metrics</p>
                </div>
                <Link
                    href="/user/request-new"
                    className="bg-[#0A4DAA] hover:bg-[#0B3F88] text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    New Request
                </Link>
            </div>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search for a tool (e.g., Figma, Canva, Tableau)"
                        className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-lg pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-gray-200 text-gray-500 flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5" />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">Find tools, check license availability, or request new software.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Pending Requests" value="2" tone="pending" icon={Clock3} />
                <StatCard label="Approved" value="5" tone="approved" icon={CheckCircle2} />
                <StatCard label="Rejected" value="1" tone="rejected" icon={CircleX} />
            </div>

            <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">My Assigned Licenses</h2>
                    <button className="text-sm text-blue-700 font-semibold hover:text-blue-800">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                <th className="px-4 py-3">Tool Name</th>
                                <th className="px-4 py-3">Application ID</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Assigned Licenses</th>
                                <th className="px-4 py-3">Available Licenses</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleLicenses.map((row) => (
                                <tr key={row.appId} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="h-7 w-7 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                                                <row.icon className="h-4 w-4 text-blue-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">{row.tool}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.appId}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.category}</td>
                                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">{row.assigned}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.available}</td>
                                    <td className="px-4 py-3.5"><StatusPill status={row.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommended Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedTools.map((item) => (
                        <RecommendedToolCard key={item.id} item={item} />
                    ))}
                </div>
            </section>
        </div>
    );
}
