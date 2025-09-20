'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminMarketersPage() {
  const { user, handleTokenExpired } = useAuth();
  const [marketers, setMarketers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadMarketers();
    }
  }, [user]);

  const loadMarketers = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMarketers();
      setMarketers(data);
    } catch (error) {
      console.error('Error loading marketers:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes('TokenExpiredError')) {
        toast.error('Session expired. Please login again.');
        handleTokenExpired();
        return;
      }
      
      toast.error('Failed to load marketers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarketer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createMarketer(formData);
      toast.success('Marketer created successfully');
      setShowCreateForm(false);
      setFormData({ name: '', email: '', password: '' });
      loadMarketers();
    } catch (error) {
      console.error('Error creating marketer:', error);
      toast.error('Failed to create marketer');
    }
  };

  const handleUpdateMarketer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarketer) return;

    try {
      await apiClient.updateMarketer(editingMarketer.id, formData);
      toast.success('Marketer updated successfully');
      setEditingMarketer(null);
      setFormData({ name: '', email: '', password: '' });
      loadMarketers();
    } catch (error) {
      console.error('Error updating marketer:', error);
      toast.error('Failed to update marketer');
    }
  };

  const handleDeleteMarketer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this marketer?')) return;

    try {
      await apiClient.deleteMarketer(id);
      toast.success('Marketer deleted successfully');
      loadMarketers();
    } catch (error) {
      console.error('Error deleting marketer:', error);
      toast.error('Failed to delete marketer');
    }
  };

  const startEdit = (marketer: User) => {
    setEditingMarketer(marketer);
    setFormData({
      name: marketer.name,
      email: marketer.email,
      password: ''
    });
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Marketer Management</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Marketer
            </button>
          </div>
        </div>

        {/* Marketers List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Marketers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {marketers.map((marketer) => (
                  <tr key={marketer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{marketer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{marketer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(marketer.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startEdit(marketer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMarketer(marketer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingMarketer) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMarketer ? 'Edit Marketer' : 'Create New Marketer'}
                </h3>
                <form onSubmit={editingMarketer ? handleUpdateMarketer : handleCreateMarketer}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required={!editingMarketer}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingMarketer(null);
                        setFormData({ name: '', email: '', password: '' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      {editingMarketer ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

