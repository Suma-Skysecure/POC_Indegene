import React from 'react';
import { LayoutGrid } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        'APPROVED': 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
        'PENDING': 'bg-[#FFF3E0] text-[#EF6C00] border-[#FFE0B2]',
        'IN REVIEW': 'bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]',
        'REJECTED': 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

export default function RequestsTable({ requests }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">
                            <th className="px-8 py-5">Request ID</th>
                            <th className="px-8 py-5">Tool Name</th>
                            <th className="px-8 py-5 text-center">Request Type</th>
                            <th className="px-8 py-5 text-center">Category</th>
                            <th className="px-8 py-5 text-center">Date Submitted</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Assigned Licenses</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                                <td className="px-8 py-6 text-sm font-bold text-gray-900">{req.id}</td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-gray-50 rounded-lg p-2 border border-gray-100 group-hover:border-blue-100 group-hover:bg-white transition-all">
                                            <img src={req.toolIcon} alt={req.toolName} className="h-full w-full object-contain" />
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{req.toolName}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center text-sm font-medium text-gray-500">{req.type}</td>
                                <td className="px-8 py-6 text-center text-sm font-medium text-gray-500">{req.category}</td>
                                <td className="px-8 py-6 text-center text-sm font-medium text-gray-500">{req.dateSubmitted}</td>
                                <td className="px-8 py-6 text-center">
                                    <StatusBadge status={req.status} />
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-gray-900">{req.assignedLicenses}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
