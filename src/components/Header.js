"use client";

import React from 'react';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Section */}
            <div className="flex items-center space-x-6 ml-4">
                {/* Search Bar */}
                <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search tools, requests or users..."
                    />
                </div>
                {/* Notification */}
                <button className="text-gray-400 hover:text-gray-500 relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center">
                    {/* Avatar - using a placeholder or creating a simple initial avatar if no image */}
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3 border border-blue-200">
                        <img
                            src="https://i.pravatar.cc/150?u=alex"
                            alt="Alex Rivera"
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-700">Alex Rivera</p>
                        <p className="text-xs text-gray-500">Super Admin</p>
                    </div>
                </div>


            </div>
        </header>
    );
}
