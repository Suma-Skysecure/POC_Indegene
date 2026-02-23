"use client";

import { useState } from "react";

export default function AnalyticsPage() {

  const baseUrl = process.env.NEXT_PUBLIC_PBI_BASE_URL;

  const pages = [
    {
      label: "CFO Spend Optimization",
      pageName: "f18bba414819885fdaa3",
    },
    {
      label: "Governance & Control (CIO/IT)",
      pageName: "b51312325b2b08c40391",
    },
    {
      label: "Utilization & Efficiency",
      pageName: "fb50836eeae75753501e",
    },
  ];

  const [activePage, setActivePage] = useState(pages[0]);

  if (!baseUrl) {
    return (
      <div style={{ padding: "24px" }}>
        <h2 style={{ color: "red" }}>
          Power BI base URL not configured
        </h2>
      </div>
    );
  }

  const buildUrl = () => {
    return `${baseUrl}&pageName=${activePage.pageName}`;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "600" }}>
        Indegene Analytics Dashboard
      </h1>

      {/* Custom Tabs */}
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

      {/* Power BI Iframe */}
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