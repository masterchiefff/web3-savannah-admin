"use client"

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Reply, 
  Archive, 
  Filter, 
  Search, 
  Trash2, 
  Send,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/layouts/AdminDashboardLayout';

// Define interfaces for type safety
interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  responded: boolean;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

interface ContactsResponse {
  contacts: Contact[];
}

interface ContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (contactId: string, response: string) => Promise<void>;
}

interface StatusBadgeProps {
  status: boolean;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/contacts';

// Helper function to get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

// API functions with TypeScript types
const api = {
  getContacts: async (filters: { responded?: boolean } = {}): Promise<ContactsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.responded !== undefined) {
        queryParams.append('responded', filters.responded.toString());
      }
      
      const url = `${API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ContactsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  getContact: async (id: string): Promise<Contact> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Contact = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },
  
  respondToContact: async (id: string, responseText: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
    } catch (error) {
      console.error('Error responding to contact:', error);
      throw error;
    }
  },
  
  deleteContact: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await response.json();
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    if (status) {
      return {
        color: 'bg-green-500',
        icon: CheckCircle,
        text: 'Responded'
      };
    } else {
      return {
        color: 'bg-red-500',
        icon: AlertCircle,
        text: 'New'
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

const ContactModal: React.FC<ContactModalProps> = ({ contact, isOpen, onClose, onRespond }) => {
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setIsLoading(true);
    try {
      if (contact?._id) {
        await onRespond(contact._id, response);
        setResponse('');
        onClose();
      }
    } catch (error) {
      console.error('Error sending response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">Contact Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-300">Name</label>
              <p className="text-white">{contact.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <p className="text-white">{contact.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Date</label>
              <p className="text-white">{new Date(contact.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Status</label>
              <div className="mt-1">
                <StatusBadge status={contact.responded} />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Message</label>
              <div className="bg-gray-700 p-3 rounded-lg mt-1">
                <p className="text-white whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {contact.responded && contact.response && (
              <div>
                <label className="text-sm font-medium text-gray-300">Previous Response</label>
                <div className="bg-blue-900 p-3 rounded-lg mt-1">
                  <p className="text-white whitespace-pre-wrap">{contact.response}</p>
                  <p className="text-xs text-gray-300 mt-2">
                    Sent on {new Date(contact.respondedAt!).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!contact.responded && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Type your response here..."
                />
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
                  disabled={isLoading || !response.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactManagement: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleRespond = async (contactId: string, response: string) => {
    await api.respondToContact(contactId, response);
    setContacts(contacts.map(contact => 
      contact._id === contactId 
        ? { ...contact, responded: true, response, respondedAt: new Date().toISOString() }
        : contact
    ));
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await api.deleteContact(contactId);
      setContacts(contacts.filter(contact => contact._id !== contactId));
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'new' && !contact.responded) ||
                         (statusFilter === 'responded' && contact.responded);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
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
            <h2 className="text-2xl font-bold text-white">Contact Management</h2>
            <p className="text-gray-400">Manage customer inquiries and support requests</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts..."
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
              <option value="new">New</option>
              <option value="responded">Responded</option>
            </select>
            
            <button
              onClick={loadContacts}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Message Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{contact.name}</div>
                        <div className="text-gray-400 text-sm">{contact.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {contact.message.substring(0, 100)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={contact.responded} />
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!contact.responded && (
                          <button
                            onClick={() => handleViewContact(contact)}
                            className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                            title="Respond"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(contact._id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No contacts found matching your criteria.</p>
            </div>
          )}
        </div>

        <ContactModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRespond={handleRespond}
        />
      </div>
    </AdminDashboard>
  );
}

export default ContactManagement;