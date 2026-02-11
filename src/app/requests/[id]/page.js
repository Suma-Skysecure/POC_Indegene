export default function RequestDetailsPage({ params }) {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Request Details</h1>
            <p>Details for request ID: {params.id}</p>
        </div>
    );
}
