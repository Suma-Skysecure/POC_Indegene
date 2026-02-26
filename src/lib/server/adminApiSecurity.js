import { NextResponse } from "next/server";

export function requireAdminApiKey(request) {
    const requiredKey = process.env.ADMIN_API_KEY;
    if (!requiredKey) return null;

    const providedKey = request.headers.get("x-api-key") || "";
    if (providedKey === requiredKey) return null;

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
