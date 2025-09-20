'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Upload, X, FileText } from 'lucide-react';
import { ProjectInterest } from '@/types';

export default function SubmitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    project_interest: '',
    notes: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    if (!formData.name || !formData.phone_number || !formData.project_interest) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create submission
      const submission = await apiClient.createSubmission(formData);
      
      if (!submission || !submission.id) {
        throw new Error('Invalid response from server');
      }
      
      // File upload disabled temporarily to prevent stack depth errors
      // TODO: Implement file upload API endpoint
      if (files.length > 0) {
        console.warn('File upload not implemented yet, skipping files');
      }

      toast.success('Data submitted successfully!');
      
      // Reset form
        setFormData({
          name: '',
          phone_number: '',
          project_interest: '',
          notes: '',
        });
      setFiles([]);
      
      // Navigate after a short delay to prevent race conditions
      setTimeout(() => {
        router.push('/submissions');
      }, 100);
      
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="marketer">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">Submit Data</h1>
            <p className="mt-2 text-gray-600">Submit new lead data with supporting files</p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 text-black placeholder-gray-600 bg-white"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    id="phone_number"
                    required
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 text-black placeholder-gray-600 bg-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="project_interest" className="block text-sm font-medium text-gray-700">
                  Project Interest *
                </label>
                <select
                  name="project_interest"
                  id="project_interest"
                  required
                  value={formData.project_interest}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 text-black bg-white"
                >
                  <option value="" className="text-gray-600">Select project interest</option>
                  <option value="Sedah Green Residence" className="text-black">Sedah Green Residence</option>
                  <option value="Narraya Green Residence" className="text-black">Narraya Green Residence</option>
                  <option value="Grand Sezha" className="text-black">Grand Sezha</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-2 border-gray-400 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 text-black placeholder-gray-600 bg-white"
                  placeholder="Additional notes about this lead..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supporting Files (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-500 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB each (max 5 files)</p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
    </ProtectedRoute>
  );
}
