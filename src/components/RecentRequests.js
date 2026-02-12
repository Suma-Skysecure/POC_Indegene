import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import Table from './Table';
import { dashboardRequestsData } from '../data/mockData';

const statusStyles = {
    'Pending': 'text-amber-600',
    'Approved': 'text-green-600',
    'In Analysis': 'text-blue-600',
    'Risk': 'text-red-600',
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
                <span className={clsx("text-sm font-medium", statusStyles[row.status])}>
                    {row.status}
                </span>
            )
        }
    ];

    // Use specific dashboard data
    const recentData = dashboardRequestsData;

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
