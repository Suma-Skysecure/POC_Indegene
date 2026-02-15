"use client";

import React, { useState } from 'react';
import { catalogData } from '@/data/mockData';
import ToolCard from '@/components/ToolCard';
import { Search, Package, SlidersHorizontal } from 'lucide-react';

export default function CatalogPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [deptFilter, setDeptFilter] = useState('All Departments');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const getName = (item) => item.name || item.softwareName || item['Software Name'] || '';
    const getVendor = (item) => item.vendor || item.manufacturer || item.Manufacturer || item['Manufacture'] || '';
    const getCategory = (item) => item.category || item.Category || '';
    const getType = (item) => item.department || item.softwareType || item['Software Type'] || '';
    const getStatus = (item) => item.status || '';

    // Filter Logic
    const filteredData = catalogData.filter(item => {
        const searchValue = searchTerm.toLowerCase();
        const name = getName(item).toLowerCase();
        const vendor = getVendor(item).toLowerCase();
        const category = getCategory(item);
        const type = getType(item);
        const status = getStatus(item);
        const matchesSearch = name.includes(searchValue) || vendor.includes(searchValue);
        const matchesCategory = categoryFilter === 'All Categories' || category === categoryFilter;
        const matchesDept = deptFilter === 'All Departments' || type === deptFilter;
        const matchesStatus = statusFilter === 'All Status' || (statusFilter === 'Active' ? (status === 'Active' || status === 'Expiring Soon') : status === statusFilter);

        return matchesSearch && matchesCategory && matchesDept && matchesStatus;
    });

    const categories = ['All Categories', ...new Set(catalogData.map((item) => getCategory(item)).filter(Boolean))];
    const departments = ['All Departments', ...new Set(catalogData.map((item) => getType(item)).filter(Boolean))];
    const statuses = ['All Status', ...new Set(catalogData.map((item) => getStatus(item)).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Tools Catalogue</h1>
                    </div>
                    <p className="text-gray-500 mt-1 ml-11">Browse and manage all purchased tools across the organization</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative w-full xl:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search tools by name, vendor, or category..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 text-gray-900 placeholder:text-gray-500 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                    >
                        {departments.map((department) => (
                            <option key={department} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>

                    <select
                        className="border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900 font-semibold"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <button className="flex items-center border border-gray-200 rounded-lg py-2 px-3 text-sm bg-white hover:bg-gray-50 text-gray-700">
                        <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-400" />
                        Sort: Newest Purchase
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </div>
    );
}
