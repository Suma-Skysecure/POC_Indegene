import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="mt-8 flex items-center justify-between">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Showing <span className="text-gray-900">4</span> of <span className="text-gray-900">{totalItems}</span> requests
            </p>
            <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#002D72] text-white text-xs font-bold shadow-md">1</button>
                <button className="w-8 h-8 rounded-lg border border-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-all">2</button>
                <button className="p-2 border border-gray-100 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
