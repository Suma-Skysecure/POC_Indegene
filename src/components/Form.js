export default function Form({ fields }) {
    return (
        <form className="space-y-4">
            {fields.map((field) => (
                <div key={field.name}>
                    <label className="block text-sm font-medium">{field.label}</label>
                    <input type={field.type} name={field.name} className="border p-2 rounded" />
                </div>
            ))}
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
        </form>
    );
}
