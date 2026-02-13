"use client";

import React, { useState } from 'react';
import PageHeader from './PageHeader';
import SearchFilterBar from './SearchFilterBar';
import RequestsTable from './RequestsTable';
import Pagination from './Pagination';
import { requestsData } from '@/data/requestsData';

export default function MyRequests() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

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
            options: ['Web Mail', 'File Sharing', 'Collaboration'],
            value: categoryFilter,
            onChange: setCategoryFilter
        }
    ];

    const filteredRequests = requestsData.filter(req => {
        const matchesSearch = req.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || req.status === statusFilter;
        const matchesType = !typeFilter || req.type === typeFilter;
        const matchesCategory = !categoryFilter || req.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });

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

            <RequestsTable requests={filteredRequests} />

            <Pagination
                totalItems={24}
                itemsPerPage={4}
                currentPage={1}
                onPageChange={() => { }}
            />
        </div>
    );
}
