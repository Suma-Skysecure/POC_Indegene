const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let requests = []; // Temporary in-memory storage

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

const addRequestHandler = (req, res) => {
  const newRequest = {
    ...normalizeIncomingRequest(req.body),
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
