const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const fetchImpl = (() => {
  if (typeof globalThis.fetch === "function") return globalThis.fetch.bind(globalThis);
  // Node < 18 fallback
  // eslint-disable-next-line global-require
  const nodeFetch = require("node-fetch");
  return (nodeFetch.default || nodeFetch);
})();

const app = express();
app.use(cors());
app.use(express.json());

let requests = []; // Temporary in-memory storage
const CATALOG_CSV_PATH = path.join(__dirname, "data", "EPC_Softwarelist.csv");

let catalogCache = null;
let catalogLoadPromise = null;

const DEFAULT_REQUEST_ID_BASE = 8904;
const MAX_REASONABLE_REQUEST_ID = 999999;
const GRAPH_SCOPE = "https://graph.microsoft.com/.default";
const GRAPH_NOTIFICATION_TOPIC_WEB_URL =
  process.env.GRAPH_NOTIFICATION_TOPIC_WEB_URL || "https://teams.microsoft.com/l/app/7c104dc6-7f99-4dd3-9d85-9474977f2d1f";
const EMAIL_UPN_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const formatUserNameFromEmail = (value = "") => {
  const localPart = String(value).split("@")[0] || "";
  if (!localPart) return "";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  const normalizedRequestTool = normalizeText(requestTool);
  if (!normalizedRequestTool) return [];
  // Strict existence check in master catalog by normalized software name.
  return catalogItems.filter(
    (item) => normalizeText(item.softwareName) === normalizedRequestTool
  );
};

const shouldAutoApproveRequest = async (requestBody = {}) => {
  const requestTool = requestBody.tool || requestBody.toolName || "";
  const requestType = requestBody.requestType || "";
  const requiredLicenses = Number(
    requestBody.requiredLicenses
      ?? requestBody.numberOfUsers
      ?? requestBody.formPayload?.requiredLicenses
      ?? 0
  );

  // 1) requestType must be exactly "License Request" (case-insensitive).
  if (String(requestType).trim().toLowerCase() !== "license request") return false;
  // 5) requiredLicenses <= 5.
  if (!Number.isFinite(requiredLicenses) || requiredLicenses > 5) return false;

  const catalogItems = await loadCatalog();
  // 2) software must exist in catalog master list.
  const matchedSoftware = findMatchingCatalogSoftware(requestTool, catalogItems);
  if (matchedSoftware.length === 0) return false;

  return matchedSoftware.some((item) => {
    // 3) category === "Approved Softwares"
    const isApprovedCategory =
      String(item.category).trim().toLowerCase() === "approved softwares";
    // 4) licenseType !== "Unidentified"
    const isIdentifiedLicense =
      String(item.licenseType).trim().toLowerCase() !== "unidentified";
    return isApprovedCategory && isIdentifiedLicense;
  });
};

const normalizeIncomingRequest = (body = {}) => {
  const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();
  const mappedType = body.type || mapRequestType(body.requestType);
  const userEmail = body.userEmail || body.email || body.formPayload?.userEmail || "";
  const rawUserName = body.userName || body.requester || body.formPayload?.userName || "";
  const userName =
    rawUserName && !String(rawUserName).includes("@")
      ? String(rawUserName).trim()
      : formatUserNameFromEmail(userEmail || rawUserName);
  return {
    id: formatRequestId(body.id),
    tool: body.tool || body.toolName || "Unknown Tool",
    requester: userName || userEmail || "Unknown User",
    userName,
    userEmail,
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
      userName,
      userEmail,
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

const isValidUserUpn = (value = "") => EMAIL_UPN_REGEX.test(String(value).trim());

const getGraphAccessToken = async () => {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      "Missing Azure Graph credentials. Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET."
    );
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${encodeURIComponent(
    tenantId
  )}/oauth2/v2.0/token`;

  const response = await fetchImpl(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: GRAPH_SCOPE,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token error: ${response.status} ${text}`);
  }

  const tokenPayload = await response.json();
  if (!tokenPayload.access_token) {
    throw new Error("Token response missing access_token");
  }
  return tokenPayload.access_token;
};

async function sendTeamsActivityNotification(accessToken, userUpn, message) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    userUpn
  )}/teamwork/sendActivityNotification`;

  const DEFAULT_TEAMS_DEEPLINK =
    "https://teams.microsoft.com/l/app/7c104dc6-7f99-4dd3-9d85-9474977f2d1f";
  const rawTopicWebUrl = String(GRAPH_NOTIFICATION_TOPIC_WEB_URL || "");
  const sanitizedTopicWebUrl = rawTopicWebUrl.trim().replace(/^['"]|['"]$/g, "");
  const topicWebUrl = sanitizedTopicWebUrl.startsWith("https://teams.microsoft.com/l/")
    ? sanitizedTopicWebUrl
    : DEFAULT_TEAMS_DEEPLINK;

  const payload = {
    topic: {
      source: "text",
      value: "License Request",
      webUrl: topicWebUrl,
    },
    activityType: "systemDefault",
    previewText: {
      content: "License request update",
    },
    templateParameters: [{ name: "systemDefaultText", value: message }],
  };

  console.log("GRAPH_NOTIFICATION_TOPIC_WEB_URL =", JSON.stringify(GRAPH_NOTIFICATION_TOPIC_WEB_URL));
  console.log("Topic webUrl being sent =", JSON.stringify(payload.topic.webUrl));

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status !== 204) {
    const text = await response.text();
    console.error(`Graph notification error ${response.status}: ${text}`);
    throw new Error(`Graph error: ${response.status} ${text}`);
  }
}

const updateRequestStatus = (requestId, status) => {
  const index = requests.findIndex((item) => String(item.id) === String(requestId));
  if (index === -1) return null;
  requests[index] = { ...requests[index], status };
  return requests[index];
};

const handleApproveReject = (status) => async (req, res) => {
  try {
    const { requestId, userEmail, userUpn } = req.body || {};
    if (!requestId) return res.status(400).json({ error: "requestId is required" });

    const updatedRequest = updateRequestStatus(requestId, status);
    if (!updatedRequest) return res.status(404).json({ error: "Request not found" });

    const candidateUpn =
      userUpn ||
      userEmail ||
      updatedRequest.userEmail ||
      updatedRequest.formPayload?.userEmail ||
      "";
    if (!isValidUserUpn(candidateUpn)) {
      return res.status(400).json({ error: "Valid userEmail/UPN is required for notification" });
    }

    const requestType =
      updatedRequest.formPayload?.requestType ||
      updatedRequest.requestOverview?.type ||
      updatedRequest.type ||
      "request";
    const tool = updatedRequest.tool || updatedRequest.requestOverview?.tool || "tool";
    const action = String(status).toLowerCase() === "approved" ? "approved" : "rejected";
    const message = `Your ${requestType} for ${tool} has been ${action}`;

    console.log(`[notify] requestId=${requestId} userUpn=${candidateUpn}`);
    const accessToken = await getGraphAccessToken();
    await sendTeamsActivityNotification(accessToken, candidateUpn, message);

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

app.get("/test-notify", async (req, res) => {
  try {
    const userUpn = String(req.query.userUpn || "").trim();
    if (!isValidUserUpn(userUpn)) {
      return res.status(400).json({ ok: false, error: "userUpn query param must be a valid email/UPN" });
    }
    const accessToken = await getGraphAccessToken();
    await sendTeamsActivityNotification(accessToken, userUpn, "Test notification from backend");
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

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

app.post(
  "/approve",
  handleApproveReject("Approved")
);
app.post(
  "/reject",
  handleApproveReject("Rejected")
);
app.post(
  "/api/approve",
  handleApproveReject("Approved")
);
app.post(
  "/api/reject",
  handleApproveReject("Rejected")
);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
