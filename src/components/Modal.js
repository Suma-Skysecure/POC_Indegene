export default function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded">
                <button onClick={onClose} className="absolute top-2 right-2">X</button>
                {children}
            </div>
        </div>
    );
}
