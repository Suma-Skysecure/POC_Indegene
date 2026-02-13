"use client";

import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function UserHeader() {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
            {/* Logo Section */}
            <div className="flex items-center">
                <img
                    alt="Indegene"
                    src="https://resources.indegene.com/indegene/v2/images/nextjs12/images/logo/indegene-logo.svg"
                    className="h-8 w-auto"
                />
            </div>

            {/* Center - Search Bar */}


            {/* Right Section */}
            <div className="flex items-center space-x-6">
                {/* Notification */}
                <button className="text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                </button>

                {/* User Profile */}
                <div className="flex items-center">
                    <div className="text-right mr-3 hidden md:block">
                        <p className="text-sm font-medium text-gray-700">USER</p>
                        <p className="text-xs text-gray-500">Employee</p>
                    </div>
                    {/* Avatar - simple initial avatar */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                        U
                    </div>
                </div>
            </div>
        </header>
    );
}
