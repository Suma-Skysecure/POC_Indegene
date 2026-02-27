export function getCatalogLicenseMetricsByPosition(position) {
    const safePosition = Math.max(Number(position) || 0, 0);
    const total = 100 + (safePosition % 6) * 25;
    const used = Math.max(0, total - (10 + (safePosition % 5) * 7));
    return {
        total,
        used,
        available: total - used,
    };
}
