import { NextResponse } from "next/server";
import { getAnalyticsPayload } from "@/lib/server/adminStore";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";

export const runtime = "nodejs";

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const data = await getAnalyticsPayload();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load analytics data", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
