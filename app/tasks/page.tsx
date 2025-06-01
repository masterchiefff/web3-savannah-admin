'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
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
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Task {
  _id?: string;
  id?: number;
  title: string;
  project: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  dueDate: string;
  description?: string;
}

interface StatusBadgeProps {
  status: 'todo' | 'in-progress' | 'review' | 'completed';
}

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string | number) => void;
}

interface TaskFormModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  isEditing: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/tasks';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getTasks: async (): Promise<{ tasks: Task[] }> => {
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
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  addTask: async (taskData: Partial<Task>): Promise<{ task: Task }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<{ task: Task }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (id: string): Promise<void> => {
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
      console.error('Error deleting task:', error);
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
      case 'review':
        return {
          color: 'bg-yellow-500',
          icon: AlertCircle,
          text: 'Review',
        };
      case 'todo':
        return {
          color: 'bg-gray-500',
          icon: ListTodo,
          text: 'To Do',
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

// PriorityBadge Component
const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return {
          color: 'bg-red-500',
          text: 'High',
        };
      case 'medium':
        return {
          color: 'bg-yellow-500',
          text: 'Medium',
        };
      case 'low':
        return {
          color: 'bg-blue-500',
          text: 'Low',
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      {config.text}
    </div>
  );
};

// TaskFormModal Component
const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    project: '',
    assignee: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        title: task.title || '',
        project: task.project || '',
        assignee: task.assignee || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        dueDate: task.dueDate || '',
        description: task.description || '',
      });
    } else {
      setFormData({
        title: '',
        project: '',
        assignee: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        description: '',
      });
    }
  }, [task, isEditing, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title?.trim() || !formData.project?.trim() || !formData.assignee?.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
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
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Task Title *</label>
                <Input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project *</label>
                <Input
                  type="text"
                  value={formData.project || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assignee *</label>
                <Input
                  type="text"
                  value={formData.assignee || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignee: e.target.value }))}
                  className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Assignee name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value as Task['priority'] }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status || 'todo'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as Task['status'] }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
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
                placeholder="Task description..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title?.trim() || !formData.project?.trim() || !formData.assignee?.trim()}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Task' : 'Add Task'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// TaskModal Component
const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (task && window.confirm(`Are you sure you want to delete ${task.title}?`)) {
      onDelete(task._id || task.id || '');
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Task Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">{task.title}</h4>
              <p className="text-gray-400">{task.project}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Assignee</label>
                <p className="text-white">{task.assignee}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Status</label>
                <div className="mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Priority</label>
                <div className="mt-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Due Date</label>
                <p className="text-white">{task.dueDate}</p>
              </div>
            </div>

            {task.description && (
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <div className="bg-gray-700 p-3 rounded-lg mt-1">
                  <p className="text-white whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(task)}
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

// Main TasksPage Component
export default function TasksPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);

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
          loadTasks();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadTasks();
    }
  }, [router, user, login]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      // Filter out invalid task objects
      const validTasks = data.tasks.filter(
        (task: Task) =>
          task.title &&
          typeof task.title === 'string' &&
          task.project &&
          typeof task.project === 'string' &&
          task.assignee &&
          typeof task.assignee === 'string' &&
          task.status &&
          typeof task.status === 'string'
      );
      setTasks(validTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (isEditing && selectedTask) {
        const updatedTask = await api.updateTask(
          selectedTask._id || selectedTask.id!.toString(),
          taskData
        );
        setTasks(
          tasks.map((t) =>
            (t._id || t.id) === (selectedTask._id || selectedTask.id)
              ? { ...t, ...updatedTask.task }
              : t
          )
        );
      } else {
        const newTask = await api.addTask(taskData);
        setTasks([...tasks, newTask.task]);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    try {
      await api.deleteTask(taskId.toString());
      setTasks(tasks.filter((t) => (t._id || t.id) !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const statusOrder = ['todo', 'in-progress', 'review', 'completed'];
    const newStatus = statusOrder[parseInt(destination.droppableId)] as Task['status'];

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(source.index, 1);
    movedTask.status = newStatus;
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks);

    try {
      await api.updateTask(movedTask._id || movedTask.id!.toString(), {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      loadTasks(); // Revert on error
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignee || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusColumns = ['todo', 'in-progress', 'review', 'completed'];

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
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <p className="text-gray-400">Manage and assign development tasks</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tasks..."
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
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>

            <Button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map((status, index) => (
              <Droppable droppableId={index.toString()} key={status}>
                {(provided: { droppableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; innerRef: React.Ref<HTMLDivElement> | undefined; placeholder: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                  <div
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <h3 className="text-lg font-semibold text-white mb-4 capitalize">{status.replace('-', ' ')}</h3>
                    <div className="space-y-2 min-h-[100px]">
                      {filteredTasks
                        .filter((task) => task.status === status)
                        .map((task, taskIndex) => (
                          <Draggable
                            key={task._id || task.id}
                            draggableId={(task._id || task.id)!.toString()}
                            index={taskIndex}
                          >
                            {(provided: { innerRef: React.Ref<HTMLDivElement> | undefined; draggableProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; dragHandleProps: React.JSX.IntrinsicAttributes & React.ClassAttributes<HTMLDivElement> & React.HTMLAttributes<HTMLDivElement>; }) => (
                              <div
                                className="bg-gray-700 p-3 rounded-lg shadow-sm"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-white font-medium">{task.title}</h4>
                                    <PriorityBadge priority={task.priority} />
                                  </div>
                                  <p className="text-gray-400 text-sm">{task.project}</p>
                                  <p className="text-gray-400 text-sm">Assignee: {task.assignee}</p>
                                  <p className="text-gray-400 text-sm">Due: {task.dueDate}</p>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleViewTask(task)}
                                      className="text-gray-400 hover:text-blue-400"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditTask(task)}
                                      className="text-gray-400 hover:text-green-400"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteTask(task._id || task.id || '')}
                                      className="text-gray-400 hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No tasks found matching your criteria.</p>
          </div>
        )}

        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />

        <TaskFormModal
          task={selectedTask}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveTask}
          isEditing={isEditing}
        />
      </div>
    </AdminDashboard>
  );
}