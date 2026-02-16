import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

export default function ToolCard({ tool }) {
    const name = tool.name || tool.softwareName || tool['Software Name'] || 'Unknown Tool';
    const vendor = tool.vendor || tool.manufacturer || tool.Manufacturer || tool['Manufacture'] || '-';
    const version = tool.version || tool.Version || '-';
    const licenseType = tool.licenseType || tool['License Type'] || tool['License Ty'] || '-';
    const category = tool.category || tool.Category || '-';
    const softwareType = tool.softwareType || tool['Software Type'] || tool.department || '-';
    const networkId = tool.networkId || tool['Network ID'] || tool['Network In'] || '-';
    const managedId = tool.managedId || tool['Managed ID'] || tool['Managed I'] || '-';

    const purchase = tool.purchase || '-';
    const renewal = tool.renewal || '-';
    const cost = tool.cost || '-';
    const status = tool.status || 'Active';
    const bgColor = tool.bgColor;
    const progressColor = tool.progressColor;
    const statusColor = tool.statusColor;
    const renewalColor = tool.renewalColor;
    const icon = tool.icon;
    const licenses = Number.isFinite(tool.licenses) ? tool.licenses : 0;
    const totalLicenses = Number.isFinite(tool.totalLicenses) ? tool.totalLicenses : 0;

    const hasLicenseBar = totalLicenses > 0;
    const licensePercentage = hasLicenseBar ? (licenses / totalLicenses) * 100 : 0;

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
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{softwareType}</span>
                </div>
            </div>

            <div className="space-y-3 text-sm flex-grow">
                <div className="flex justify-between">
                    <span className="text-gray-500">Version</span>
                    <span className="text-gray-900 font-medium">{version}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">License Type</span>
                    <span className="text-gray-900 font-medium">{licenseType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Network ID</span>
                    <span className="text-gray-900 font-medium">{networkId}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Managed ID</span>
                    <span className="text-gray-900 font-medium">{managedId}</span>
                </div>

                {hasLicenseBar && (
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
                )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200/50">
                <span className={clsx("text-sm font-bold", statusColor || "text-green-600")}>
                    {status}
                </span>
            </div>
        </div>
    );
}
