export default function StatusBadge({ status }) {
    const colors = {
        pending: 'bg-yellow-200 text-yellow-800',
        approved: 'bg-green-200 text-green-800',
        rejected: 'bg-red-200 text-red-800',
    };
    return (
        <span className={`px-2 py-1 rounded text-sm ${colors[status] || 'bg-gray-200'}`}>
            {status}
        </span>
    );
}
