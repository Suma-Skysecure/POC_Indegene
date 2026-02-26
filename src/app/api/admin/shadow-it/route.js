import { NextResponse } from "next/server";
import { listShadowItRecords } from "@/lib/server/adminStore";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";

export const runtime = "nodejs";

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const data = await listShadowItRecords();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load shadow IT data", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}
