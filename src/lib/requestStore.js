import { requestsData } from '@/data/mockData';

const REQUESTS_STORAGE_KEY = 'indegene_requests_data';
const CURRENT_USER_STORAGE_KEY = 'indegene_current_user';
const REQUESTS_API_URL = process.env.NEXT_PUBLIC_REQUESTS_API_URL || 'http://localhost:5000/requests';
const REQUESTS_API_FALLBACKS = [
    REQUESTS_API_URL,
    'http://localhost:5000/requests',
    'http://localhost:5000/api/requests',
];

const isBrowser = () => typeof window !== 'undefined';

const safeJsonParse = (value, fallback) => {
    try {
        const parsed = JSON.parse(value);
        return parsed ?? fallback;
    } catch {
        return fallback;
    }
};

const extractRequestNumber = (id = '') => {
    const match = String(id).match(/(\d+)/);
    return match ? Number(match[1]) : 0;
};

const formatTimeline = (timeline) => {
    if (timeline === 'low') return 'Low - No immediate deadline';
    if (timeline === 'medium') return 'Medium - Needed within 2 weeks';
    if (timeline === 'high') return 'High - Critical requirement';
    return timeline || 'TBD';
};

const formatUserNameFromEmail = (value = '') => {
    const localPart = String(value).split('@')[0] || '';
    if (!localPart) return '';
    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const formatRequestDate = (date = new Date()) =>
    date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export const loadRequests = () => {
    if (!isBrowser()) return requestsData;
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!stored) return requestsData;
    const parsed = safeJsonParse(stored, []);
    return Array.isArray(parsed) ? parsed : requestsData;
};

export const persistRequests = (requests) => {
    if (!isBrowser()) return;
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
};

export const getNextRequestId = (requests) => {
    const maxId = requests.reduce((max, item) => Math.max(max, extractRequestNumber(item.id)), 0);
    return `#REQ-${maxId + 1}`;
};

export const getCurrentUser = () => {
    if (!isBrowser()) return 'Enduser@indegene.com';
    return localStorage.getItem(CURRENT_USER_STORAGE_KEY) || 'Enduser@indegene.com';
};

export const setCurrentUser = (username) => {
    if (!isBrowser()) return;
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, username);
};

export const addRequestFromForm = ({ requestType, formData }) => {
    const current = loadRequests();
    const nextId = getNextRequestId(current);
    const now = new Date();
    const requester = getCurrentUser();
    const userEmail = formData.userEmail || requester;
    const userName = formData.userName || formatUserNameFromEmail(userEmail) || requester;
    const mappedType = requestType === 'new_license' ? 'Reuse' : 'New';
    const licenses = Number(formData.requiredLicenses || 0);
    const timeline = formatTimeline(formData.timeline);

    const newRequest = {
        id: nextId,
        tool: formData.toolName,
        requester: userName,
        userName,
        userEmail,
        department: formData.department,
        date: formatRequestDate(now),
        status: 'Pending',
        type: mappedType,
        risk: 'Low',
        role: 'End User',
        justification: formData.businessJustification,
        useCase: formData.useCase,
        requestOverview: {
            type: mappedType === 'Reuse' ? 'Reuse Request' : 'New Tool Request',
            tool: formData.toolName,
            vendor: formData.vendor,
            department: formData.department,
            licenses: `${licenses} Licenses`,
            timeline,
        },
        licenseStatus: mappedType === 'Reuse' ? 'Available' : 'Not Available',
        riskPosture: 'Medium',
        equivalentTools: [],
        formPayload: {
            requestType,
            toolName: formData.toolName,
            useCase: formData.useCase,
            vendor: formData.vendor,
            requiredLicenses: licenses,
            timeline: formData.timeline,
            department: formData.department,
            businessJustification: formData.businessJustification,
            numberOfUsers: licenses,
            urgency: formData.timeline,
            userName,
            userEmail,
        },
    };

    const updated = [newRequest, ...current];
    persistRequests(updated);
    return newRequest;
};

const normalizeApiRequest = (item = {}) => {
    const mappedType = item.type || mapRequestType(item.requestType);
    const id = String(item.id || '').trim();
    const userEmail = item.userEmail || item.formPayload?.userEmail || '';
    const rawUserName = item.userName || item.requester || item.formPayload?.userName || '';
    const userName = rawUserName && !String(rawUserName).includes('@')
        ? String(rawUserName)
        : (formatUserNameFromEmail(userEmail || rawUserName) || '');
    return {
        id: id.startsWith('#REQ-') ? id : `#REQ-${id.replace(/\D/g, '') || Date.now()}`,
        tool: item.tool || item.toolName || 'Unknown Tool',
        requester: userName || 'Unknown User',
        userName,
        userEmail,
        department: item.department || 'General',
        date: item.date || formatRequestDate(item.createdAt ? new Date(item.createdAt) : new Date()),
        status: item.status || 'Pending',
        type: mappedType,
        risk: item.risk || 'Low',
        role: item.role || 'End User',
        justification: item.justification || item.businessJustification || '',
        useCase: item.useCase || '',
        requestOverview: item.requestOverview || {
            type: mappedType === 'Reuse' ? 'Reuse Request' : 'New Tool Request',
            tool: item.tool || item.toolName || 'Unknown Tool',
            vendor: item.vendor || '',
            department: item.department || 'General',
            licenses: `${Number(item.requiredLicenses || item.numberOfUsers || 0)} Licenses`,
            timeline: item.timeline || 'TBD',
        },
        formPayload: item.formPayload || {
            requestType: item.requestType || '',
            toolName: item.toolName || item.tool || '',
            useCase: item.useCase || '',
            vendor: item.vendor || '',
            requiredLicenses: Number(item.requiredLicenses || item.numberOfUsers || 0),
            timeline: item.timeline || '',
            department: item.department || '',
            businessJustification: item.businessJustification || item.justification || '',
            userName: userName || '',
            userEmail: userEmail || item.requester || '',
        },
    };
};

const mapRequestType = (requestType = '') => {
    const normalized = String(requestType).toLowerCase();
    if (normalized.includes('license request')) return 'Reuse';
    if (normalized.includes('new software request')) return 'New';
    if (normalized.includes('reuse')) return 'Reuse';
    return 'New';
};

const mergeById = (base, incoming) => {
    const merged = new Map();
    [...incoming, ...base].forEach((item) => {
        if (!item?.id) return;
        merged.set(item.id, item);
    });
    return Array.from(merged.values());
};

const postRequestToBackend = async (payload) => {
    for (const candidate of REQUESTS_API_FALLBACKS) {
        try {
            const response = await fetch(candidate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) continue;
            const data = await response.json();
            if (data?.request) return normalizeApiRequest(data.request);
        } catch {
            // Try next candidate.
        }
    }
    return null;
};

export const addRequestFromFormAndSync = async ({ requestType, formData }) => {
    const localRequest = addRequestFromForm({ requestType, formData });
    const syncedRequest = await postRequestToBackend({
        id: localRequest.id,
        tool: formData.toolName,
        toolName: formData.toolName,
        requestType: requestType === 'new_license' ? 'License Request' : 'New Software Request',
        requester: localRequest.requester,
        userName: localRequest.userName || localRequest.requester,
        userEmail: localRequest.userEmail || localRequest.requester,
        department: formData.department,
        requiredLicenses: Number(formData.requiredLicenses || 0),
        numberOfUsers: Number(formData.requiredLicenses || 0),
        timeline: formData.timeline,
        vendor: formData.vendor,
        useCase: formData.useCase,
        businessJustification: formData.businessJustification,
        createdAt: new Date().toISOString(),
    });

    if (!syncedRequest) return localRequest;

    const current = loadRequests();
    const merged = mergeById(
        current.filter((item) => item.id !== localRequest.id),
        [syncedRequest]
    );
    persistRequests(merged);
    return syncedRequest;
};
