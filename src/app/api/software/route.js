import { NextResponse } from "next/server";
import { queryCatalog } from "@/lib/server/softwareCatalog";

export const runtime = "nodejs";

function withDefault(value, fallback) {
    const trimmed = String(value ?? "").trim();
    return trimmed.length > 0 ? trimmed : fallback;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const data = await queryCatalog({
            q: withDefault(searchParams.get("q"), ""),
            namePrefix: withDefault(searchParams.get("namePrefix"), ""),
            category: withDefault(searchParams.get("category"), ""),
            type: withDefault(searchParams.get("type"), ""),
            license: withDefault(searchParams.get("license"), ""),
            sort: withDefault(searchParams.get("sort"), "rowIndex"),
            order: withDefault(searchParams.get("order"), "asc"),
            limit: withDefault(searchParams.get("limit"), "50"),
            offset: withDefault(searchParams.get("offset"), "0"),
        });

        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Failed to load software catalog",
                details: error?.message || "Unknown error",
            },
            { status: 500 }
        );
    }
}
