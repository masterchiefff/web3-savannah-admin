'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  X,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Newsletter {
  _id: string;
  title: string;
  subscribers: number;
  lastSent: string;
  status: string;
  openRate: string;
  createdAt: string;
}

interface NewsletterStatusBadgeProps {
  status: string;
}

interface NewsletterModalProps {
  newsletter: Newsletter | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (newsletter: Newsletter) => void;
  onDelete: (newsletterId: string) => void;
  onSend: (newsletterId: string) => void;
}

interface NewsletterFormModalProps {
  newsletter: Newsletter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newsletterData: FormData) => Promise<void>;
  isEditing: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/newsletters';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getNewsletters: async (): Promise<{ newsletters: Newsletter[] }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || { newsletters: [] }; // Ensure default empty array
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      throw error;
    }
  },

  getNewsletter: async (id: string): Promise<{ newsletter: Newsletter }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching newsletter:', error);
      throw error;
    }
  },

  addNewsletter: async (newsletterData: FormData): Promise<{ newsletter: Newsletter }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: newsletterData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding newsletter:', error);
      throw error;
    }
  },

  updateNewsletter: async (id: string, newsletterData: FormData): Promise<{ newsletter: Newsletter }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: newsletterData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating newsletter:', error);
      throw error;
    }
  },

  deleteNewsletter: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      throw error;
    }
  },

  sendNewsletter: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  },
};

// Helper function to verify token client-side
async function verifyToken(token: string) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// NewsletterStatusBadge Component
const NewsletterStatusBadge: React.FC<NewsletterStatusBadgeProps> = ({ status }) => {
  const config = {
    sent: { color: 'bg-green-500', text: 'Sent' },
    draft: { color: 'bg-gray-500', text: 'Draft' },
    scheduled: { color: 'bg-blue-500', text: 'Scheduled' },
  }[status] || { color: 'bg-gray-500', text: status };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      {config.text}
    </div>
  );
};

// NewsletterFormModal Component
const NewsletterFormModal: React.FC<NewsletterFormModalProps> = ({ newsletter, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    subscribers: 0,
    lastSent: '',
    status: 'draft',
    openRate: 'N/A',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing && newsletter) {
      setFormData({
        title: newsletter.title || '',
        subscribers: newsletter.subscribers || 0,
        lastSent: newsletter.lastSent || '',
        status: newsletter.status || 'draft',
        openRate: newsletter.openRate || 'N/A',
      });
    } else {
      setFormData({
        title: '',
        subscribers: 0,
        lastSent: '',
        status: 'draft',
        openRate: 'N/A',
      });
    }
  }, [newsletter, isEditing, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'subscribers' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('subscribers', formData.subscribers.toString());
    formDataToSend.append('lastSent', formData.lastSent);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('openRate', formData.openRate);

    try {
      await onSave(formDataToSend);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Newsletter' : 'Add New Newsletter'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="Newsletter title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subscribers</label>
              <Input
                type="number"
                name="subscribers"
                value={formData.subscribers}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Sent</label>
              <Input
                type="date"
                name="lastSent"
                value={formData.lastSent}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Open Rate</label>
              <Input
                type="text"
                name="openRate"
                value={formData.openRate}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="e.g., 24.5% or N/A"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Newsletter' : 'Add Newsletter'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// NewsletterModal Component
const NewsletterModal: React.FC<NewsletterModalProps> = ({ newsletter, isOpen, onClose, onEdit, onDelete, onSend }) => {
  const handleDelete = () => {
    if (newsletter && window.confirm(`Are you sure you want to delete ${newsletter.title}?`)) {
      onDelete(newsletter._id);
      onClose();
    }
  };

  const handleSend = () => {
    if (newsletter && window.confirm(`Are you sure you want to send ${newsletter.title}?`)) {
      onSend(newsletter._id);
      onClose();
    }
  };

  if (!isOpen || !newsletter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Newsletter Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">{newsletter.title}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Status</label>
                <div className="mt-1">
                  <NewsletterStatusBadge status={newsletter.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Subscribers</label>
                <p className="text-white">{newsletter.subscribers}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Last Sent</label>
                <p className="text-white">{newsletter.lastSent || 'N/A'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Open Rate</label>
                <p className="text-white">{newsletter.openRate}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Created At</label>
                <p className="text-white">{new Date(newsletter.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(newsletter)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            <Button
              onClick={handleSend}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
              disabled={newsletter.status === 'sent'}
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main NewslettersPage Component
export default function NewslettersPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [error, setError] = useState<string>('');

  // Authentication check
  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      localStorage.removeItem('lastPath');
      router.push('/login');
      return;
    }

    if (!user) {
      verifyToken(token).then((userData) => {
        if (!userData) {
          localStorage.removeItem('lastPath');
          router.push('/login');
        } else {
          login(token, userData.user);
          localStorage.setItem('lastPath', window.location.pathname);
          loadNewsletters();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadNewsletters();
    }
  }, [router, user, login]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getNewsletters();
      const validNewsletters = (data.newsletters || []).filter(
        (newsletter: Newsletter) =>
          newsletter.title &&
          typeof newsletter.title === 'string' &&
          typeof newsletter.subscribers === 'number' &&
          typeof newsletter.status === 'string'
      );
      setNewsletters(validNewsletters);
    } catch (error: any) {
      setError('Failed to load newsletters');
      console.error('Error loading newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewsletter = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setIsModalOpen(true);
  };

  const handleAddNewsletter = () => {
    setSelectedNewsletter(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditNewsletter = async (newsletter: Newsletter) => {
    try {
      const data = await api.getNewsletter(newsletter._id);
      setSelectedNewsletter(data.newsletter);
      setIsEditing(true);
      setIsFormModalOpen(true);
    } catch (error) {
      setError('Failed to load newsletter data');
      console.error('Error loading newsletter data:', error);
    }
  };

  const handleSaveNewsletter = async (newsletterData: FormData) => {
    try {
      if (isEditing && selectedNewsletter) {
        const updatedNewsletter = await api.updateNewsletter(selectedNewsletter._id, newsletterData);
        setNewsletters(
          newsletters.map((newsletter) =>
            newsletter._id === selectedNewsletter._id ? { ...newsletter, ...updatedNewsletter.newsletter } : newsletter
          )
        );
      } else {
        const newNewsletter = await api.addNewsletter(newsletterData);
        setNewsletters([...newsletters, newNewsletter.newsletter]);
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      throw error;
    }
  };

  const handleDeleteNewsletter = async (newsletterId: string) => {
    try {
      await api.deleteNewsletter(newsletterId);
      setNewsletters(newsletters.filter((newsletter) => newsletter._id !== newsletterId));
    } catch (error) {
      setError('Failed to delete newsletter');
      console.error('Error deleting newsletter:', error);
    }
  };

  const handleSendNewsletter = async (newsletterId: string) => {
    try {
      await api.sendNewsletter(newsletterId);
      setNewsletters(
        newsletters.map((newsletter) =>
          newsletter._id === newsletterId
            ? { ...newsletter, status: 'sent', lastSent: new Date().toISOString().split('T')[0] }
            : newsletter
        )
      );
    } catch (error) {
      setError('Failed to send newsletter');
      console.error('Error sending newsletter:', error);
    }
  };

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(newsletters.map((newsletter) => newsletter.status))).sort();

  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter = statusFilter === '' || newsletter.status === statusFilter;
    return matchesSearch && matchesStatusFilter;
  });

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <AdminDashboard>
      <div className="p-4 lg:p-6 space-y-6 overflow-y-auto h-full bg-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Newsletters</h2>
            <p className="text-gray-400">Create and manage email campaigns</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search newsletters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <Button
              onClick={handleAddNewsletter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Newsletter</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-6 flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Subscribers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Last Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Open Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredNewsletters.map((newsletter) => (
                    <tr key={newsletter._id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{newsletter.title}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{newsletter.subscribers}</td>
                      <td className="px-6 py-4 text-gray-300">{newsletter.lastSent || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <NewsletterStatusBadge status={newsletter.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-300">{newsletter.openRate}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewNewsletter(newsletter)}
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditNewsletter(newsletter)}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSendNewsletter(newsletter._id)}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="Send"
                            disabled={newsletter.status === 'sent'}
                          >
                            <Send className="w-4 h-400 transition-colors" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteNewsletter(newsletter._id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNewsletters.length === 0 && (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No newsletters found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        <NewsletterModal
          newsletter={selectedNewsletter}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditNewsletter}
          onDelete={handleDeleteNewsletter}
          onSend={handleSendNewsletter}
        />

        <NewsletterFormModal
          newsletter={selectedNewsletter}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveNewsletter}
          isEditing={isEditing}
        />
      </div>
    </AdminDashboard>
  );
}