'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { Submission, FilterOptions } from '@/types';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Flame,
  Search,
  Filter,
  Eye,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSubmissions(filters);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'own':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'duplicate':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'hot_lead':
        return <Flame className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'own':
      case 'owned':
        return 'Owned';
      case 'duplicate':
        return 'Duplicate';
      case 'expired':
        return 'Expired';
      case 'hot_lead':
        return 'Hot Lead';
      default:
        return status;
    }
  };

  const maskName = (name: string) => {
    if (!name || name.length <= 2) {
      return name;
    }
    
    if (name.length <= 4) {
      // For short names like "Rudi" -> "R**i"
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
    } else {
      // For longer names like "Edi Vianika" -> "Ed*****ka"
      const words = name.split(' ');
      if (words.length > 1) {
        // Multi-word names: mask each word
        return words.map(word => {
          if (word.length <= 2) return word;
          return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
        }).join(' ');
      } else {
        // Single word: show first 2 and last 2 chars
        return name.substring(0, 2) + '*'.repeat(name.length - 4) + name.substring(name.length - 2);
      }
    }
  };

  const renderDuplicateTier = (submission: Submission) => {
    if (submission.status !== 'duplicate' || !submission.duplicate_chain) {
      return null;
    }

    return (
      <div className="mt-2 ml-4 text-sm text-gray-600">
        <div className="space-y-1">
          {submission.duplicate_chain.map((dup, index) => (
            <div key={dup.id} className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                Tier {dup.tier}
              </span>
              <span className="text-gray-600">
                {maskName(dup.user_name)}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                dup.status === 'owned' ? 'bg-green-100 text-green-800' :
                dup.status === 'duplicate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {dup.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'own':
        return 'bg-green-100 text-green-800';
      case 'duplicate':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'hot_lead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFollowUpStatusColor = (status?: string) => {
    switch (status) {
      case 'follow-up':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_response':
        return 'bg-red-100 text-red-800';
      case 'closing':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="marketer">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
              <Link
                href="/submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Submit New Data
              </Link>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, phone, or project..."
                          value={filters.search || ''}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="own">Owned</option>
                        <option value="duplicate">Duplicate</option>
                        <option value="expired">Expired</option>
                        <option value="hot_lead">Hot Lead</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.date_from || ''}
                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.date_to || ''}
                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}

                {Object.keys(filters).some(key => filters[key as keyof FilterOptions]) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white shadow rounded-lg">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {Object.keys(filters).some(key => filters[key as keyof FilterOptions])
                      ? 'Try adjusting your filters.'
                      : 'Get started by submitting your first data entry.'
                    }
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Submit Data
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Follow-up
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {submission.name}
                                </div>
                                {submission.is_hot_lead && (
                                  <div className="flex items-center mt-1">
                                    <Flame className="w-4 h-4 text-red-500 mr-1" />
                                    <span className="text-xs text-red-600 font-medium">Hot Lead</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.phone_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.project_interest}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">{getStatusText(submission.status)}</span>
                                {submission.duplicate_tier && submission.duplicate_tier > 1 && (
                                  <span className="ml-1 text-xs">(Tier {submission.duplicate_tier})</span>
                                )}
                              </span>
                              {renderDuplicateTier(submission)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {submission.follow_up_status ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFollowUpStatusColor(submission.follow_up_status)}`}>
                                {submission.follow_up_status.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">Not set</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                              {new Date(submission.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
    </ProtectedRoute>
  );
}
