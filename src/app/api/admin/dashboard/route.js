import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/server/adminStore";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";

export const runtime = "nodejs";

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const payload = await getDashboardPayload();
        return NextResponse.json(payload);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load admin dashboard data", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
