"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Table from '@/components/Table';
import RequestDetailsSidebar from '@/components/RequestDetailsSidebar';
import { Search, Filter, Download, Clock, CheckCircle, Hourglass, AlertTriangle, CheckSquare, XSquare, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { loadRequests, persistRequests } from '@/lib/requestStore';
import { getCatalogLicenseMetricsByPosition } from '@/lib/licenseMetrics';

const REQUESTS_API_URL = process.env.NEXT_PUBLIC_REQUESTS_API_URL || 'http://localhost:5000/requests';
const REQUESTS_API_FALLBACKS = [
    '/api/admin/requests',
    REQUESTS_API_URL,
    'http://localhost:5000/requests',
    'http://localhost:5000/api/requests',
];
const BUSINESS_DOMAIN_OWNERS = ['Jai Kumar', 'Pranav Sharma', 'Shravan Chandra', 'Aarati Daivan', 'Maanya Kumari'];
const IT_DOMAIN_OWNERS = ['John', 'Saara Mathew', 'Shwetha Verma', 'Maanav Gupta', 'Manikantan'];

const formatDisplayDate = (value) => {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) {
        return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const mapRequestType = (requestType = '') => {
    const normalized = String(requestType).toLowerCase();
    if (normalized.includes('license request')) return 'Reuse';
    if (normalized.includes('new software request')) return 'New';
    if (normalized.includes('reuse')) return 'Reuse';
    return 'New';
};

const extractRequestNumber = (id = '') => {
    const match = String(id).match(/(\d+)/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const normalizeToolName = (value = '') =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9]+/g, '');

const formatUserNameFromEmail = (value = '') => {
    const localPart = String(value).split('@')[0] || '';
    if (!localPart) return '';
    return localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const normalizeApiRequest = (item = {}) => {
    const type = item.type || mapRequestType(item.requestType);
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
        date: item.date || formatDisplayDate(item.createdAt),
        status: item.status || 'Pending',
        type,
        risk: item.risk || 'Low',
        role: item.role || 'End User',
        justification: item.justification || item.businessJustification || '',
        useCase: item.useCase || '',
        requestOverview: item.requestOverview || {
            type: type === 'Reuse' ? 'Reuse Request' : 'New Tool Request',
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
            userEmail: userEmail || '',
        },
    };
};

const mergeById = (base, incoming) => {
    const merged = new Map();
    [...incoming, ...base].forEach((item) => {
        if (!item?.id) return;
        merged.set(item.id, item);
    });
    return Array.from(merged.values());
};

// Simple Stat Card for this specific page layout
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center">
        <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mr-4", bgClass)}>
            <Icon className={clsx("w-6 h-6", colorClass)} />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default function RequestsPage() {
    const [currentRequests, setCurrentRequests] = useState(() => loadRequests());
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All Requests');
    const [filterType, setFilterType] = useState('All Types');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [filterRisk, setFilterRisk] = useState('All Risks');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [currentPage, setCurrentPage] = useState(1);
    const [activeApiUrl, setActiveApiUrl] = useState(REQUESTS_API_URL);
    const [modalLicenseStats, setModalLicenseStats] = useState({ total: 0, used: 0, available: 0, loading: false });
    const [stakeholdersByRequest, setStakeholdersByRequest] = useState({});
    const [businessValidationByRequest, setBusinessValidationByRequest] = useState({});
    const [tprmEvaluationByRequest, setTprmEvaluationByRequest] = useState({});
    const [procurementTrackingByRequest, setProcurementTrackingByRequest] = useState({});
    const lastAdminSyncSignatureRef = useRef('');
    const ITEMS_PER_PAGE = 7;

    const syncRequestsToAdminStore = useCallback(async (records) => {
        const payload = Array.isArray(records) ? records : [];
        if (payload.length === 0) return;
        const signature = payload
            .map((item) => `${item.id}:${item.status}:${item.date || ''}:${item.createdAt || ''}`)
            .join('|');
        if (lastAdminSyncSignatureRef.current === signature) return;

        try {
            await fetch('/api/admin/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: payload }),
            });
            lastAdminSyncSignatureRef.current = signature;
        } catch (error) {
            console.error('Failed to sync requests to admin store:', error);
        }
    }, []);

    const getStatusEndpoint = useCallback((baseUrl, id) => {
        const sanitized = String(baseUrl || '').replace(/\/+$/, '');
        if (sanitized.endsWith('/api/requests')) {
            return `${sanitized}/${encodeURIComponent(id)}/status`;
        }
        if (sanitized.endsWith('/requests')) {
            return `${sanitized}/${encodeURIComponent(id)}/status`;
        }
        return `${sanitized}/requests/${encodeURIComponent(id)}/status`;
    }, []);

    const getNotificationEndpoint = useCallback((baseUrl, status) => {
        const sanitized = String(baseUrl || '').replace(/\/+$/, '');
        const action = String(status || '').toLowerCase() === 'approved' ? 'approve' : 'reject';
        if (sanitized.endsWith('/api/requests')) {
            return sanitized.replace(/\/api\/requests$/i, `/api/${action}`);
        }
        if (sanitized.endsWith('/requests')) {
            return sanitized.replace(/\/requests$/i, `/${action}`);
        }
        return `${sanitized}/${action}`;
    }, []);

    const getDeleteEndpoint = useCallback((baseUrl) => {
        const sanitized = String(baseUrl || '').replace(/\/+$/, '');
        if (sanitized.endsWith('/api/requests')) return sanitized;
        if (sanitized.endsWith('/requests')) return sanitized;
        return `${sanitized}/requests`;
    }, []);

    const syncRequestsFromApi = useCallback(async () => {
        const candidates = Array.from(new Set(REQUESTS_API_FALLBACKS));
        const results = await Promise.all(candidates.map(async (candidate) => {
            try {
                const response = await fetch(candidate, { cache: 'no-store' });
                if (!response.ok) return null;
                const payload = await response.json();
                const records = Array.isArray(payload) ? payload : payload?.data;
                if (!Array.isArray(records)) return null;
                return {
                    candidate,
                    mapped: records.map(normalizeApiRequest),
                };
            } catch {
                return null;
            }
        }));

        const successful = results.filter(Boolean);
        if (successful.length === 0) {
            console.error('Failed to sync admin requests from all configured endpoints.');
            return;
        }

        const mergedRemote = successful.reduce((acc, entry) => mergeById(acc, entry.mapped), []);
        setCurrentRequests((prev) => {
            const next = mergeById(prev, mergedRemote);
            persistRequests(next);
            void syncRequestsToAdminStore(next);
            return next;
        });

        const preferred = successful.find((entry) => !String(entry.candidate).includes('/api/admin/requests'));
        setActiveApiUrl(preferred ? preferred.candidate : successful[0].candidate);
    }, [syncRequestsToAdminStore]);

    useEffect(() => {
        syncRequestsFromApi();
        const interval = setInterval(syncRequestsFromApi, 5000);
        return () => clearInterval(interval);
    }, [syncRequestsFromApi]);

    useEffect(() => {
        void syncRequestsToAdminStore(currentRequests);
    }, [currentRequests, syncRequestsToAdminStore]);

    const pushStatusToApi = async (id, status) => {
        try {
            await fetch(`/api/admin/requests/${encodeURIComponent(id)}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const requestRecord = currentRequests.find((item) => item.id === id);
            if (!String(activeApiUrl).includes('/api/admin/requests')) {
                await fetch(getStatusEndpoint(activeApiUrl, id), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });

                const userEmail =
                    requestRecord?.userEmail
                    || requestRecord?.formPayload?.userEmail
                    || '';
                await fetch(getNotificationEndpoint(activeApiUrl, status), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        requestId: id,
                        userEmail,
                        userUpn: userEmail,
                    }),
                });
            }
        } catch (error) {
            console.error('Failed to update request status in backend:', error);
        }
    };

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setSelectedIds([]); // Clear selection on action
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const updateRequests = (updater) => {
        setCurrentRequests(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            persistRequests(next);
            void syncRequestsToAdminStore(next);
            return next;
        });
    };

    const handleApprove = async (id) => {
        updateRequests(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'Approved' } : item
        ));
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest(prev => ({ ...prev, status: 'Approved' }));
        }
        await pushStatusToApi(id, 'Approved');
        showNotification('Request approved successfully!');
    };

    const handleReject = async (id) => {
        updateRequests(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'Rejected' } : item
        ));
        if (selectedRequest && selectedRequest.id === id) {
            setSelectedRequest(prev => ({ ...prev, status: 'Rejected' }));
        }
        await pushStatusToApi(id, 'Rejected');
        showNotification('Request rejected successfully!', 'error');
    };

    const handleBulkApprove = async () => {
        updateRequests(prev => prev.map(item =>
            selectedIds.includes(item.id) ? { ...item, status: 'Approved' } : item
        ));
        await Promise.all(selectedIds.map(async (id) => pushStatusToApi(id, 'Approved')));
        showNotification(`${selectedIds.length} requests approved successfully!`);
    };

    const handleBulkReject = async () => {
        updateRequests(prev => prev.map(item =>
            selectedIds.includes(item.id) ? { ...item, status: 'Rejected' } : item
        ));
        await Promise.all(selectedIds.map(async (id) => pushStatusToApi(id, 'Rejected')));
        showNotification(`${selectedIds.length} requests rejected successfully!`, 'error');
    };

    const handleBulkDelete = async () => {
        const idsToDelete = [...selectedIds];
        if (idsToDelete.length === 0) return;
        updateRequests(prev => prev.filter((item) => !idsToDelete.includes(item.id)));
        if (selectedRequest && idsToDelete.includes(selectedRequest.id)) {
            setSelectedRequest(null);
        }
        try {
            await fetch(getDeleteEndpoint(activeApiUrl), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: idsToDelete }),
            });
        } catch (error) {
            console.error('Failed to delete requests in backend:', error);
        }
        showNotification(`${idsToDelete.length} requests deleted successfully!`, 'error');
    };

    const toggleSelectAll = () => {
        const pageIds = paginatedData.map((r) => r.id);
        const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
        if (allPageSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
            return;
        }
        setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
    };

    const closeSidebar = () => {
        setSelectedRequest(null);
    };

    const isSidebarReviewType = (request) => {
        const normalizedType = String(request?.type || '').toLowerCase();
        return normalizedType.includes('reuse') || normalizedType.includes('expansion');
    };

    const getEmptyStakeholderState = () => ({
        businessDomainOwner: '',
        itDomainOwner: '',
        businessDomainOwnerStatus: 'Not Assigned',
        itDomainOwnerStatus: 'Not Assigned',
        businessDomainOwnerLocked: false,
        itDomainOwnerLocked: false,
    });

    const selectedRequestStakeholders = selectedRequest
        ? (stakeholdersByRequest[selectedRequest.id] || getEmptyStakeholderState())
        : null;

    const handleStakeholderChange = (field, value) => {
        if (!selectedRequest?.id) return;
        const lockField = field === 'businessDomainOwner' ? 'businessDomainOwnerLocked' : 'itDomainOwnerLocked';
        if (selectedRequestStakeholders?.[lockField]) return;
        setStakeholdersByRequest((prev) => ({
            ...prev,
            [selectedRequest.id]: {
                ...(prev[selectedRequest.id] || getEmptyStakeholderState()),
                [field]: value,
            },
        }));
    };

    const handleStakeholderAction = (ownerKey, action) => {
        if (!selectedRequest?.id) return;
        const statusField = ownerKey === 'businessDomainOwner' ? 'businessDomainOwnerStatus' : 'itDomainOwnerStatus';
        const lockField = ownerKey === 'businessDomainOwner' ? 'businessDomainOwnerLocked' : 'itDomainOwnerLocked';
        const selectedOwner = selectedRequestStakeholders?.[ownerKey];
        if (selectedRequestStakeholders?.[lockField]) return;
        if (!selectedOwner && action === 'Assign') return;

        setStakeholdersByRequest((prev) => ({
            ...prev,
            [selectedRequest.id]: {
                ...(prev[selectedRequest.id] || getEmptyStakeholderState()),
                [statusField]: action === 'Assign' ? 'Assigned' : action,
                [lockField]: true,
            },
        }));
    };

    const getStakeholderStatusClasses = (status) => {
        if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200';
        if (status === 'Assigned') return 'bg-blue-50 text-blue-700 border-blue-200';
        return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    const getEmptyBusinessValidationState = () => ({
        roiJustification: '',
        budgetDetails: '',
        sponsorInformation: '',
        financeApproval: '',
    });

    const selectedRequestBusinessValidation = selectedRequest
        ? (businessValidationByRequest[selectedRequest.id] || getEmptyBusinessValidationState())
        : null;

    const handleBusinessValidationChange = (field, value) => {
        if (!selectedRequest?.id) return;
        setBusinessValidationByRequest((prev) => ({
            ...prev,
            [selectedRequest.id]: {
                ...(prev[selectedRequest.id] || getEmptyBusinessValidationState()),
                [field]: value,
            },
        }));
    };

    const getEmptyTprmEvaluationState = () => ({
        vendorName: '',
        riskLevel: '',
        complianceStatus: '',
        securityApproval: '',
    });

    const selectedRequestTprmEvaluation = selectedRequest
        ? (tprmEvaluationByRequest[selectedRequest.id] || getEmptyTprmEvaluationState())
        : null;

    const handleTprmEvaluationChange = (field, value) => {
        if (!selectedRequest?.id) return;
        setTprmEvaluationByRequest((prev) => ({
            ...prev,
            [selectedRequest.id]: {
                ...(prev[selectedRequest.id] || getEmptyTprmEvaluationState()),
                [field]: value,
            },
        }));
    };

    const getEmptyProcurementTrackingState = () => ({
        msa: false,
        dpa: false,
        po: false,
    });

    const selectedRequestProcurementTracking = selectedRequest
        ? (procurementTrackingByRequest[selectedRequest.id] || getEmptyProcurementTrackingState())
        : null;

    const handleProcurementTrackingChange = (field, checked) => {
        if (!selectedRequest?.id) return;
        setProcurementTrackingByRequest((prev) => ({
            ...prev,
            [selectedRequest.id]: {
                ...(prev[selectedRequest.id] || getEmptyProcurementTrackingState()),
                [field]: checked,
            },
        }));
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadModalLicenseStats = async () => {
            if (!selectedRequest || isSidebarReviewType(selectedRequest)) {
                setModalLicenseStats({ total: 0, used: 0, available: 0, loading: false });
                return;
            }

            const requestedTool = String(selectedRequest.requestOverview?.tool || selectedRequest.tool || '').trim();
            if (!requestedTool) {
                setModalLicenseStats({ total: 0, used: 0, available: 0, loading: false });
                return;
            }

            try {
                setModalLicenseStats((prev) => ({ ...prev, loading: true }));
                const params = new URLSearchParams({
                    q: requestedTool,
                    sort: 'rowIndex',
                    order: 'asc',
                    limit: '100',
                    offset: '0',
                });
                const response = await fetch(`/api/software?${params.toString()}`, {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
                const payload = await response.json();
                const items = Array.isArray(payload.items) ? payload.items : [];
                const requestedKey = normalizeToolName(requestedTool);
                const matched = items.find((item) => normalizeToolName(item.softwareName) === requestedKey);

                if (!matched) {
                    setModalLicenseStats({ total: 0, used: 0, available: 0, loading: false });
                    return;
                }

                const metrics = getCatalogLicenseMetricsByPosition(matched.rowIndex);
                setModalLicenseStats({
                    total: metrics.total,
                    used: metrics.used,
                    available: metrics.available,
                    loading: false,
                });
            } catch (error) {
                if (error.name === 'AbortError') return;
                setModalLicenseStats({ total: 0, used: 0, available: 0, loading: false });
            }
        };

        void loadModalLicenseStats();
        return () => controller.abort();
    }, [selectedRequest]);

    // Filter Logic
    const filteredByTab = currentRequests.filter(item => {
        if (activeTab === 'All Pending (42)') return item.status === 'Pending';
        if (activeTab === 'Approved Requests') return item.status === 'Approved';
        if (activeTab === 'Reuse Requests') return item.type === 'Reuse';
        return true;
    });

    const filteredData = filteredByTab.filter(item => {
        const matchesSearch =
            String(item.tool || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.requester || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'All Types' || item.type === filterType;
        const matchesStatus = filterStatus === 'All Status' || item.status === filterStatus;
        const matchesRisk = filterRisk === 'All Risks' || (item.risk && item.risk === filterRisk);

        return matchesSearch && matchesType && matchesStatus && matchesRisk;
    }).sort((a, b) => extractRequestNumber(b.id) - extractRequestNumber(a.id));

    const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeTab, filterType, filterStatus, filterRisk]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const pageSelectedCount = paginatedData.filter((row) => selectedIds.includes(row.id)).length;

    // Columns Configuration
    const columns = [
        {
            header: <input type="checkbox" checked={pageSelectedCount === paginatedData.length && paginatedData.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />,
            accessor: 'selection',
            className: 'w-10',
            render: (row) => (
                <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(row.id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            )
        },
        {
            header: 'Request ID',
            accessor: 'id',
            className: 'text-blue-600 font-medium',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(row);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none"
                >
                    {row.id}
                </button>
            )
        },
        {
            header: 'User',
            accessor: 'requester',
            render: (row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-700 font-bold text-xs">
                        {row.requester.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-900">{row.requester}</span>
                </div>
            )
        },
        { header: 'Tool', accessor: 'tool', className: 'text-gray-900 font-medium' },
        {
            header: 'Type',
            accessor: 'type',
            render: (row) => (
                <span className={clsx("font-medium", row.type === 'New' ? "text-purple-600" : "text-blue-600")}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                let colorClass = 'text-gray-500';
                if (row.status === 'Pending') colorClass = 'text-amber-600';
                if (row.status === 'Approved') colorClass = 'text-green-600';
                if (row.status === 'In Analysis') colorClass = 'text-blue-600';
                if (row.status === 'Risk') colorClass = 'text-red-600';
                return <span className={clsx("font-medium", colorClass)}>{row.status}</span>;
            }
        },
        { header: 'Department', accessor: 'department', className: 'text-gray-500' },
        { header: 'Date', accessor: 'date', className: 'text-gray-500' },
        {
            header: 'Action',
            accessor: 'action',
            render: (row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRequestClick(row);
                    }}
                    className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    Review
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
                    <p className="text-gray-500 mt-1">Manage and track all software acquisition and reuse requests</p>
                </div>
                <div className="flex space-x-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-bold text-gray-900">Approval Velocity</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+12% vs last week</span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">1.8 Days</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">avg. turnaround</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-bold text-gray-900">Pending Value</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Pipeline</span>
                    </div>
                    <div className="flex items-baseline space-x-2 relative z-10">
                        <span className="text-3xl font-bold text-gray-900">$142,500</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">est. annual spend</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-sm font-bold text-gray-900">Policy Compliance</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Auto-Vetted</span>
                    </div>
                    <div className="flex items-baseline space-x-2 relative z-10">
                        <span className="text-3xl font-bold text-gray-900">94%</span>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">pre-screened requests</span>
                    </div>
                </div>
            </div>

            {/* Tabs & Sort */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-transparent pb-0">
                <div className="flex space-x-8">
                    {['All Requests', 'All Pending (42)', 'Approved Requests', 'Reuse Requests'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "pb-4 text-sm font-medium transition-colors relative",
                                activeTab === tab
                                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48">
                            <option>Date (Newest First)</option>
                            <option>Risk (High to Low)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6 flex-1">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID, User, Tool..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500/20 text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200" />

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option>All Types</option>
                                <option>New</option>
                                <option>Reuse</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Risk</option>
                                <option>In Analysis</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Risk:</span>
                            <select
                                className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                            >
                                <option>All Risks</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilterType('All Types');
                        setFilterStatus('All Status');
                        setFilterRisk('All Risks');
                    }}
                    className="text-blue-600 text-xs font-bold hover:text-blue-800 tracking-wider uppercase whitespace-nowrap"
                >
                    Clear Filters
                </button>
            </div>

            {/* Selection Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                    {selectedIds.length} items selected
                </span>
                <div className="flex space-x-3">
                    <button
                        onClick={handleBulkApprove}
                        disabled={selectedIds.length === 0}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                            selectedIds.length === 0
                                ? "bg-blue-100 text-white cursor-not-allowed opacity-80"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Selected
                    </button>
                    <button
                        onClick={handleBulkReject}
                        disabled={selectedIds.length === 0}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                            selectedIds.length === 0
                                ? "bg-red-100 text-white cursor-not-allowed opacity-80"
                                : "bg-red-600 text-white hover:bg-red-700"
                        )}
                    >
                        <XSquare className="w-4 h-4 mr-2" />
                        Reject Selected
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedIds.length === 0}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm",
                            selectedIds.length === 0
                                ? "bg-gray-200 text-white cursor-not-allowed opacity-80"
                                : "bg-gray-700 text-white hover:bg-gray-800"
                        )}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table columns={columns} data={paginatedData} />

                {/* Pagination */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-50">
                    <span className="text-sm font-medium text-gray-400">
                        Showing {filteredData.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} total requests
                    </span>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={clsx(
                                "px-3 py-1 border rounded transition-colors",
                                currentPage === 1
                                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                                    : "border-gray-100 text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                if (totalPages <= 7) return true;
                                if (page === 1 || page === totalPages) return true;
                                return Math.abs(page - currentPage) <= 1;
                            })
                            .map((page, index, arr) => (
                                <React.Fragment key={page}>
                                    {index > 0 && page - arr[index - 1] > 1 && (
                                        <span className="px-2 text-gray-300">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={clsx(
                                            "px-3 py-1 rounded shadow-sm font-bold",
                                            currentPage === page
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-100 text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={clsx(
                                "px-3 py-1 border rounded transition-colors",
                                currentPage === totalPages
                                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                                    : "border-gray-100 text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
            {/* Request Details Sidebar for Reuse/Expansion */}
            <RequestDetailsSidebar
                isOpen={!!selectedRequest && isSidebarReviewType(selectedRequest)}
                onClose={closeSidebar}
                request={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
            />

            {/* New Request Popup */}
            {selectedRequest && !isSidebarReviewType(selectedRequest) && (
                <div className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4" onClick={closeSidebar}>
                    <div
                        className="w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Request Details</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedRequest.id} • {selectedRequest.date}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeSidebar}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                                aria-label="Close request details"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requester</p>
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-blue-100 overflow-hidden mr-3 flex items-center justify-center text-blue-700 font-bold text-sm">
                                            {String(selectedRequest.requester || '')
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedRequest.userName || selectedRequest.requester}</p>
                                            <p className="text-xs text-gray-500">{selectedRequest.role || 'End User'} • {selectedRequest.department || '-'}</p>
                                            <p className="text-xs text-gray-500">User Name: {selectedRequest.userName || selectedRequest.requester || '-'}</p>
                                            <p className="text-xs text-gray-500">User Email: {selectedRequest.userEmail || selectedRequest.formPayload?.userEmail || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Overview</p>
                                    <p><span className="font-semibold text-gray-800">Type:</span> {selectedRequest.requestOverview?.type || 'New Tool Request'}</p>
                                    <p><span className="font-semibold text-gray-800">Tool:</span> {selectedRequest.requestOverview?.tool || selectedRequest.tool}</p>
                                    <p><span className="font-semibold text-gray-800">Vendor:</span> {selectedRequest.requestOverview?.vendor || 'TBD'}</p>
                                    <p><span className="font-semibold text-gray-800">Department:</span> {selectedRequest.requestOverview?.department || selectedRequest.department}</p>
                                    <p><span className="font-semibold text-gray-800">Licenses:</span> {selectedRequest.requestOverview?.licenses || 'TBD'}</p>
                                    <p><span className="font-semibold text-gray-800">Timeline:</span> {selectedRequest.requestOverview?.timeline || 'TBD'}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">License & Usage Stats</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{modalLicenseStats.loading ? '-' : modalLicenseStats.total}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total</p>
                                    </div>
                                    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{modalLicenseStats.loading ? '-' : modalLicenseStats.used}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Used</p>
                                    </div>
                                    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-700">{modalLicenseStats.loading ? '-' : modalLicenseStats.available}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Available</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Use Case</p>
                                <p className="text-sm text-gray-700">{selectedRequest.useCase || 'No specific use case provided for this tool request.'}</p>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Justification</p>
                                <p className="text-sm text-gray-700">{selectedRequest.justification || 'No business justification provided for this tool request.'}</p>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Equivalent Tools Found</p>
                                <div className="space-y-2">
                                    {(selectedRequest.equivalentTools && selectedRequest.equivalentTools.length > 0) ? (
                                        selectedRequest.equivalentTools.map((tool, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 px-3 py-2">
                                                <span className="text-sm font-semibold text-gray-800">{tool.name}</span>
                                                <span className="text-[10px] px-2 py-1 bg-gray-50 text-gray-500 font-bold rounded uppercase tracking-wider border border-gray-100">
                                                    {tool.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-400 italic">No equivalent tools found in catalog.</div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stakeholders</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Business Domain Owner</label>
                                        <select
                                            value={selectedRequestStakeholders?.businessDomainOwner || ''}
                                            onChange={(e) => handleStakeholderChange('businessDomainOwner', e.target.value)}
                                            disabled={selectedRequestStakeholders?.businessDomainOwnerLocked}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="" disabled>Select</option>
                                            {BUSINESS_DOMAIN_OWNERS.map((owner) => (
                                                <option key={owner} value={owner}>{owner}</option>
                                            ))}
                                        </select>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('businessDomainOwner', 'Assign')}
                                                disabled={!selectedRequestStakeholders?.businessDomainOwner || selectedRequestStakeholders?.businessDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 text-xs font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Assign
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('businessDomainOwner', 'Approved')}
                                                disabled={selectedRequestStakeholders?.businessDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('businessDomainOwner', 'Rejected')}
                                                disabled={selectedRequestStakeholders?.businessDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100"
                                            >
                                                Reject
                                            </button>
                                            <span className={`ml-auto text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${getStakeholderStatusClasses(selectedRequestStakeholders?.businessDomainOwnerStatus)}`}>
                                                {selectedRequestStakeholders?.businessDomainOwnerStatus || 'Not Assigned'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">IT Domain Owner</label>
                                        <select
                                            value={selectedRequestStakeholders?.itDomainOwner || ''}
                                            onChange={(e) => handleStakeholderChange('itDomainOwner', e.target.value)}
                                            disabled={selectedRequestStakeholders?.itDomainOwnerLocked}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="" disabled>Select</option>
                                            {IT_DOMAIN_OWNERS.map((owner) => (
                                                <option key={owner} value={owner}>{owner}</option>
                                            ))}
                                        </select>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('itDomainOwner', 'Assign')}
                                                disabled={!selectedRequestStakeholders?.itDomainOwner || selectedRequestStakeholders?.itDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 text-xs font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Assign
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('itDomainOwner', 'Approved')}
                                                disabled={selectedRequestStakeholders?.itDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-emerald-200 text-emerald-700 bg-emerald-50 text-xs font-semibold hover:bg-emerald-100"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleStakeholderAction('itDomainOwner', 'Rejected')}
                                                disabled={selectedRequestStakeholders?.itDomainOwnerLocked}
                                                className="px-2.5 py-1 rounded-md border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100"
                                            >
                                                Reject
                                            </button>
                                            <span className={`ml-auto text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${getStakeholderStatusClasses(selectedRequestStakeholders?.itDomainOwnerStatus)}`}>
                                                {selectedRequestStakeholders?.itDomainOwnerStatus || 'Not Assigned'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Validation</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">ROI Justification</label>
                                        <textarea
                                            rows={2}
                                            value={selectedRequestBusinessValidation?.roiJustification || ''}
                                            onChange={(e) => handleBusinessValidationChange('roiJustification', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget Details</label>
                                        <input
                                            type="text"
                                            value={selectedRequestBusinessValidation?.budgetDetails || ''}
                                            onChange={(e) => handleBusinessValidationChange('budgetDetails', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sponsor Information</label>
                                        <input
                                            type="text"
                                            value={selectedRequestBusinessValidation?.sponsorInformation || ''}
                                            onChange={(e) => handleBusinessValidationChange('sponsorInformation', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Finance Approval</label>
                                        <input
                                            type="text"
                                            value={selectedRequestBusinessValidation?.financeApproval || ''}
                                            onChange={(e) => handleBusinessValidationChange('financeApproval', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">TPRM Evaluation (Vendor Risk Assessment)</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vendor Name</label>
                                        <input
                                            type="text"
                                            value={selectedRequestTprmEvaluation?.vendorName || ''}
                                            onChange={(e) => handleTprmEvaluationChange('vendorName', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Risk Level</label>
                                        <select
                                            value={selectedRequestTprmEvaluation?.riskLevel || ''}
                                            onChange={(e) => handleTprmEvaluationChange('riskLevel', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="" disabled>Select</option>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compliance Status</label>
                                        <input
                                            type="text"
                                            value={selectedRequestTprmEvaluation?.complianceStatus || ''}
                                            onChange={(e) => handleTprmEvaluationChange('complianceStatus', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Security Approval</label>
                                        <input
                                            type="text"
                                            value={selectedRequestTprmEvaluation?.securityApproval || ''}
                                            onChange={(e) => handleTprmEvaluationChange('securityApproval', e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-slate-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Procurement & Onboarding</p>
                                <p className="text-xs font-semibold text-gray-500 mb-3">Tracking</p>
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedRequestProcurementTracking?.msa}
                                            onChange={(e) => handleProcurementTrackingChange('msa', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        MSA (Master Service Agreement)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedRequestProcurementTracking?.dpa}
                                            onChange={(e) => handleProcurementTrackingChange('dpa', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        DPA (Data Processing Agreement)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedRequestProcurementTracking?.po}
                                            onChange={(e) => handleProcurementTrackingChange('po', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        PO (Purchase Order)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeSidebar}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleApprove(selectedRequest.id);
                                    closeSidebar();
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={clsx(
                    "fixed bottom-6 right-6 text-white px-6 py-3 rounded-lg shadow-xl flex items-center z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300",
                    toast.type === 'success' ? "bg-gray-900" : "bg-red-600"
                )}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    ) : (
                        <XSquare className="w-5 h-5 text-white mr-3" />
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}
        </div>
    );
}
