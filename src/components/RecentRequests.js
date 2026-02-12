import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import Table from './Table';
import { requestsData } from '../data/mockData';

const statusStyles = {
    'Pending Review': 'bg-orange-100 text-orange-700',
    'Approved': 'bg-green-100 text-green-700',
    'In Analysis': 'bg-blue-100 text-blue-700',
    'Risk': 'bg-red-100 text-red-700',
};

export default function RecentRequests() {
    const columns = [
        {
            header: 'Request ID',
            accessor: 'id',
            render: (row) => (
                <Link href={`/requests/${row.id.replace('#', '')}`} className="text-blue-600 font-medium hover:underline">
                    {row.id}
                </Link>
            )
        },
        { header: 'Tool Name', accessor: 'tool', className: 'text-gray-900 font-medium' },
        { header: 'Requester', accessor: 'requester', className: 'text-gray-600' },
        { header: 'Department', accessor: 'department', className: 'text-gray-600' },
        { header: 'Date', accessor: 'date', className: 'text-gray-500 text-sm' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[row.status])}>
                    {row.status}
                </span>
            )
        }
    ];

    // Show only first 5 items for "Recent"
    const recentData = requestsData.slice(0, 5);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
                <Link href="/requests" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                </Link>
            </div>
            <Table columns={columns} data={recentData} />
        </div>
    );
}
