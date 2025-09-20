'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { Submission } from '@/types';
import { 
  Flame,
  Phone,
  Mail,
  Calendar,
  User,
  FileText
} from 'lucide-react';

export default function HotLeadsPage() {
  const [hotLeads, setHotLeads] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotLeads();
  }, []);

  const loadHotLeads = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getHotLeads();
      setHotLeads(data);
    } catch (error) {
      console.error('Error loading hot leads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="marketer">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center mb-6">
              <Flame className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hot Leads</h1>
                <p className="mt-1 text-gray-600">
                  High-value leads submitted by multiple marketers
                </p>
              </div>
            </div>

            {hotLeads.length === 0 ? (
              <div className="text-center py-12">
                <Flame className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hot leads</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Hot leads appear when the same phone number is submitted by 3 or more marketers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotLeads.map((lead) => (
                  <div key={lead.id} className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Flame className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-sm font-medium text-red-600">Hot Lead</span>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                            <p className="text-xs text-gray-500">Submitted by {lead.user?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-3" />
                          <p className="text-sm text-gray-900">{lead.phone_number}</p>
                        </div>

                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-3" />
                          <p className="text-sm text-gray-900">{lead.project_interest}</p>
                        </div>

                        {lead.notes && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Notes:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {lead.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                          {lead.files && lead.files.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {lead.files.length} file{lead.files.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hot Lead Rules Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Hot Lead Rules</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• A lead becomes &quot;hot&quot; when the same phone number is submitted by 3 or more marketers</li>
                <li>• Hot leads are marked with a 🔥 badge and special status</li>
                <li>• The first marketer to submit a hot lead may receive bonus rewards</li>
                <li>• All marketers can view hot leads for reference and learning</li>
              </ul>
            </div>
          </div>
        </div>
    </ProtectedRoute>
  );
}
