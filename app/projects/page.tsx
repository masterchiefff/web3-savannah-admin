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
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Project {
  _id?: string;
  id?: number;
  name: string;
  client: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  team: number;
  deadline: string;
  description?: string;
}

interface StatusBadgeProps {
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string | number) => void;
}

interface ProjectFormModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void>;
  isEditing: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/projects';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getProjects: async (): Promise<{ projects: Project[] }> => {
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
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  addProject: async (projectData: Partial<Project>): Promise<{ project: Project }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  updateProject: async (id: string, projectData: Partial<Project>): Promise<{ project: Project }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  deleteProject: async (id: string): Promise<void> => {
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
      console.error('Error deleting project:', error);
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
      case 'completed':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          text: 'Completed',
        };
      case 'in-progress':
        return {
          color: 'bg-blue-500',
          icon: Clock,
          text: 'In Progress',
        };
      case 'planning':
        return {
          color: 'bg-yellow-500',
          icon: AlertCircle,
          text: 'Planning',
        };
      case 'on-hold':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          text: 'On Hold',
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

// ProjectFormModal Component
const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ project, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    status: 'planning',
    progress: 0,
    team: 0,
    deadline: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditing && project) {
      setFormData({
        name: project.name || '',
        client: project.client || '',
        status: project.status || 'planning',
        progress: project.progress || 0,
        team: project.team || 0,
        deadline: project.deadline || '',
        description: project.description || '',
      });
    } else {
      setFormData({
        name: '',
        client: '',
        status: 'planning',
        progress: 0,
        team: 0,
        deadline: '',
        description: '',
      });
    }
  }, [project, isEditing, isOpen]);

  const handleSubmit = async () => {
    if (!formData.name?.trim() || !formData.client?.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
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
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Project' : 'Add New Project'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Client *</label>
                <Input
                  type="text"
                  value={formData.client || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Client name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status || 'planning'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as Project['status'] }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Progress (%)</label>
                <Input
                  type="number"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData((prev) => ({ ...prev, progress: Number(e.target.value) }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="0-100"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Size</label>
                <Input
                  type="number"
                  value={formData.team || 0}
                  onChange={(e) => setFormData((prev) => ({ ...prev, team: Number(e.target.value) }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Number of team members"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                <Input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Project description..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.name?.trim() || !formData.client?.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Project' : 'Add Project'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProjectModal Component
const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (project && window.confirm(`Are you sure you want to delete ${project.name}?`)) {
      onDelete(project._id || project.id || '');
      onClose();
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Project Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">{project.name}</h4>
              <p className="text-gray-400">{project.client}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Status</label>
                <div className="mt-1">
                  <StatusBadge status={project.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Progress</label>
                <p className="text-white">{project.progress}%</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Team Size</label>
                <p className="text-white">{project.team} members</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Deadline</label>
                <p className="text-white">{project.deadline}</p>
              </div>
            </div>

            {project.description && (
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <div className="bg-gray-700 p-3 rounded-lg mt-1">
                  <p className="text-white whitespace-pre-wrap">{project.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(project)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
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

// Main ProjectsPage Component
export default function ProjectsPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);

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
          loadProjects();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadProjects();
    }
  }, [router, user, login]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      // Filter out invalid project objects
      const validProjects = data.projects.filter(
        (proj: Project) =>
          proj.name &&
          typeof proj.name === 'string' &&
          proj.client &&
          typeof proj.client === 'string' &&
          proj.status &&
          typeof proj.status === 'string'
      );
      setProjects(validProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (isEditing && selectedProject) {
        const updatedProject = await api.updateProject(
          selectedProject._id || selectedProject.id!.toString(),
          projectData
        );
        setProjects(
          projects.map((proj) =>
            (proj._id || proj.id) === (selectedProject._id || selectedProject.id)
              ? { ...proj, ...updatedProject.project }
              : proj
          )
        );
      } else {
        const newProject = await api.addProject(projectData);
        setProjects([...projects, newProject.project]);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string | number) => {
    try {
      await api.deleteProject(projectId.toString());
      setProjects(projects.filter((proj) => (proj._id || proj.id) !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

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
            <h2 className="text-2xl font-bold text-white">Projects</h2>
            <p className="text-gray-400">Manage and track project progress</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>

            <Button
              onClick={handleAddProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProjects.map((project) => (
                  <tr key={project._id || project.id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{project.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{project.client}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-white">{project.progress}%</td>
                    <td className="px-6 py-4 text-gray-300">{project.team} members</td>
                    <td className="px-6 py-4 text-gray-300">{project.deadline}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProject(project)}
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProject(project)}
                          className="text-gray-400 hover:text-green-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProject(project._id || project.id || '')}
                          className="text-gray-400 hover:text-red-400 transition-colors"
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No projects found matching your criteria.</p>
            </div>
          )}
        </div>

        <ProjectModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />

        <ProjectFormModal
          project={selectedProject}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveProject}
          isEditing={isEditing}
        />
      </div>
    </AdminDashboard>
  );
}