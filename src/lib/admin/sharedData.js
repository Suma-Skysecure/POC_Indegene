export const DASHBOARD_KPI_SEED = {
    totalSoftwareSpend: "INR12.4M",
    softwareSpendChange: "4% QoQ",
    costAvoidedViaReuse: "INR1.2M",
    costAvoidedChange: "18%",
    knownToolsPercent: 68,
    unknownToolsPercent: 32,
    avgApprovalTime: "2.4 days",
    avgApprovalTimeChange: "30%",
    totalReuseTools: 342,
    totalReuseToolsChange: "12%",
};

export const DASHBOARD_CHARTS_SEED = {
    spendTrend: [
        { month: "May", value: 180 },
        { month: "Jun", value: 210 },
        { month: "Jul", value: 195 },
        { month: "Aug", value: 230 },
        { month: "Sep", value: 215 },
        { month: "Oct", value: 250 },
    ],
    toolUsage: [
        { name: "Figma", Sales: 80, External: 20, Internal: 30 },
        { name: "Sketch", Sales: 60, External: 70, Internal: 100 },
        { name: "XD", Sales: 25, External: 35, Internal: 90 },
        { name: "PS", Sales: 100, External: 90, Internal: 15 },
        { name: "AI", Sales: 90, External: 30, Internal: 90 },
        { name: "Corel", Sales: 40, External: 85, Internal: 75 },
        { name: "InDes", Sales: 65, External: 85, Internal: 70 },
        { name: "Canva", Sales: 45, External: 35, Internal: 70 },
        { name: "Webflow", Sales: 25, External: 20, Internal: 80 },
        { name: "Affinity", Sales: 35, External: 55, Internal: 70 },
        { name: "Marker", Sales: 30, External: 55, Internal: 30 },
        { name: "Figma", Sales: 65, External: 35, Internal: 100 },
    ],
};

export const ANALYTICS_PAGES_SEED = [
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

export const DASHBOARD_RECENT_LIMIT = 5;
