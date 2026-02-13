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
        ]
    },
    {
        section: 'Requests & Workflow',
        items: [
            { name: 'All Requests', icon: FileText, href: '/requests' },
        ]
    },
    {
        section: 'Spend & Licenses',
        items: [
            { name: 'License Inventory', icon: CreditCard, href: '/licenses' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 h-screen overflow-y-auto fixed left-0 top-0 z-30">
            <div className="h-16 flex items-center justify-center border-b border-gray-50 mb-4">
                {/* Logo */}
                <div className="relative h-8 w-32">
                    <img
                        alt="Indegene"
                        loading="lazy"
                        src="https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg"
                        className="object-contain w-full h-full"
                    />
                </div>
            </div>

            <nav className="p-4 pt-0 space-y-6">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-[11px] font-medium text-gray-400 mb-3 px-3 uppercase tracking-wider">
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
                                                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                            )}
                                        >
                                            <item.icon className={clsx("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-50 mt-auto">
                <button className="flex items-center text-sm font-medium text-gray-400 hover:text-red-500 transition-colors w-full px-3 py-2">
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
