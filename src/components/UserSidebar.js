"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
    LayoutDashboard,
    Search,
    FileText,
    CreditCard,
    PlusCircle,
    LogOut,
    HelpCircle,
    ExternalLink
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/user/dashboard' },
    { name: 'Search Tools', icon: Search, href: '/user/search-tools' },
    { name: 'My Requests', icon: FileText, href: '/user/my-requests' },
    { name: 'My Licenses', icon: CreditCard, href: '/user/my-licenses' },
    { name: 'Request New Software', icon: PlusCircle, href: '/user/request-new' },
];

export default function UserSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-100 fixed left-0 top-16 bottom-0 z-40 flex flex-col pt-4 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={clsx("mr-3 h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Help Section */}
            <div className="p-4 mx-4 mb-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Need help?</h4>
                <p className="text-xs text-gray-500 mb-3">Contact IT support for any software access issues.</p>
                <button className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Open Ticket <ExternalLink className="ml-1 h-3 w-3" />
                </button>
            </div>

            <div className="p-4 border-t border-gray-50">
                <p className="text-xs text-gray-400 text-center mb-2">© 2026 Enterprise Software Governance Portal</p>
            </div>
        </aside>
    );
}
