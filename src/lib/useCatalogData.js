"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_FACETS = { categories: [], softwareTypes: [], licenseTypes: [] };

export function useCatalogData(params = {}, options = {}) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [facets, setFacets] = useState(DEFAULT_FACETS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const queryString = useMemo(() => {
        const normalized = {
            q: String(params.q ?? "").trim(),
            namePrefix: String(params.namePrefix ?? "").trim(),
            category: String(params.category ?? "").trim(),
            type: String(params.type ?? "").trim(),
            license: String(params.license ?? "").trim(),
            sort: String(params.sort ?? "rowIndex").trim(),
            order: String(params.order ?? "asc").trim(),
            limit: String(params.limit ?? 50).trim(),
            offset: String(params.offset ?? 0).trim(),
            refreshKey: String(params.refreshKey ?? "").trim(),
        };
        return new URLSearchParams(normalized).toString();
    }, [params]);

    useEffect(() => {
        const enabled = options.enabled ?? true;
        if (!enabled) return;

        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await fetch(`/api/software?${queryString}`, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                const payload = await response.json();
                setItems(Array.isArray(payload.items) ? payload.items : []);
                setTotal(Number(payload.total) || 0);
                setFacets(payload.facets || DEFAULT_FACETS);
            } catch (fetchError) {
                if (fetchError.name === "AbortError") return;
                setError(fetchError.message || "Failed to load software data");
                setItems([]);
                setTotal(0);
                setFacets(DEFAULT_FACETS);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [queryString, options.enabled]);

    return { items, total, facets, loading, error };
}

