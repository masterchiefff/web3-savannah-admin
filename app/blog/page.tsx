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
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Blog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFeatured: boolean;
  author: { email: string };
  image?: { data: Buffer; contentType: string };
  createdAt: string;
}

interface FeaturedBadgeProps {
  isFeatured: boolean;
}

interface BlogModalProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: string) => void;
}

interface BlogFormModalProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blogData: FormData) => Promise<void>;
  isEditing: boolean;
}

// Convert buffer to base64 data URL
const getImageSrc = (image?: { data: Buffer; contentType: string }) => {
  if (!image || !image.data) return '';
  const base64 = Buffer.from(image.data).toString('base64');
  return `data:${image.contentType};base64,${base64}`;
};

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/blogs';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getBlogs: async (): Promise<{ blogs: Blog[] }> => {
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
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  getBlog: async (id: string): Promise<{ blog: Blog }> => {
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
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  addBlog: async (blogData: FormData): Promise<{ blog: Blog }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: blogData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding blog:', error);
      throw error;
    }
  },

  updateBlog: async (id: string, blogData: FormData): Promise<{ blog: Blog }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: blogData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  deleteBlog: async (id: string): Promise<void> => {
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
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  toggleFeature: async (id: string, isFeatured: boolean): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/feature`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error toggling feature status:', error);
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

// FeaturedBadge Component
const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({ isFeatured }) => {
  const config = {
    color: isFeatured ? 'bg-green-500' : 'bg-gray-500',
    icon: Star,
    text: isFeatured ? 'Featured' : 'Not Featured',
  };
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </div>
  );
};

// BlogFormModal Component
const BlogFormModal: React.FC<BlogFormModalProps> = ({ blog, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isFeatured: false,
    image: null as File | null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing && blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        tags: blog.tags?.join(', ') || '',
        isFeatured: blog.isFeatured || false,
        image: null,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: '',
        isFeatured: false,
        image: null,
      });
    }
  }, [blog, isEditing, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsLoading(true);
    setError('');
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    formDataToSend.append('tags', JSON.stringify(tagsArray));
    formDataToSend.append('isFeatured', String(formData.isFeatured));
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await onSave(formDataToSend);
      onClose();
    } catch (error) {
      setError('Failed to save blog post');
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
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}</h3>
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
                placeholder="Blog title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Blog content..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
              <Input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="e.g., tech, coding, tutorial"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
              <Input
                type="file"
                onChange={handleFileChange}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-300">Featured</label>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Post' : 'Add Post'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// BlogModal Component
const BlogModal: React.FC<BlogModalProps> = ({ blog, isOpen, onClose, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (blog && window.confirm(`Are you sure you want to delete ${blog.title}?`)) {
      onDelete(blog._id);
      onClose();
    }
  };

  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Blog Post Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">{blog.title}</h4>
              <p className="text-gray-400">{blog.author.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Featured</label>
                <div className="mt-1">
                  <FeaturedBadge isFeatured={blog.isFeatured} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Tags</label>
                <p className="text-white">{blog.tags.join(', ')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Created At</label>
                <p className="text-white">{new Date(blog.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Image</label>
                <div className="mt-1">
                  {blog.image ? (
                    <img
                      src={getImageSrc(blog.image)}
                      alt={blog.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <p className="text-gray-400">No Image</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Content</label>
              <div className="bg-gray-700 p-3 rounded-lg mt-1">
                <p className="text-white whitespace-pre-wrap">{blog.content}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(blog)}
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

// Main BlogPage Component
export default function BlogPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [blogs, setBlogs] = useState<Blog[]>([]);

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
          loadBlogs();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadBlogs();
    }
  }, [router, user, login]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await api.getBlogs();
      // Filter out invalid blog objects
      const validBlogs = data.blogs.filter(
        (blog: Blog) =>
          blog.title &&
          typeof blog.title === 'string' &&
          blog.content &&
          typeof blog.content === 'string' &&
          blog.author &&
          typeof blog.author.email === 'string'
      );
      setBlogs(validBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const handleAddBlog = () => {
    setSelectedBlog(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditBlog = async (blog: Blog) => {
    try {
      const data = await api.getBlog(blog._id);
      setSelectedBlog(data.blog);
      setIsEditing(true);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error loading blog data:', error);
    }
  };

  const handleSaveBlog = async (blogData: FormData) => {
    try {
      if (isEditing && selectedBlog) {
        const updatedBlog = await api.updateBlog(selectedBlog._id, blogData);
        setBlogs(
          blogs.map((blog) =>
            blog._id === selectedBlog._id ? { ...blog, ...updatedBlog.blog } : blog
          )
        );
      } else {
        const newBlog = await api.addBlog(blogData);
        setBlogs([...blogs, newBlog.blog]);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      throw error;
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await api.deleteBlog(blogId);
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleFeatureToggle = async (blogId: string, isFeatured: boolean) => {
    try {
      await api.toggleFeature(blogId, isFeatured);
      setBlogs(
        blogs.map((blog) =>
          blog._id === blogId ? { ...blog, isFeatured: !isFeatured } : blog
        )
      );
    } catch (error) {
      console.error('Error toggling feature status:', error);
    }
  };

  // Get unique tags for filter
  const uniqueTags = Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort();

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = tagFilter === 'all' || blog.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
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
            <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
            <p className="text-gray-400">Manage and track blog content</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <Button
              onClick={handleAddBlog}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Post</span>
            </Button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{blog.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{blog.author.email}</td>
                    <td className="px-6 py-4 text-gray-300">{blog.tags.join(', ')}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <FeaturedBadge isFeatured={blog.isFeatured} />
                    </td>
                    <td className="px-6 py-4">
                      {blog.image ? (
                        <img
                          src={getImageSrc(blog.image)}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBlog(blog)}
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBlog(blog)}
                          className="text-gray-400 hover:text-green-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFeatureToggle(blog._id, blog.isFeatured)}
                          className="text-gray-400 hover:text-yellow-400 transition-colors"
                          title={blog.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No blog posts found matching your criteria.</p>
            </div>
          )}
        </div>

        <BlogModal
          blog={selectedBlog}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditBlog}
          onDelete={handleDeleteBlog}
        />

        <BlogFormModal
          blog={selectedBlog}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveBlog}
          isEditing={isEditing}
        />
      </div>
    </AdminDashboard>
  );
}