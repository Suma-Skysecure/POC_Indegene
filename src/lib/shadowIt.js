export const SHADOW_IT_WHITELIST = [];

const INFRA_KEYWORDS = [
    "microsoft visual c++",
    "redistributable",
    "runtime",
    "driver",
    "update",
    "hotfix",
    "kb",
];

const SECURITY_KEYWORDS = [
    "crowdstrike",
    "zscaler",
    "forcepoint",
    "manageengine",
    "globalprotect",
    "defender",
    "edr",
    "endpoint",
    "sensor",
    "antivirus",
    "vpn",
];

const toNumber = (value) => {
    const parsed = Number.parseInt(String(value ?? "").replace(/,/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeText = (value) => String(value ?? "").trim();
const normalizeLower = (value) => normalizeText(value).toLowerCase();

const getValue = (row, keys) => {
    for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(row, key) && row[key] != null) return row[key];
    }
    return "";
};

export function normalizeCatalogRow(row = {}) {
    return {
        id: normalizeText(getValue(row, ["id"])),
        softwareName: normalizeText(getValue(row, ["softwareName", "Software Name"])),
        category: normalizeText(getValue(row, ["category", "Category"])),
        manufacturer: normalizeText(getValue(row, ["manufacturer", "Manufacturer"])),
        licenseType: normalizeText(getValue(row, ["licenseType", "License Type"])),
        networkInstallations: toNumber(getValue(row, ["networkInstallations", "Network Installations"])),
        managedInstallations: toNumber(getValue(row, ["managedInstallations", "Managed Installations"])),
        version: normalizeText(getValue(row, ["version", "Version"])),
        softwareType: normalizeText(getValue(row, ["softwareType", "Software Type"])),
        logoUrl: normalizeText(getValue(row, ["logoUrl"])),
        logoDomain: normalizeText(getValue(row, ["logoDomain"])),
        owningTeam: Object.prototype.hasOwnProperty.call(row, "owningTeam")
            ? normalizeText(getValue(row, ["owningTeam", "Owning Team"]))
            : undefined,
        contractStatus: Object.prototype.hasOwnProperty.call(row, "contractStatus")
            ? normalizeText(getValue(row, ["contractStatus", "Contract Status"]))
            : undefined,
    };
}

export function isExcluded(row) {
    const name = normalizeLower(row.softwareName);
    if (!name) return true;

    const whitelist = new Set(SHADOW_IT_WHITELIST.map((item) => normalizeLower(item)));
    if (whitelist.has(name)) return true;

    if (INFRA_KEYWORDS.some((keyword) => name.includes(keyword))) return true;
    if (SECURITY_KEYWORDS.some((keyword) => name.includes(keyword))) return true;
    return false;
}

export function computeRisk(row) {
    const licenseType = normalizeLower(row.licenseType);
    const category = normalizeLower(row.category);
    const networkInstallations = toNumber(row.networkInstallations);
    const managedInstallations = toNumber(row.managedInstallations);

    const hasOwningTeamField = typeof row.owningTeam !== "undefined";
    const hasContractStatusField = typeof row.contractStatus !== "undefined";

    const owningTeam = normalizeLower(row.owningTeam);
    const contractStatus = normalizeLower(row.contractStatus);

    const triggers = {
        unidentifiedLicense: licenseType === "unidentified",
        nonCommercial: licenseType === "non commercial",
        highFootprint: networkInstallations >= 50,
        owningTeamMissing: hasOwningTeamField
            ? !owningTeam || owningTeam === "not assigned"
            : false,
        contractStatusRisk: hasContractStatusField
            ? !contractStatus || contractStatus === "unknown" || contractStatus === "expired"
            : false,
    };

    let riskScore = 0;
    if (triggers.unidentifiedLicense) riskScore += 2;
    if (triggers.nonCommercial) riskScore += 1;
    if (networkInstallations >= 200) riskScore += 2;
    else if (networkInstallations >= 50) riskScore += 1;
    if (triggers.owningTeamMissing) riskScore += 1;
    if (triggers.contractStatusRisk) riskScore += 1;

    let riskLevel = "Low";
    if (riskScore >= 4 || networkInstallations >= 200) riskLevel = "High";
    else if (riskScore >= 2) riskLevel = "Medium";

    return {
        riskScore,
        riskLevel,
        triggers,
        isNotApproved: category !== "approved softwares",
        isActivelyUsed: networkInstallations > 0 || managedInstallations > 0,
        networkInstallations,
        managedInstallations,
    };
}

export function isShadowItCandidate(row) {
    const risk = computeRisk(row);
    const hasRiskTrigger =
        risk.triggers.unidentifiedLicense ||
        risk.triggers.nonCommercial ||
        risk.triggers.owningTeamMissing ||
        risk.triggers.contractStatusRisk ||
        risk.triggers.highFootprint;

    return risk.isNotApproved && risk.isActivelyUsed && hasRiskTrigger;
}

export function buildShadowItList(rows = []) {
    return rows
        .map(normalizeCatalogRow)
        .filter((row) => row.softwareName)
        .filter((row) => !isExcluded(row))
        .filter((row) => isShadowItCandidate(row))
        .map((row, index) => {
            const risk = computeRisk(row);
            return {
                ...row,
                id: row.id || `${row.softwareName}-${row.manufacturer}-${index}`,
                app: row.softwareName,
                riskLevel: risk.riskLevel,
                riskScore: risk.riskScore,
                users: risk.networkInstallations,
                installations: `${risk.networkInstallations} / ${risk.managedInstallations}`,
                triggers: risk.triggers,
            };
        });
}

