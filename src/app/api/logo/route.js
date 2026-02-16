export const runtime = "nodejs";

function isValidDomain(domain) {
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain || "");
}

async function fetchLogo(url) {
    const response = await fetch(url, {
        cache: "force-cache",
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });
    if (!response.ok || !response.body) return null;
    return response;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const domain = decodeURIComponent(String(searchParams.get("domain") || "")).trim().toLowerCase();

    if (!isValidDomain(domain)) {
        return new Response("Invalid domain", { status: 400 });
    }

    try {
        const providers = [
            `https://logo.clearbit.com/${domain}?size=80`,
            `https://unavatar.io/${domain}`,
            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
        ];

        for (const provider of providers) {
            const response = await fetchLogo(provider);
            if (!response) continue;

            return new Response(response.body, {
                status: 200,
                headers: {
                    "Content-Type": response.headers.get("content-type") || "image/png",
                    "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
                },
            });
        }

        return new Response("Logo not found", { status: 404 });
    } catch {
        return new Response("Failed to load logo", { status: 502 });
    }
}
