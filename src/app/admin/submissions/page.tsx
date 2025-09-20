'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Submission, User, FilterOptions } from '@/types';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [marketers, setMarketers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    status: undefined,
    marketer_id: undefined,
    date_from: undefined,
    date_to: undefined,
    search: undefined
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, marketersData] = await Promise.all([
        apiClient.getAllSubmissions(filters),
        apiClient.getMarketers()
      ]);
      setSubmissions(submissionsData);
      setMarketers(marketersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
  };

  const applyFilters = () => {
    loadData();
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      marketer_id: undefined,
      date_from: undefined,
      date_to: undefined,
      search: undefined
    });
  };

  // Function to filter out duplicate entries and show only one per group
  const getUniqueSubmissions = (submissions: Submission[]) => {
    const uniqueMap = new Map<string, Submission>();
    
    submissions.forEach(submission => {
      // Create unique key based on phone number and project interest
      const uniqueKey = `${submission.phone_number}-${submission.project_interest}`;
      
      const existing = uniqueMap.get(uniqueKey);
      
      // Priority: 1. 'own' status, 2. lowest tier number (original), 3. earliest created
      if (!existing || 
          (submission.status === 'own' && existing.status !== 'own') ||
          (submission.status !== 'own' && existing.status !== 'own' && 
           (submission.duplicate_tier || 999) < (existing.duplicate_tier || 999)) ||
          (submission.status === existing.status && 
           (submission.duplicate_tier || 999) === (existing.duplicate_tier || 999) &&
           submission.created_at < existing.created_at)) {
        uniqueMap.set(uniqueKey, submission);
      }
    });
    
    return Array.from(uniqueMap.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'own':
      case 'owned':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'duplicate':
        return <XCircle className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'hot_lead':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'own':
      case 'owned':
        return 'bg-green-100 text-green-800';
      case 'duplicate':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'hot_lead':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAdminDuplicateTier = (submission: Submission) => {
    if (submission.status !== 'duplicate' && submission.status !== 'owned' && submission.status !== 'own') {
      return null;
    }

    // If it's a duplicate or owned submission, show simplified tier information
    if (submission.duplicate_chain && submission.duplicate_chain.length > 1) {
      // Find original owner (tier 1)
      const originalOwner = submission.duplicate_chain.find(dup => dup.tier === 1);
      const totalSubmissions = submission.duplicate_chain.length;
      
      return (
        <div className="mt-2 ml-4 text-sm text-gray-600">
          <div className="bg-gray-50 p-2 rounded border-l-4 border-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-1 rounded">
                DUPLICATE GROUP
              </span>
              <span className="text-gray-700">
                Original: {originalOwner?.user_name} ({originalOwner?.user_email})
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                Total: {totalSubmissions} submissions
              </span>
            </div>
          </div>
        </div>
      );
    }

    // If it's owned but no chain (single submission), show as owner
    if (submission.status === 'owned' || submission.status === 'own') {
      return (
        <div className="mt-2 ml-4 text-sm text-gray-600">
          <div className="bg-green-50 p-2 rounded border-l-4 border-green-400">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">
                ORIGINAL
              </span>
              <span className="text-gray-700">{submission.user?.name} ({submission.user?.email})</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Submissions</h1>
          <p className="mt-2 text-gray-600">Manage and review all data submissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketer</label>
                <select
                  value={filters.marketer_id}
                  onChange={(e) => handleFilterChange('marketer_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Marketers</option>
                  {marketers.map((marketer) => (
                    <option key={marketer.id} value={marketer.id}>
                      {marketer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={applyFilters}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Submissions ({submissions.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marketer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getUniqueSubmissions(submissions).map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                        <div className="text-sm text-gray-500">{submission.phone_number}</div>
                        <div className="text-sm text-gray-500">{submission.project_interest || 'Unknown Project'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.user?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status}</span>
                            {submission.duplicate_tier && submission.duplicate_tier > 1 && (
                              <span className="ml-1 text-xs">(Tier {submission.duplicate_tier})</span>
                            )}
                          </span>
                          {submission.duplicate_tier === 1 && submission.status === 'owned' && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                              ORIGINAL OWNER
                            </span>
                          )}
                        </div>
                        {renderAdminDuplicateTier(submission)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}





