import { requestsData } from '@/data/mockData';

const REQUESTS_STORAGE_KEY = 'indegene_requests_data';
const CURRENT_USER_STORAGE_KEY = 'indegene_current_user';

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
    const mappedType = requestType === 'new_license' ? 'Reuse' : 'New';
    const licenses = Number(formData.requiredLicenses || 0);
    const timeline = formatTimeline(formData.timeline);

    const newRequest = {
        id: nextId,
        tool: formData.toolName,
        requester,
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
        },
    };

    const updated = [newRequest, ...current];
    persistRequests(updated);
    return newRequest;
};
