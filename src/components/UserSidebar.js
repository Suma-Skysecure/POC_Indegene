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
    PlusCircle
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/user/dashboard' },
    { name: 'Search Tools', icon: Search, href: '/user/search-tools' },
    { name: 'My Requests', icon: FileText, href: '/user/my-requests' },
    { name: 'My Assets', icon: CreditCard, href: '/user/my-assets' },
    { name: 'Request New Software', icon: PlusCircle, href: '/user/request-new' },
];

export default function UserSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-40 overflow-y-auto">
            <nav className="py-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "relative flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150",
                                isActive
                                    ? "bg-blue-50/70 text-[#0A4DAA]"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {isActive && (
                                <span className="absolute left-0 top-0 h-full w-[3px] bg-[#0A4DAA]" />
                            )}
                            <item.icon className={clsx("mr-3 h-4 w-4", isActive ? "text-[#0A4DAA]" : "text-gray-500")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
