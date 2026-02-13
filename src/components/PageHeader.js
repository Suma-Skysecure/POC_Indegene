import React from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function PageHeader({ title, description, actionText, actionLink }) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">{description}</p>
            </div>
            {actionText && actionLink && (
                <Link
                    href={actionLink}
                    className="bg-[#002D72] hover:bg-[#001D4A] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {actionText}
                </Link>
            )}
        </div>
    );
}
