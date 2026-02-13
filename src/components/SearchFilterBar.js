import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const FilterSelect = ({ label, options, value, onChange }) => (
    <div className="relative group">
        <select
            className="appearance-none flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer pr-10"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">{label}</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
);

export default function SearchFilterBar({
    searchTerm,
    onSearchChange,
    filters,
    sortBy,
    onSortChange,
    placeholder = "Search..."
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 mb-8">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-gray-900 font-medium placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {filters.map((filter, idx) => (
                        <FilterSelect
                            key={idx}
                            label={filter.label}
                            options={filter.options}
                            value={filter.value}
                            onChange={filter.onChange}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400 font-medium">Sort by:</span>
                    <div className="relative group">
                        <select
                            className="appearance-none font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer pr-5"
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
