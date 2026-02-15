import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

export default function ToolCard({ tool }) {
    const {
        name,
        vendor,
        category,
        department,
        purchase,
        renewal,
        cost,
        licenses,
        totalLicenses,
        status,
        bgColor,
        progressColor,
        statusColor,
        renewalColor,
        icon
    } = tool;

    const licensePercentage = (licenses / totalLicenses) * 100;

    return (
        <div className={clsx("rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-full transition-shadow hover:shadow-md", bgColor || "bg-white")}>
            <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-lg bg-white p-1.5 shadow-sm border border-gray-100 flex items-center justify-center">
                    {icon ? (
                        <img src={icon} alt={name} className="h-full w-full object-contain" />
                    ) : (
                        <div className="text-xs font-bold text-gray-400">{name.charAt(0)}</div>
                    )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                <p className="text-sm text-gray-500">{vendor}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-medium">{category}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{department}</span>
                </div>
            </div>

            <div className="space-y-3 text-sm flex-grow">
                <div className="flex justify-between">
                    <span className="text-gray-500">Purchase</span>
                    <span className="text-gray-900 font-medium">{purchase}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Renewal</span>
                    <span className={clsx("font-medium", renewalColor || "text-gray-900")}>{renewal}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Cost</span>
                    <span className="text-gray-900 font-medium">{cost}</span>
                </div>

                <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Licenses</span>
                        <span className="font-medium">{licenses} / {totalLicenses}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className={clsx("h-1.5 rounded-full", progressColor || "bg-blue-600")}
                            style={{ width: `${licensePercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200/50">
                <span className={clsx("text-sm font-bold", statusColor || "text-green-600")}>
                    {status}
                </span>
            </div>
        </div>
    );
}
