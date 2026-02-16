"use client";

import React from 'react';
import { Bell } from 'lucide-react';

export default function UserHeader() {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-md bg-[#0A4DAA] text-white flex items-center justify-center">
                    <span className="text-xs font-bold">S</span>
                </div>
                <p className="text-[26px] md:text-lg font-bold text-[#0A4DAA] leading-none">Software Governance Portal</p>
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center">
                    <div className="text-right mr-3 hidden md:block">
                        <p className="text-sm font-semibold text-gray-800">User</p>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400">Employee</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                        U
                    </div>
                </div>
            </div>
        </header>
    );
}
