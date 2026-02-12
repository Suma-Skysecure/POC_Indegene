import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

export default function KPICard({ title, value, change, isPositive, icon: Icon, subtext, topRightLabel, topRightLabelColor }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                {topRightLabel ? (
                    <span className={clsx("text-xs font-medium", topRightLabelColor || "text-gray-500")}>
                        {topRightLabel}
                    </span>
                ) : (
                    Icon && <Icon className="w-5 h-5 text-gray-400" />
                )}
            </div>

            <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>

                <div className="flex items-center text-sm">
                    {change && (
                        <span className={clsx(
                            "flex items-center font-medium",
                            isPositive ? "text-green-600" : "text-red-500"
                        )}>
                            {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                            {change}
                        </span>
                    )}
                    {subtext && (
                        <span className="ml-2 text-gray-400 text-xs">
                            {subtext}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
