import { NextResponse } from "next/server";
import {
    deleteCatalogRecords,
    listCatalogRecords,
} from "@/lib/server/adminStore";
import { requireAdminApiKey } from "@/lib/server/adminApiSecurity";

export const runtime = "nodejs";

export async function GET(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const data = await listCatalogRecords();
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to load catalog data", details: error?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    const unauthorized = requireAdminApiKey(request);
    if (unauthorized) return unauthorized;

    try {
        const body = await request.json();
        const ids = Array.isArray(body?.ids) ? body.ids : [];
        const result = await deleteCatalogRecords(ids);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to remove catalog records", details: error?.message || "Unknown error" },
            { status: 400 }
        );
    }
}
