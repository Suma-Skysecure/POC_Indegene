export default function Table({ data, columns }) {
    return (
        <table className="min-w-full">
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={columns.length}>No data available</td>
                </tr>
            </tbody>
        </table>
    );
}
