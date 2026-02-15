"use client";

import React, { useMemo, useState } from "react";
import { Download, Eye, CheckCircle2, Clock3, Ban, Mail, Folder, CalendarDays, NotebookPen, MessageSquare, FileText, FileSpreadsheet, Presentation, PenTool, Info, ShieldAlert } from "lucide-react";

function AssetStatCard({ label, value, tone, icon: Icon }) {
    const toneStyles = {
        primary: "text-blue-700 bg-blue-50",
        success: "text-green-700 bg-green-50",
        warning: "text-amber-700 bg-amber-50",
        danger: "text-red-700 bg-red-50",
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className={`mt-2 text-3xl font-bold leading-none ${tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-500" : tone === "success" ? "text-green-600" : "text-blue-700"}`}>
                    {value}
                </p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${toneStyles[tone] || toneStyles.primary}`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    );
}

function AssetStatusBadge({ status }) {
    const normalized = status.toUpperCase();
    const styles =
        normalized === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500";

    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles}`}>
            {normalized}
        </span>
    );
}

function PolicyCard({ title, description, badge, actionText, tone, icon: Icon }) {
    const toneStyles = {
        info: {
            icon: "bg-blue-50 text-blue-700",
            button: "border-blue-200 text-blue-700 hover:bg-blue-50",
        },
        security: {
            icon: "bg-pink-50 text-pink-700",
            button: "border-pink-200 text-pink-700 hover:bg-pink-50",
        },
    };

    const current = toneStyles[tone] || toneStyles.info;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${current.icon}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
                        <p className="mt-1 text-sm text-gray-500 max-w-xl">{description}</p>
                    </div>
                </div>
                <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100">
                    {badge}
                </span>
            </div>
            <button className={`mt-4 w-full border rounded-lg py-2 text-sm font-bold transition-colors ${current.button}`}>
                {actionText}
            </button>
        </div>
    );
}

const assetsData = [
    { tool: "Outlook (Office 365)", appId: "65539", category: "Web Mail", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: Mail },
    { tool: "OneDrive", appId: "65540", category: "Cloud Storage", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: Folder },
    { tool: "Outlook Calendar", appId: "65541", category: "Productivity", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: CalendarDays },
    { tool: "OneNote", appId: "65542", category: "Productivity", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: NotebookPen },
    { tool: "Teams", appId: "65543", category: "Communication", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: MessageSquare },
    { tool: "Word", appId: "65544", category: "Productivity", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: FileText },
    { tool: "Excel", appId: "65545", category: "Productivity", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: FileSpreadsheet },
    { tool: "PowerPoint", appId: "65546", category: "Productivity", assigned: 1, available: "5,599", status: "ACTIVE", expiry: "Dec 31, 2025", icon: Presentation },
    { tool: "Figma", appId: "65547", category: "Design", assigned: 0, available: "0", status: "EXPIRED", expiry: "Dec 31, 2023", icon: PenTool },
    { tool: "Slack", appId: "65548", category: "Communication", assigned: 0, available: "0", status: "EXPIRED", expiry: "Dec 31, 2023", icon: MessageSquare },
];

export default function MyAssets() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const categories = useMemo(
        () => [...new Set(assetsData.map((item) => item.category))],
        []
    );

    const filteredAssets = useMemo(() => {
        const list = assetsData.filter((item) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                item.tool.toLowerCase().includes(term) ||
                item.appId.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term);
            const matchesStatus = !statusFilter || item.status === statusFilter;
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });

        const sorted = [...list];
        if (sortBy === "oldest") {
            sorted.sort((a, b) => a.tool.localeCompare(b.tool));
        } else {
            sorted.sort((a, b) => b.tool.localeCompare(a.tool));
        }
        return sorted;
    }, [searchTerm, statusFilter, categoryFilter, sortBy]);

    const total = assetsData.length;
    const active = assetsData.filter((item) => item.status === "ACTIVE").length;
    const expired = assetsData.filter((item) => item.status === "EXPIRED").length;
    const expiringSoon = assetsData.filter((item) => item.status === "ACTIVE" && item.expiry === "Dec 31, 2025").length;

    return (
        <div className="max-w-7xl mx-auto pb-10 space-y-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all your assigned tools and licenses</p>
                </div>
                <button className="bg-[#0A4DAA] hover:bg-[#0B3F88] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                    <Download className="h-4 w-4" />
                    Export List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <AssetStatCard label="Total Tools" value={total} tone="primary" icon={Eye} />
                <AssetStatCard label="Active Tools" value={active} tone="success" icon={CheckCircle2} />
                <AssetStatCard label="Expiring Soon" value={expiringSoon} tone="warning" icon={Clock3} />
                <AssetStatCard label="Inactive / Expired" value={expired} tone="danger" icon={Ban} />
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Tools &amp; Licenses</h2>
                        <div className="text-sm">
                            <span className="text-gray-400 mr-2">Showing all tools</span>
                            <button
                                className="font-bold text-blue-700 hover:text-blue-800"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("");
                                    setCategoryFilter("");
                                    setSortBy("newest");
                                }}
                            >
                                Clear Filter
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search requests by tool name, ID, or keyword..."
                            className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 bg-white"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                >
                                    <option value="">All Status</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                </select>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 bg-white"
                                    value={categoryFilter}
                                    onChange={(event) => setCategoryFilter(event.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-600 font-medium">Sort by:</span>
                                <select
                                    className="font-semibold text-gray-900 bg-transparent"
                                    value={sortBy}
                                    onChange={(event) => setSortBy(event.target.value)}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[980px]">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">Tool Name</th>
                                <th className="px-6 py-4">Application ID</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAssets.map((item) => (
                                <tr key={item.appId} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                                                <item.icon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{item.tool}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.appId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                                    <td className="px-6 py-4"><AssetStatusBadge status={item.status} /></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.expiry}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Governance Policies</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <PolicyCard
                        title="License Transfers"
                        description="If you change departments, your licenses may need to be re-authorized. Please contact your manager for transfer requests."
                        badge="Policy"
                        actionText="Read Policy"
                        tone="info"
                        icon={Info}
                    />
                    <PolicyCard
                        title="Usage Compliance"
                        description="Ensure all software is used in accordance with the security policy. Inactive licenses (>90 days) are reclaimed."
                        badge="Security"
                        actionText="Check Compliance"
                        tone="security"
                        icon={ShieldAlert}
                    />
                </div>
            </section>
        </div>
    );
}
