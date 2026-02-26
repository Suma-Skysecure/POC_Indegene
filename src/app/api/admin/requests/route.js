import { NextResponse } from "next/server";
import {
    deleteRequests,
    listRequests,
    upsertRequests,
} from "@/lib/server/adminStore";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";

export const runtime = "nodejs";

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;
    return NextResponse.json({ data: listRequests() });
}

export async function POST(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const body = await request.json();
        const records = Array.isArray(body?.data)
            ? body.data
            : body && typeof body === "object"
                ? [body]
                : [];
        const data = upsertRequests(records);
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to upsert requests", details: error?.message || "Unknown error" },
            { status: 400 }
        );
    }
}

export async function DELETE(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const body = await request.json();
        const ids = Array.isArray(body?.ids) ? body.ids : [];
        const result = deleteRequests(ids);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete requests", details: error?.message || "Unknown error" },
            { status: 400 }
        );
    }
}
