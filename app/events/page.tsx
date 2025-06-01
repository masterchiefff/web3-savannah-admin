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
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Event {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: string;
  createdAt: string;
}

interface EventTypeBadgeProps {
  type: string;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

interface EventFormModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: FormData) => Promise<void>;
  isEditing: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/events';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

// API functions
const api = {
  getEvents: async (): Promise<{ events: Event[] }> => {
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
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEvent: async (id: string): Promise<{ event: Event }> => {
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
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  addEvent: async (eventData: FormData): Promise<{ event: Event }> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: eventData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  updateEvent: async (id: string, eventData: FormData): Promise<{ event: Event }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: eventData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
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
      console.error('Error deleting event:', error);
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

// EventTypeBadge Component
const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ type }) => {
  const config = {
    workshop: { color: 'bg-blue-500', text: 'Workshop' },
    webinar: { color: 'bg-purple-500', text: 'Webinar' },
    meeting: { color: 'bg-yellow-500', text: 'Meeting' },
    presentation: { color: 'bg-green-500', text: 'Presentation' },
  }[type] || { color: 'bg-gray-500', text: type };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
      {config.text}
    </div>
  );
};

// EventFormModal Component
const EventFormModal: React.FC<EventFormModalProps> = ({ event, isOpen, onClose, onSave, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    attendees: 0,
    type: 'workshop',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isEditing && event) {
      setFormData({
        title: event.title || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        attendees: event.attendees || 0,
        type: event.type || 'workshop',
      });
    } else {
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        attendees: 0,
        type: 'workshop',
      });
    }
  }, [event, isEditing, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'attendees' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.date || !formData.time || !formData.location) {
      setError('Title, date, time, and location are required');
      return;
    }

    setIsLoading(true);
    setError('');
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('date', formData.date);
    formDataToSend.append('time', formData.time);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('attendees', formData.attendees.toString());
    formDataToSend.append('type', formData.type);

    try {
      await onSave(formDataToSend);
      onClose();
    } catch (error) {
      setError('Failed to save event');
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
            <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
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
                placeholder="Event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
              <Input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                placeholder="Event location"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Attendees</label>
              <Input
                type="number"
                name="attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                className="w-full bg-gray-700 border-gray-600 text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="meeting">Meeting</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title.trim() || !formData.date || !formData.time || !formData.location}
              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Event' : 'Add Event'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// EventModal Component
const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onEdit, onDelete }) => {
  const handleDelete = () => {
    if (event && window.confirm(`Are you sure you want to delete ${event.title}?`)) {
      onDelete(event._id);
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Event Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">{event.title}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Type</label>
                <div className="mt-1">
                  <EventTypeBadge type={event.type} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Date</label>
                <p className="text-white">{event.date}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Time</label>
                <p className="text-white">{event.time}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Location</label>
                <p className="text-white">{event.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Attendees</label>
                <p className="text-white">{event.attendees}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Created At</label>
                <p className="text-white">{new Date(event.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => onEdit(event)}
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

// Main EventsPage Component
export default function EventsPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>([]);

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
          loadEvents();
        }
      });
    } else {
      localStorage.setItem('lastPath', window.location.pathname);
      loadEvents();
    }
  }, [router, user, login]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      // Filter out invalid event objects
      const validEvents = data.events.filter(
        (event: Event) =>
          event.title &&
          typeof event.title === 'string' &&
          event.date &&
          typeof event.date === 'string' &&
          event.time &&
          typeof event.time === 'string' &&
          event.location &&
          typeof event.location === 'string'
      );
      setEvents(validEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditEvent = async (event: Event) => {
    try {
      const data = await api.getEvent(event._id);
      setSelectedEvent(data.event);
      setIsEditing(true);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error loading event data:', error);
    }
  };

  const handleSaveEvent = async (eventData: FormData) => {
    try {
      if (isEditing && selectedEvent) {
        const updatedEvent = await api.updateEvent(selectedEvent._id, eventData);
        setEvents(
          events.map((event) =>
            event._id === selectedEvent._id ? { ...event, ...updatedEvent.event } : event
          )
        );
      } else {
        const newEvent = await api.addEvent(eventData);
        setEvents([...events, newEvent.event]);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.deleteEvent(eventId);
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(events.map((event) => event.type))).sort();

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesType;
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
            <h2 className="text-2xl font-bold text-white">Events</h2>
            <p className="text-gray-400">Schedule and manage company events</p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase()}
                </option>
              ))}
            </select>

            <Button
              onClick={handleAddEvent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
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

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Time
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Location
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Attendees
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Type
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 sm:uppercase uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{event.date}</td>
                    <td className="px-6 py-4 text-gray-300">{event.time}</td>
                    <td className="px-6 py-4 text-gray-300">{event.location}</td>
                    <td className="px-6 py-4 text-gray-300">{event.attendees}</td>
                    <td className="px-6 py-4">
                      <EventTypeBadge type={event.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewEvent(event)}
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEvent(event)}
                          className="text-gray-400 hover:text-green-400 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event._id)}
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

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No events found matching your criteria.</p>
            </div>
          )}
        </div>

        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />

        <EventFormModal
          event={selectedEvent}
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveEvent}
          isEditing={isEditing}
        />
      </div>
    </AdminDashboard>
  );
}