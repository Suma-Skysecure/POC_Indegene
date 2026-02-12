"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    LayoutDashboard,
    ShieldCheck,
    Package,
    AlertTriangle,
    Copy,
    FileText,
    Clock,
    RotateCcw,
    PlusCircle,
    Activity,
    CreditCard,
    BarChart2,
    Settings,
    Zap,
    Filecode, // Using Filecode as a proxy for Audit Log if specifically needed, or just FileText
    LogOut
} from 'lucide-react';

const menuItems = [
    {
        section: 'Overview',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        ]
    },
    {
        section: 'Software Governance',
        items: [
            { name: 'Tool Catalog', icon: Package, href: '/catalog' },
            { name: 'Shadow IT Detected', icon: ShieldCheck, href: '/shadow-it' },
            { name: 'Duplicate Tools', icon: Copy, href: '/duplicate-tools' },
        ]
    },
    {
        section: 'Requests & Workflow',
        items: [
            { name: 'All Requests', icon: FileText, href: '/requests' },
            { name: 'Pending Approvals', icon: Clock, href: '/approvals' },
            { name: 'Reuse Requests', icon: RotateCcw, href: '/requests/reuse' },
            { name: 'New Tool Requests', icon: PlusCircle, href: '/requests/new' },
            { name: 'TPRM / ASM Queue', icon: Activity, href: '/tprm' },
        ]
    },
    {
        section: 'Spend & Licenses',
        items: [
            { name: 'License Inventory', icon: CreditCard, href: '/licenses' },
            { name: 'Underutilized Licenses', icon: AlertTriangle, href: '/licenses/underutilized' },
            { name: 'Vendor Spend', icon: CreditCard, href: '/spend' }, // Reusing CreditCard for Spend
        ]
    },
    {
        section: 'Insights',
        items: [
            { name: 'Reports & Dashboards', icon: BarChart2, href: '/reports' },
        ]
    },
    {
        section: 'Admin',
        items: [
            { name: 'Policies & Rules', icon: ShieldCheck, href: '/policies' },
            { name: 'Integrations', icon: Zap, href: '/integrations' },
            { name: 'Audit Log', icon: FileText, href: '/audit-log' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto fixed left-0 top-0 z-30">
            <div className="h-16 flex items-center justify-center border-b border-gray-100">
                {/* Logo */}
                <div className="relative h-10 w-40">
                    <img
                        alt="Indegene"
                        loading="lazy"
                        decoding="async"
                        data-nimg="fill"
                        style={{ position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0, objectFit: "contain", color: "transparent" }}
                        sizes="100vw"
                        srcSet="https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 640w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 750w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 828w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 1080w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 1200w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 1920w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 2048w, https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg 3840w"
                        src="https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg"
                    />
                </div>
            </div>

            <nav className="p-4 space-y-6">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                            {section.section}
                        </h3>
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={clsx(
                                                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                                                isActive
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            <item.icon className={clsx("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} aria-hidden="true" />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 mt-auto">
                <button className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors w-full px-2 py-2">
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
