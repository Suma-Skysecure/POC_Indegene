export default function Layout({ children }) {
    return (
        <div className="flex">
            <main className="flex-1 min-h-screen">
                {children}
            </main>
        </div>
    );
}
