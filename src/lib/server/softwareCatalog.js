import fs from "node:fs/promises";
import path from "node:path";

const CSV_PATH = path.join(process.cwd(), "backend", "data", "EPC_Softwarelist.csv");

let cache = null;
let cacheLoadedAt = 0;
let cacheFileMtimeMs = 0;
let cachePromise = null;

const HEADER_MAP = {
    "software name": "softwareName",
    "version": "version",
    "manufacturer": "manufacturer",
    "license type": "licenseType",
    "category": "category",
    "network installations": "networkInstallations",
    "managed installations": "managedInstallations",
    "software type": "softwareType",
};

function normalizeHeader(header) {
    const cleaned = String(header || "").trim().toLowerCase();
    return HEADER_MAP[cleaned] || cleaned.replace(/\s+/g, "");
}

function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];

        if (ch === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (ch === "," && !inQuotes) {
            values.push(current);
            current = "";
            continue;
        }

        current += ch;
    }

    values.push(current);
    return values.map((v) => v.trim());
}

function toInt(value) {
    const parsed = Number.parseInt(String(value ?? "").replace(/,/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRow(row, index) {
    return {
        id: `${row.softwareName || "software"}-${index}`,
        rowIndex: index,
        softwareName: row.softwareName || "-",
        version: row.version || "-",
        manufacturer: row.manufacturer || "-",
        licenseType: row.licenseType || "-",
        category: row.category || "-",
        networkInstallations: toInt(row.networkInstallations),
        managedInstallations: toInt(row.managedInstallations),
        softwareType: row.softwareType || "-",
    };
}

async function loadCatalogFromDisk(fileMtimeMs) {
    const csv = await fs.readFile(CSV_PATH, "utf8");
    const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
        return { items: [], fileMtimeMs };
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    const items = [];

    for (let i = 1; i < lines.length; i += 1) {
        const cells = parseCsvLine(lines[i]);
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = cells[idx] ?? "";
        });
        items.push(normalizeRow(row, i - 1));
    }

    return { items, fileMtimeMs };
}

export async function getCatalogData() {
    const stat = await fs.stat(CSV_PATH);
    const fileMtimeMs = Number(stat.mtimeMs) || 0;

    if (cache && cacheFileMtimeMs === fileMtimeMs) {
        return { items: cache, loadedAt: cacheLoadedAt };
    }

    if (!cachePromise || cacheFileMtimeMs !== fileMtimeMs) {
        cachePromise = loadCatalogFromDisk(fileMtimeMs);
    }
    const result = await cachePromise;
    cache = result.items;
    cacheLoadedAt = Date.now();
    cacheFileMtimeMs = result.fileMtimeMs;
    return { items: cache, loadedAt: cacheLoadedAt };
}

function contains(text, query) {
    return String(text || "").toLowerCase().includes(query);
}

function facetCounts(items, key) {
    const map = new Map();
    items.forEach((item) => {
        const value = item[key] || "-";
        map.set(value, (map.get(value) || 0) + 1);
    });
    return [...map.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
}

function compareBySort(a, b, sort) {
    if (sort === "rowIndex") return a.rowIndex - b.rowIndex;
    if (sort === "networkInstallations") return a.networkInstallations - b.networkInstallations;
    if (sort === "managedInstallations") return a.managedInstallations - b.managedInstallations;
    if (sort === "version") return a.version.localeCompare(b.version);
    if (sort === "manufacturer") return a.manufacturer.localeCompare(b.manufacturer);
    if (sort === "licenseType") return a.licenseType.localeCompare(b.licenseType);
    if (sort === "category") return a.category.localeCompare(b.category);
    if (sort === "softwareType") return a.softwareType.localeCompare(b.softwareType);
    return a.softwareName.localeCompare(b.softwareName);
}

export async function queryCatalog(params = {}) {
    const { items } = await getCatalogData();

    const q = String(params.q || "").trim().toLowerCase();
    const namePrefix = String(params.namePrefix || "").trim().toLowerCase();
    const category = String(params.category || "").trim().toLowerCase();
    const type = String(params.type || "").trim().toLowerCase();
    const license = String(params.license || "").trim().toLowerCase();
    const sort = String(params.sort || "rowIndex");
    const order = String(params.order || "asc").toLowerCase() === "desc" ? "desc" : "asc";
    const limit = Math.min(Math.max(Number.parseInt(params.limit, 10) || 50, 1), 500);
    const offset = Math.max(Number.parseInt(params.offset, 10) || 0, 0);

    const filtered = items.filter((item) => {
        const matchesQ = !q
            || contains(item.softwareName, q)
            || contains(item.manufacturer, q)
            || contains(item.version, q)
            || contains(item.category, q)
            || contains(item.softwareType, q)
            || contains(item.licenseType, q);
        const matchesNamePrefix = !namePrefix
            || String(item.softwareName || "").toLowerCase().startsWith(namePrefix);
        const matchesCategory = !category || String(item.category).toLowerCase() === category;
        const matchesType = !type || String(item.softwareType).toLowerCase() === type;
        const matchesLicense = !license || String(item.licenseType).toLowerCase() === license;
        return matchesQ && matchesNamePrefix && matchesCategory && matchesType && matchesLicense;
    });

    filtered.sort((a, b) => {
        const result = compareBySort(a, b, sort);
        return order === "desc" ? -result : result;
    });

    const itemsPage = filtered.slice(offset, offset + limit);

    return {
        total: filtered.length,
        items: itemsPage,
        facets: {
            categories: facetCounts(filtered, "category"),
            softwareTypes: facetCounts(filtered, "softwareType"),
            licenseTypes: facetCounts(filtered, "licenseType"),
        },
    };
}

export function clearCatalogCache() {
    cache = null;
    cacheLoadedAt = 0;
    cacheFileMtimeMs = 0;
    cachePromise = null;
}

// Warm cache when server module is loaded.
void getCatalogData().catch(() => {
    cache = null;
    cacheLoadedAt = 0;
    cacheFileMtimeMs = 0;
    cachePromise = null;
});
