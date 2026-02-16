"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    CheckCircle2,
    CircleX,
    Clock3,
    Search,
    Plus,
    Mic,
    Gamepad2,
    Cpu,
    LayoutGrid,
} from 'lucide-react';
import { requestsData } from '@/data/requestsData';
import { getCurrentUser, loadRequests } from '@/lib/requestStore';

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
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col justify-between group hover:shadow-xl hover:border-blue-100 transition-all duration-300">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl p-3 flex items-center justify-center border border-gray-100 group-hover:border-blue-100 transition-colors">
                        <item.icon className="h-full w-full text-[#002D72]" />
                    </div>
                    <div className="pt-1">
                        <h4 className="font-extrabold text-[#002D72] text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {item.id} • {item.category}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-widest">
                        <div className="space-y-1">
                            <span className="text-gray-400 block">Users</span>
                            <span className="text-[#002D72] text-sm font-black tabular-nums">{item.users.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href="/user/request-new?requestType=new_license"
                className="mt-8 block text-center w-full py-4 text-[#002D72] font-black text-sm border-2 border-[#002D72]/10 rounded-2xl hover:bg-[#002D72] hover:text-white hover:border-[#002D72] hover:shadow-lg transition-all active:scale-[0.98]"
            >
                Request License
            </Link>
        </div>
    );
}

const recommendedTools = [
    { name: 'PlayStation Network', id: '983261', category: 'Consumer / Gaming', users: 4820, available: 2410, icon: Gamepad2 },
    { name: 'Steam', id: '983262', category: 'Consumer / Gaming Platform', users: 6140, available: 60, icon: Activity },
    { name: 'NVIDIA GeForce NOW', id: '983263', category: 'Consumer / Cloud Gaming', users: 3950, available: 3670, icon: Cpu },
];

export default function Enduserdashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [allRequests, setAllRequests] = useState([]);

    const normalizeRequestId = (id = '') => {
        const raw = String(id || '').trim();
        if (!raw) return '#REQ-0';
        if (raw.toUpperCase().startsWith('#REQ-')) return raw.toUpperCase();
        const match = raw.match(/(\d+)/);
        return `#REQ-${match ? match[1] : raw.replace(/\D/g, '') || Date.now()}`;
    };

    const formatUserDate = (dateStr) => {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const parseDateValue = (value) => {
        const fromNative = new Date(value);
        if (!Number.isNaN(fromNative.getTime())) return fromNative.getTime();
        const match = String(value).match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
        if (!match) return 0;
        const date = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };

    const mapStoreRequestToMyRequest = (req) => ({
        id: normalizeRequestId(req.id),
        toolName: req.tool || req.toolName || 'Unknown Tool',
        toolIcon: req.toolIcon || '',
        type: req.type === 'Reuse' ? 'Reuse' : 'New License',
        category: req.requestOverview?.vendor || req.formPayload?.vendor || req.vendor || 'General',
        dateSubmitted: formatUserDate(req.date),
        status: String(req.status || 'Pending').toUpperCase(),
    });

    const mapLegacyRequestToMyRequest = (req) => ({
        id: normalizeRequestId(req.id),
        toolName: req.toolName || req.tool || 'Unknown Tool',
        toolIcon: req.toolIcon || '',
        type: req.type === 'Reuse' ? 'Reuse' : 'New License',
        category: req.category || req.vendor || 'General',
        dateSubmitted: req.dateSubmitted || formatUserDate(req.date),
        status: String(req.status || 'PENDING').toUpperCase(),
    });

    useEffect(() => {
        const currentUser = getCurrentUser();
        const storeRequests = loadRequests()
            .filter((req) => req.requester === currentUser)
            .map(mapStoreRequestToMyRequest);

        const legacyRequests = requestsData
            .map(mapLegacyRequestToMyRequest)
            .filter((base) => !storeRequests.some((r) => normalizeRequestId(r.id) === normalizeRequestId(base.id)));

        setAllRequests([...storeRequests, ...legacyRequests]);
    }, []);

    const assignedLicenses = useMemo(() => {
        return allRequests
            .filter((item) => item.status === 'APPROVED')
            .sort((a, b) => parseDateValue(b.dateSubmitted) - parseDateValue(a.dateSubmitted))
            .slice(0, 5)
            .map((item) => ({
                ...item,
                requestId: normalizeRequestId(item.id),
                status: 'ACTIVE',
            }));
    }, [allRequests]);

    const visibleLicenses = useMemo(() => {
        const value = searchTerm.toLowerCase().trim();
        if (!value) return assignedLicenses;
        return assignedLicenses.filter((item) =>
            item.toolName.toLowerCase().includes(value) ||
            item.requestId.toLowerCase().includes(value) ||
            item.category.toLowerCase().includes(value)
        );
    }, [searchTerm, assignedLicenses]);

    const pendingCount = useMemo(() => allRequests.filter((item) => item.status === 'PENDING').length, [allRequests]);
    const approvedCount = useMemo(() => allRequests.filter((item) => item.status === 'APPROVED').length, [allRequests]);
    const rejectedCount = useMemo(() => allRequests.filter((item) => item.status === 'REJECTED').length, [allRequests]);

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
                        placeholder="Search approved requests by tool, request ID, or category"
                        className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-lg pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md border border-gray-200 text-gray-500 flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5" />
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Pending Requests" value={String(pendingCount)} tone="pending" icon={Clock3} />
                <StatCard label="Approved" value={String(approvedCount)} tone="approved" icon={CheckCircle2} />
                <StatCard label="Rejected" value={String(rejectedCount)} tone="rejected" icon={CircleX} />
            </div>

            <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">My Assigned Licenses</h2>
                    <Link href="/user/my-assets" className="text-sm text-blue-700 font-semibold hover:text-blue-800">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                <th className="px-4 py-3">Tool Name</th>
                                <th className="px-4 py-3">Request ID</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Date Submitted</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleLicenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-sm text-gray-500 text-center">
                                        No approved requests found.
                                    </td>
                                </tr>
                            )}
                            {visibleLicenses.map((row) => (
                                <tr key={row.requestId} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <span className="h-7 w-7 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
                                                <LayoutGrid className="h-4 w-4 text-blue-600" />
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">{row.toolName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.requestId}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.category}</td>
                                    <td className="px-4 py-3.5 text-sm text-gray-600">{row.dateSubmitted}</td>
                                    <td className="px-4 py-3.5"><StatusPill status={row.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Recommended Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recommendedTools.map((item) => (
                        <RecommendedToolCard key={item.id} item={item} />
                    ))}
                </div>
            </section>
        </div>
    );
}
