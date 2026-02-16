const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const app = express();
app.use(cors());
app.use(express.json());

let requests = []; // Temporary in-memory storage
const CATALOG_CSV_PATH = path.join(__dirname, "data", "EPC_Softwarelist.csv");

let catalogCache = null;
let catalogLoadPromise = null;

const DEFAULT_REQUEST_ID_BASE = 8904;
const MAX_REASONABLE_REQUEST_ID = 999999;

const extractRequestNumber = (value = "") => {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

const isReasonableRequestNumber = (value) =>
  Number.isInteger(value) && value > 0 && value <= MAX_REASONABLE_REQUEST_ID;

const getNextRequestId = (incomingId) => {
  const maxInMemory = requests.reduce((max, item) => {
    const current = extractRequestNumber(item.id);
    return isReasonableRequestNumber(current) ? Math.max(max, current) : max;
  }, DEFAULT_REQUEST_ID_BASE);
  const incomingNumber = extractRequestNumber(incomingId);
  const maxSeed = isReasonableRequestNumber(incomingNumber)
    ? Math.max(maxInMemory, incomingNumber)
    : maxInMemory;
  return `#REQ-${maxSeed + 1}`;
};

const formatRequestId = (value) => {
  return getNextRequestId(value);
};

const mapRequestType = (requestType = "") => {
  const value = String(requestType).toLowerCase();
  if (value.includes("license request")) return "Reuse";
  if (value.includes("new software request")) return "New";
  if (value.includes("reuse")) return "Reuse";
  return "New";
};

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "tool",
  "tools",
  "software",
  "license",
  "request",
  "app",
  "apps",
  "new",
]);

const toKeywordSet = (value = "") => {
  const normalized = normalizeText(value);
  if (!normalized) return new Set();
  return new Set(
    normalized
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word))
  );
};

const normalizeCatalogRow = (row = {}) => {
  const softwareName = String(row["Software Name"] || "").trim();
  const category = String(row["Category"] || "").trim();
  const licenseType = String(row["License Type"] || "").trim();
  return {
    softwareName,
    category,
    licenseType,
    normalizedSoftwareName: normalizeText(softwareName),
    softwareKeywords: toKeywordSet(softwareName),
  };
};

const loadCatalog = async () => {
  if (catalogCache) return catalogCache;
  if (!catalogLoadPromise) {
    catalogLoadPromise = new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(CATALOG_CSV_PATH)
        .pipe(csv())
        .on("data", (row) => {
          rows.push(normalizeCatalogRow(row));
        })
        .on("end", () => {
          catalogCache = rows;
          resolve(catalogCache);
        })
        .on("error", reject);
    });
  }
  return catalogLoadPromise;
};

const hasKeywordMatch = (requestTool = "", catalogItem = {}) => {
  const requestNormalized = normalizeText(requestTool);
  if (!requestNormalized || !catalogItem.normalizedSoftwareName) return false;

  if (
    catalogItem.normalizedSoftwareName.includes(requestNormalized) ||
    requestNormalized.includes(catalogItem.normalizedSoftwareName)
  ) {
    return true;
  }

  const requestKeywords = toKeywordSet(requestNormalized);
  if (requestKeywords.size === 0) return false;

  let overlapCount = 0;
  for (const keyword of requestKeywords) {
    if (catalogItem.softwareKeywords.has(keyword)) overlapCount += 1;
  }

  // Single-word requests like "zoom" can match on one keyword.
  if (requestKeywords.size <= 1) return overlapCount >= 1;
  // Multi-word requests should have stronger overlap to avoid false matches
  // (e.g. "Windows ..." accidentally matching "CrowdStrike Windows Sensor").
  return overlapCount >= 2;
};

const findMatchingCatalogSoftware = (requestTool = "", catalogItems = []) => {
  return catalogItems.filter((item) => hasKeywordMatch(requestTool, item));
};

const isLicenseRequest = (requestType = "", mappedType = "") => {
  const normalized = String(requestType).trim().toLowerCase();
  if (normalized === "license request") return true;
  // Keep compatibility with existing request form value.
  if (normalized === "new_license") return true;
  return String(mappedType).toLowerCase() === "reuse";
};

const shouldAutoApproveRequest = async (requestBody = {}) => {
  const requestTool = requestBody.tool || requestBody.toolName || "";
  const requestType = requestBody.requestType || "";
  const mappedType = requestBody.type || mapRequestType(requestType);
  const requiredLicenses = Number(
    requestBody.requiredLicenses
      ?? requestBody.numberOfUsers
      ?? requestBody.formPayload?.requiredLicenses
      ?? 0
  );

  if (!isLicenseRequest(requestType, mappedType)) return false;
  if (!Number.isFinite(requiredLicenses) || requiredLicenses > 5) return false;

  const catalogItems = await loadCatalog();
  const matchedSoftware = findMatchingCatalogSoftware(requestTool, catalogItems);
  if (matchedSoftware.length === 0) return false;

  return matchedSoftware.some((item) => {
    const isApprovedCategory =
      String(item.category).trim().toLowerCase() === "approved softwares";
    const isIdentifiedLicense =
      String(item.licenseType).trim().toLowerCase() !== "unidentified";
    return isApprovedCategory && isIdentifiedLicense;
  });
};

const normalizeIncomingRequest = (body = {}) => {
  const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();
  const mappedType = body.type || mapRequestType(body.requestType);
  return {
    id: formatRequestId(body.id),
    tool: body.tool || body.toolName || "Unknown Tool",
    requester: body.requester || body.userEmail || "Unknown User",
    department: body.department || "General",
    status: body.status || "Pending",
    type: mappedType,
    risk: body.risk || "Low",
    date: createdAt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    createdAt,
    useCase: body.useCase || "",
    justification: body.justification || body.businessJustification || "",
    requestOverview: {
      type: mappedType === "Reuse" ? "Reuse Request" : "New Tool Request",
      tool: body.tool || body.toolName || "Unknown Tool",
      vendor: body.vendor || "",
      department: body.department || "General",
      licenses: `${Number(body.requiredLicenses || body.numberOfUsers || 0)} Licenses`,
      timeline: body.timeline || "TBD",
    },
    formPayload: {
      requestType: body.requestType || "",
      toolName: body.toolName || body.tool || "",
      useCase: body.useCase || "",
      vendor: body.vendor || "",
      requiredLicenses: Number(body.requiredLicenses || body.numberOfUsers || 0),
      timeline: body.timeline || "",
      department: body.department || "",
      businessJustification: body.businessJustification || body.justification || "",
      userEmail: body.userEmail || body.requester || "",
    },
  };
};

const addRequestHandler = async (req, res) => {
  const autoApproved = await shouldAutoApproveRequest(req.body);
  const incomingStatus = req.body?.status;
  const status = incomingStatus || (autoApproved ? "Approved" : "Pending");

  const newRequest = {
    ...normalizeIncomingRequest({ ...req.body, status }),
  };

  requests.unshift(newRequest);
  console.log("New request added:", newRequest);

  res.status(200).json({ message: "Request saved successfully", request: newRequest });
};

// Receive request from Copilot/agent
app.post("/api/requests", addRequestHandler);
app.post("/requests", addRequestHandler);

// Send requests to frontend
app.get("/api/requests", (req, res) => {
  res.json(requests);
});
app.get("/requests", (req, res) => {
  res.json(requests);
});

// Update status from admin actions
app.patch("/requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: "status is required" });
  const index = requests.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ message: "Request not found" });
  requests[index] = { ...requests[index], status };
  res.json(requests[index]);
});
app.patch("/api/requests/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: "status is required" });
  const index = requests.findIndex((item) => item.id === id);
  if (index === -1) return res.status(404).json({ message: "Request not found" });
  requests[index] = { ...requests[index], status };
  res.json(requests[index]);
});

const deleteRequestsHandler = (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  if (ids.length === 0) {
    return res.status(400).json({ message: "ids array is required" });
  }
  const beforeCount = requests.length;
  requests = requests.filter((item) => !ids.includes(String(item.id)));
  const deletedCount = beforeCount - requests.length;
  return res.json({ message: "Requests deleted", deletedCount, remaining: requests.length });
};

app.delete("/requests", deleteRequestsHandler);
app.delete("/api/requests", deleteRequestsHandler);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
