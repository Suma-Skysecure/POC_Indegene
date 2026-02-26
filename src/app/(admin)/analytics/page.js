"use client";

import { useEffect, useState } from "react";
import { ANALYTICS_PAGES_SEED } from "@/lib/admin/sharedData";

export default function AnalyticsPage() {
    const baseUrl = process.env.NEXT_PUBLIC_PBI_BASE_URL;
    const [pages, setPages] = useState(ANALYTICS_PAGES_SEED);
    const [activePage, setActivePage] = useState(ANALYTICS_PAGES_SEED[0]);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/admin/analytics", { cache: "no-store" })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Failed to load analytics"))))
            .then((payload) => {
                if (cancelled) return;
                const nextPages = Array.isArray(payload?.data?.pages) && payload.data.pages.length > 0
                    ? payload.data.pages
                    : ANALYTICS_PAGES_SEED;
                setPages(nextPages);
                setActivePage(nextPages[0]);
            })
            .catch(() => {
                if (cancelled) return;
                setPages(ANALYTICS_PAGES_SEED);
                setActivePage(ANALYTICS_PAGES_SEED[0]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!baseUrl) {
        return (
            <div style={{ padding: "24px" }}>
                <h2 style={{ color: "red" }}>Power BI base URL not configured</h2>
            </div>
        );
    }

    const buildUrl = () => `${baseUrl}&pageName=${activePage.pageName}`;

    return (
        <div style={{ padding: "24px" }}>
            <h1 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "600" }}>
                Indegene Analytics Dashboard
            </h1>

            <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {pages.map((page) => (
                    <button
                        key={page.label}
                        onClick={() => setActivePage(page)}
                        style={{
                            padding: "10px 18px",
                            borderRadius: "8px",
                            border: activePage.label === page.label ? "none" : "1px solid #ccc",
                            backgroundColor: activePage.label === page.label ? "#000" : "#fff",
                            color: activePage.label === page.label ? "#fff" : "#000",
                            cursor: "pointer",
                            fontWeight: "500",
                        }}
                    >
                        {page.label}
                    </button>
                ))}
            </div>

            <div
                style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                }}
            >
                <iframe
                    title="IndegeneDashboard"
                    src={buildUrl()}
                    style={{
                        width: "100%",
                        height: "85vh",
                        border: "none",
                    }}
                    allowFullScreen
                />
            </div>
        </div>
    );
}
