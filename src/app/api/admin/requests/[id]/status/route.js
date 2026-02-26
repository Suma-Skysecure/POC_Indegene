import { NextResponse } from "next/server";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";
import { updateRequestStatus } from "@/lib/server/adminStore";

export const runtime = "nodejs";

export async function PATCH(request, context) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    const params = await context?.params;
    const id = params?.id;
    if (!id) {
        return NextResponse.json({ error: "Request id is required" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const status = String(body?.status || "").trim();
        if (!status) {
            return NextResponse.json({ error: "status is required" }, { status: 400 });
        }
        const updated = updateRequestStatus(id, status);
        if (!updated) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        return NextResponse.json({ data: updated });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update request status", details: error?.message || "Unknown error" },
            { status: 400 }
        );
    }
}
