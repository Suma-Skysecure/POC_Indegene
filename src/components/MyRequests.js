"use client";

import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from './PageHeader';
import SearchFilterBar from './SearchFilterBar';
import RequestsTable from './RequestsTable';
import Pagination from './Pagination';
import { requestsData } from '@/data/requestsData';
import { getCurrentUser, loadRequests } from '@/lib/requestStore';

const formatUserDate = (dateStr) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const mapStoreRequestToMyRequest = (req) => ({
    id: req.id,
    toolName: req.tool,
    toolIcon: req.toolIcon || '',
    type: req.type === 'Reuse' ? 'Reuse' : 'New License',
    category: req.requestOverview?.vendor || req.formPayload?.vendor || req.vendor || 'General',
    dateSubmitted: formatUserDate(req.date),
    status: String(req.status || 'Pending').toUpperCase(),
    assignedLicenses: String(req.formPayload?.requiredLicenses || req.formPayload?.numberOfUsers || '-'),
    requestType: req.formPayload?.requestType || '',
    vendor: req.requestOverview?.vendor || '',
    useCase: req.useCase || '',
    businessJustification: req.justification || '',
    department: req.department || '',
    requiredLicenses: req.formPayload?.requiredLicenses || '',
    timeline: req.formPayload?.timeline || '',
});

const parseDateValue = (value) => {
    const fromNative = new Date(value);
    if (!Number.isNaN(fromNative.getTime())) return fromNative.getTime();
    const match = String(value).match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
    if (!match) return 0;
    const date = new Date(`${match[2]} ${match[1]}, ${match[3]}`);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const normalizeRequestId = (id = '') => {
    const raw = String(id || '').trim();
    if (!raw) return '#REQ-0';
    if (raw.toUpperCase().startsWith('#REQ-')) return raw.toUpperCase();
    const match = raw.match(/(\d+)/);
    return `#REQ-${match ? match[1] : raw.replace(/\D/g, '') || Date.now()}`;
};

const mapLegacyRequestToMyRequest = (req) => ({
    id: normalizeRequestId(req.id),
    toolName: req.toolName || req.tool || 'Unknown Tool',
    toolIcon: req.toolIcon || '',
    type: req.type === 'Reuse' ? 'Reuse' : 'New License',
    category: req.category || req.vendor || 'General',
    dateSubmitted: req.dateSubmitted || formatUserDate(req.date),
    status: String(req.status || 'PENDING').toUpperCase(),
    assignedLicenses: String(req.assignedLicenses || req.requiredLicenses || '-'),
    requestType: req.requestType || '',
    vendor: req.vendor || '',
    useCase: req.useCase || '',
    businessJustification: req.businessJustification || '',
    department: req.department || '',
    requiredLicenses: req.requiredLicenses || '',
    timeline: req.timeline || '',
});

export default function MyRequests() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [allRequests, setAllRequests] = useState(requestsData);

    useEffect(() => {
        const currentUser = getCurrentUser();
        const storeRequests = loadRequests()
            .filter((req) => req.requester === currentUser)
            .map(mapStoreRequestToMyRequest);

        const legacyRequests = requestsData
            .map(mapLegacyRequestToMyRequest)
            .filter((base) => !storeRequests.some((r) => normalizeRequestId(r.id) === normalizeRequestId(base.id)));

        const merged = [...storeRequests, ...legacyRequests].map((item) => ({
            ...item,
            id: normalizeRequestId(item.id),
        }));

        setAllRequests(merged);
    }, []);

    const categoryOptions = useMemo(
        () => Array.from(new Set(allRequests.map((r) => r.category).filter(Boolean))),
        [allRequests]
    );

    const filters = [
        {
            label: 'All Status',
            options: ['APPROVED', 'PENDING', 'IN REVIEW', 'REJECTED'],
            value: statusFilter,
            onChange: setStatusFilter
        },
        {
            label: 'All Types',
            options: ['New License', 'Reuse'],
            value: typeFilter,
            onChange: setTypeFilter
        },
        {
            label: 'All Categories',
            options: categoryOptions,
            value: categoryFilter,
            onChange: setCategoryFilter
        }
    ];

    const filteredRequests = useMemo(() => allRequests.filter(req => {
        const matchesSearch = req.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || req.status === statusFilter;
        const matchesType = !typeFilter || req.type === typeFilter;
        const matchesCategory = !categoryFilter || req.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesType && matchesCategory;
    }), [allRequests, searchTerm, statusFilter, typeFilter, categoryFilter]);

    const sortedRequests = useMemo(() => {
        const copy = [...filteredRequests];
        copy.sort((a, b) => {
            const da = parseDateValue(a.dateSubmitted);
            const db = parseDateValue(b.dateSubmitted);
            if (sortBy === 'oldest') return da - db;
            return db - da;
        });
        return copy;
    }, [filteredRequests, sortBy]);

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <PageHeader
                title="My Requests"
                description="Track and manage your software license applications."
                actionText="New Request"
                actionLink="/user/request-new"
            />

            <SearchFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                sortBy={sortBy}
                onSortChange={setSortBy}
                placeholder="Search requests by tool name, ID, or keyword..."
            />

            <RequestsTable requests={sortedRequests} />

            <Pagination
                totalItems={sortedRequests.length}
                itemsPerPage={4}
                currentPage={1}
                onPageChange={() => { }}
            />
        </div>
    );
}
