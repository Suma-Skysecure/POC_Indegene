import React from 'react';
import clsx from 'clsx';

export default function Table({ columns, data, onRowClick }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                        {columns.map((col, idx) => (
                            <th key={idx} className={clsx("px-6 py-4", col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => onRowClick && onRowClick(row)}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={clsx("px-6 py-4", col.className)}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
