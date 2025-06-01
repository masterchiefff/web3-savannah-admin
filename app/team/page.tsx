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
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Developer {
  _id?: string;
  id?: number;
  name: string;
  email: string;
  role: string;
  rate: string;
  status: 'active' | 'busy' | 'vacation' | 'offline';
  projects: number;
  tasks: number;
  avatar: string;
  phone?: string;
  joinDate?: string;
  skills?: string[];
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StatusBadgeProps {
  status: 'active' | 'busy' | 'vacation' | 'offline';
}

interface DeveloperModalProps {
  developer: Developer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (developer: Developer) => void;
  onDelete: (developerId: string | number) => void;
}

interface DeveloperFormModalProps {
  developer: Developer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (developer: Partial<Developer>) => Promise<void>;
  isEditing: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/team';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getDevelopers: async (): Promise<{ admins: Developer[] }> => {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw error;
    }
  },

  addDeveloper: async (developerData: Partial<Developer>): Promise<{ admin: Developer }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(developerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding developer:', error);
      throw error;
    }
  },

  updateDeveloper: async (id: string, developerData: Partial<Developer>): Promise<{ admin: Developer }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(developerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating developer:', error);
      throw error;
    }
  },

  deleteDeveloper: async (id: string): Promise<void> => {
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
      console.error('Error deleting developer:', error);
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

// StatusBadge Component
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          text: 'Active',
        };
      case 'busy':
        return {
          color: 'bg-yellow-500',
          icon: Clock,
          text: 'Busy',
        };
      case 'vacation':
        return {
          color: 'bg-blue-500',
          icon: Calendar,
          text: 'Vacation',
        };
      case 'offline':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          text: 'Offline',
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: AlertCircle,
          text: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </div>
  );
};

// DeveloperFormModal Component
const DeveloperFormModal: React.FC<DeveloperFormModalProps> = ({ developer, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState<Partial<Developer>>({
    name: '',
    email: '',
    role: 'developer',
    rate: '',
    status: 'active',
    phone: '',
    bio: '',
    skills: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [skillInput, setSkillInput] = useState<string>('');

  useEffect(() => {
    if (isEditing && developer) {
      setFormData({
        name: developer.name || '',
        email: developer.email || '',
        role: developer.role || 'developer',
        rate: developer.rate || '',
        status: developer.status || 'active',
        phone: developer.phone || '',
        bio: developer.bio || '',
        skills: developer.skills || [],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'developer',
        rate: '',
        status: 'active',
        phone: '',
        bio: '',
        skills: [],
      });
    }
  }, [developer, isEditing, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving developer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Developer' : 'Add New Developer'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@company.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={formData.role || 'developer'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rate</label>
                <input
                  type="text"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rate: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="$75/h"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as Developer['status'] }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="vacation">Vacation</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center space-x-1"
                  >
                    <span>{skill}</span>
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-300">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Brief professional bio..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !formData.name?.trim() || !formData.email?.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Developer' : 'Add Developer'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DeveloperModal Component
const DeveloperModal: React.FC<DeveloperModalProps> = ({ developer, isOpen, onClose, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (developer && window.confirm(`Are you sure you want to remove ${developer.name} from the team?`)) {
      onDelete(developer._id || developer.id || '');
      onClose();
    }
  };

  if (!isOpen || !developer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Developer Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">{developer.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xl font-bold text-white">{developer.name}</h4>
                <p className="text-gray-400">{developer.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Rate</label>
                <p className="text-green-400 font-semibold">{developer.rate}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Status</label>
                <div className="mt-1">
                  <StatusBadge status={developer.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Active Projects</label>
                <p className="text-white">{developer.projects}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Pending Tasks</label>
                <p className="text-white">{developer.tasks}</p>
              </div>
            </div>

            {developer.email && (
              <div>
                <label className="text-sm font-medium text-gray-300">Email</label>
                <p className="text-white">{developer.email}</p>
              </div>
            )}

            {developer.phone && (
              <div>
                <label className="text-sm font-medium text-gray-300">Phone</label>
                <p className="text-white">{developer.phone}</p>
              </div>
            )}

            {developer.joinDate && (
              <div>
                <label className="text-sm font-medium text-gray-300">Join Date</label>
                <p className="text-white">{developer.joinDate}</p>
              </div>
            )}

            {developer.skills && developer.skills.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-300">Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {developer.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {developer.bio && (
              <div>
                <label className="text-sm font-medium text-gray-300">Bio</label>
                <div className="bg-gray-700 p-3 rounded-lg mt-1">
                  <p className="text-white whitespace-pre-wrap">{developer.bio}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(developer)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main DevelopersPage Component
export default function DevelopersPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [developers, setDevelopers] = useState<Developer[]>([]);

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
          loadDevelopers();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadDevelopers();
    }
  }, [router, user, login]);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      const data = await api.getDevelopers();
      // Filter out invalid developer objects
      const validDevelopers = data.admins.filter(
        (dev: Developer) =>
          dev.name &&
          typeof dev.name === 'string' &&
          dev.role &&
          typeof dev.role === 'string' &&
          dev.email &&
          typeof dev.email === 'string'
      );
      setDevelopers(validDevelopers);
    } catch (error) {
      console.error('Error loading developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeveloper = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsModalOpen(true);
  };

  const handleAddDeveloper = () => {
    setSelectedDeveloper(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditDeveloper = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSaveDeveloper = async (developerData: Partial<Developer>) => {
    try {
      if (isEditing && selectedDeveloper) {
        const updatedDeveloper = await api.updateDeveloper(
          selectedDeveloper._id || selectedDeveloper.id!.toString(),
          developerData
        );
        setDevelopers(
          developers.map((dev) =>
            (dev._id || dev.id) === (selectedDeveloper._id || selectedDeveloper.id)
              ? { ...dev, ...updatedDeveloper.admin }
              : dev
          )
        );
      } else {
        const newDeveloper = await api.addDeveloper(developerData);
        setDevelopers([...developers, newDeveloper.admin]);
      }
    } catch (error) {
      console.error('Error saving developer:', error);
      throw error;
    }
  };

  const handleDeleteDeveloper = async (developerId: string | number) => {
    try {
      await api.deleteDeveloper(developerId.toString());
      setDevelopers(developers.filter((dev) => (dev._id || dev.id) !== developerId));
    } catch (error) {
      console.error('Error deleting developer:', error);
    }
  };

  const filteredDevelopers = developers.filter((developer) => {
    const matchesSearch =
      (developer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (developer.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (developer.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || developer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!user || loading) {
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
            <h2 className="text-2xl font-bold text-white">Developers</h2>
            <p className="text-gray-400">Manage your development team</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search developers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="busy">Busy</option>
              <option value="vacation">Vacation</option>
              <option value="offline">Offline</option>
            </select>

            <Button
              onClick={handleAddDeveloper}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Developer</span>
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDevelopers.map((developer) => (
                <tr key={developer._id || developer.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{developer.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{developer.name}</div>
                        {developer.email && (
                          <div className="text-gray-400 text-sm">{developer.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{developer.role}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">{developer.rate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={developer.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-300">{developer.projects}</td>
                  <td className="px-6 py-4 text-gray-300">{developer.tasks}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDeveloper(developer)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditDeveloper(developer)}
                        className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDeveloper(developer._id || developer.id || '')}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
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

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No developers found matching your criteria.</p>
          </div>
        )}
      </div>
      </div>
      <DeveloperModal
          developer={selectedDeveloper}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditDeveloper}
          onDelete={handleDeleteDeveloper} />
      <DeveloperFormModal
          developer={selectedDeveloper}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveDeveloper}
          isEditing={isEditing} />
    </AdminDashboard>
    );
}