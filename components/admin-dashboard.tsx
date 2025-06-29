"use client"

import { useState, useEffect } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  Settings,
  LogOut,
  Users,
  CheckSquare,
  LayoutDashboard,
  FolderOpen,
  FileText,
  Mail,
  MessageSquare,
  Globe,
  Newspaper,
  Menu,
  Edit,
  Trash2,
  Eye,
  Filter,
  Star,
  DollarSign,
  Send,
  Reply,
  Archive,
  Image,
  Save,
  Book as Publish,
  CheckCircle,
} from "lucide-react"
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
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Blog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFeatured: boolean;
  author: { email: string };
  image?: string;
  createdAt: string;
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState("developers")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const sidebarItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", active: currentPage === "dashboard" },
    { id: "developers", icon: Users, label: "Developers", active: currentPage === "developers" },
    { id: "projects", icon: FolderOpen, label: "Projects", active: currentPage === "projects" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", active: currentPage === "tasks" },
    { id: "blog", icon: FileText, label: "Blog Posts", active: currentPage === "blog" },
    { id: "events", icon: Calendar, label: "Events", active: currentPage === "events" },
    { id: "landing", icon: Globe, label: "Landing Page", active: currentPage === "landing" },
    { id: "newsletters", icon: Newspaper, label: "Newsletters", active: currentPage === "newsletters" },
    { id: "contact", icon: MessageSquare, label: "Contact Queries", active: currentPage === "contact" },
  ]

  const accountItems = [
    { id: "settings", icon: Settings, label: "Settings", active: currentPage === "settings" },
    { icon: LogOut, label: "Logout", active: false, onClick: () => logout() },
  ]

  const handleNavigation = (pageId: string) => {
    setCurrentPage(pageId)
    setSidebarOpen(false)
  }

  const getPageTitle = () => {
    const page = sidebarItems.find((item) => item.id === currentPage)
    return page ? page.label.toUpperCase() : "DASHBOARD"
  }

  const SidebarContent = () => (
    <div className="h-full bg-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">DEVPANEL</h1>
      </div>

      {/* Menu */}
      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">Management</p>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
                  item.active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">Account</p>
          <nav className="space-y-1">
            {accountItems.map((item, index) => (
              <button
                key={index}
                onClick={() => item.onClick ? item.onClick() : item.id && handleNavigation(item.id)}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase() || 'AW'}</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">{user?.email || 'Alex Wilson'}</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )

  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "developers":
        return <DevelopersPage />
      case "projects":
        return <ProjectsPage />
      case "tasks":
        return <TasksPage />
      case "blog":
        return <BlogPage />
      case "events":
        return <EventsPage />
      case "landing":
        return <LandingPage />
      case "newsletters":
        return <NewslettersPage />
      case "contact":
        return <ContactPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-gray-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gray-900 px-4 lg:px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <ChevronLeft className="w-5 h-5 text-gray-400 hidden lg:block" />
            <div className="flex items-center text-sm">
              <span className="text-white">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 w-48 lg:w-64"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘F</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">{renderPageContent()}</div>
      </div>
    </div>
  )
}

// Developers Page Component
function DevelopersPage() {
  const [selectedDeveloper, setSelectedDeveloper] = useState(null)

  const developers = [
    {
      id: 1,
      name: "Sarah Mitchell",
      role: "Senior Full-Stack",
      rate: "$85/h",
      status: "active",
      projects: 3,
      tasks: 12,
      avatar: "SM",
    },
    {
      id: 2,
      name: "John Doe",
      role: "Frontend Developer",
      rate: "$70/h",
      status: "active",
      projects: 2,
      tasks: 8,
      avatar: "JD",
    },
    {
      id: 3,
      name: "Emma Wilson",
      role: "Backend Developer",
      rate: "$80/h",
      status: "busy",
      projects: 4,
      tasks: 15,
      avatar: "EW",
    },
    {
      id: 4,
      name: "Mike Johnson",
      role: "DevOps Engineer",
      rate: "$90/h",
      status: "active",
      projects: 1,
      tasks: 5,
      avatar: "MJ",
    },
    {
      id: 5,
      name: "Lisa Chen",
      role: "UI/UX Designer",
      rate: "$75/h",
      status: "vacation",
      projects: 2,
      tasks: 6,
      avatar: "LC",
    },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Developers</h2>
          <p className="text-gray-400">Manage your development team</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Developer
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Developer</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Rate</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Projects</TableHead>
                <TableHead className="text-gray-300">Tasks</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developers.map((dev) => (
                <TableRow key={dev.id} className="border-gray-700">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{dev.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium">{dev.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{dev.role}</TableCell>
                  <TableCell className="text-green-400">{dev.rate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        dev.status === "active" ? "default" : dev.status === "busy" ? "destructive" : "secondary"
                      }
                    >
                      {dev.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{dev.projects}</TableCell>
                  <TableCell className="text-gray-300">{dev.tasks}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Projects Page Component
function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: "E-commerce Platform",
      client: "TechCorp",
      status: "in-progress",
      progress: 75,
      team: 4,
      deadline: "2024-05-15",
    },
    {
      id: 2,
      name: "Mobile Banking App",
      client: "FinanceInc",
      status: "planning",
      progress: 25,
      team: 3,
      deadline: "2024-06-30",
    },
    {
      id: 3,
      name: "Dashboard Analytics",
      client: "DataCo",
      status: "completed",
      progress: 100,
      team: 2,
      deadline: "2024-04-01",
    },
    {
      id: 4,
      name: "Social Media Platform",
      client: "SocialTech",
      status: "in-progress",
      progress: 60,
      team: 5,
      deadline: "2024-07-20",
    },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects</h2>
          <p className="text-gray-400">Manage and track project progress</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                  <CardDescription className="text-gray-400">{project.client}</CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === "completed"
                      ? "default"
                      : project.status === "in-progress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Team Size</span>
                <span className="text-white">{project.team} members</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Deadline</span>
                <span className="text-white">{project.deadline}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Tasks Page Component
function TasksPage() {
  const [filter, setFilter] = useState("all")

  const tasks = [
    {
      id: 1,
      title: "Implement user authentication",
      project: "E-commerce Platform",
      assignee: "Sarah Mitchell",
      priority: "high",
      status: "in-progress",
      dueDate: "2024-05-10",
    },
    {
      id: 2,
      title: "Design landing page",
      project: "Mobile Banking App",
      assignee: "Lisa Chen",
      priority: "medium",
      status: "todo",
      dueDate: "2024-05-12",
    },
    {
      id: 3,
      title: "Setup CI/CD pipeline",
      project: "Dashboard Analytics",
      assignee: "Mike Johnson",
      priority: "high",
      status: "completed",
      dueDate: "2024-05-08",
    },
    {
      id: 4,
      title: "API integration",
      project: "Social Media Platform",
      assignee: "John Doe",
      priority: "low",
      status: "in-progress",
      dueDate: "2024-05-15",
    },
    {
      id: 5,
      title: "Database optimization",
      project: "E-commerce Platform",
      assignee: "Emma Wilson",
      priority: "medium",
      status: "review",
      dueDate: "2024-05-11",
    },
  ]

  const filteredTasks = filter === "all" ? tasks : tasks.filter((task) => task.status === filter)

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <p className="text-gray-400">Manage and assign development tasks</p>
        </div>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Task</TableHead>
                <TableHead className="text-gray-300">Project</TableHead>
                <TableHead className="text-gray-300">Assignee</TableHead>
                <TableHead className="text-gray-300">Priority</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Due Date</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{task.title}</TableCell>
                  <TableCell className="text-gray-300">{task.project}</TableCell>
                  <TableCell className="text-gray-300">{task.assignee}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={task.status === "completed" ? "default" : "outline"}>{task.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{task.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Blog Page Component
interface Blog {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isFeatured: boolean;
  author: { email: string };
  image?: string;
  createdAt: string;
}

function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isFeatured: false,
    image: null as File | null,
  });
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all blogs on mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/v1/blogs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(response.data.blogs);
    } catch (error) {
      setError('Failed to fetch blogs');
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
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
      let response;
      if (editingBlogId) {
        response = await axios.put(
          `http://localhost:5000/api/v1/blogs/${editingBlogId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        response = await axios.post('http://localhost:5000/api/v1/blogs', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      fetchBlogs();
      resetForm();
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      setError(
        axios.isAxiosError(error) && error.response
          ? error.response.data.error || error.response.data.message || 'Operation failed'
          : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle blog deletion
  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/v1/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (error) {
      setError('Failed to delete blog');
    }
  };

  // Handle toggling featured status
  const handleFeatureToggle = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/v1/blogs/${id}/feature`,
        { isFeatured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlogs();
    } catch (error) {
      setError('Failed to update featured status');
    }
  };

  // Handle edit button click
  const handleEdit = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/v1/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blog = response.data.blog;
      setFormData({
        title: blog.title,
        content: blog.content,
        tags: blog.tags.join(','),
        isFeatured: blog.isFeatured,
        image: null,
      });
      setEditingBlogId(id);
      setIsModalOpen(true);
    } catch (error) {
      setError('Failed to load blog data');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: '',
      isFeatured: false,
      image: null,
    });
    setEditingBlogId(null);
    setError('');
  };

  // Convert buffer to base64 data URL
  const getImageSrc = (image?: { data: Buffer; contentType: string }) => {
    if (!image || !image.data) return '';
    const base64 = Buffer.from(image.data).toString('base64');
    return `data:${image.contentType};base64,${base64}`;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
          <p className="text-gray-400">Create and manage blog content</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingBlogId ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-gray-300">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={5}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., tech, coding, tutorial"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="image" className="text-gray-300">Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleFileChange}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="isFeatured" className="text-gray-300">Featured</Label>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : editingBlogId ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Blog Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Author</TableHead>
                <TableHead className="text-gray-300">Tags</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Featured</TableHead>
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog._id} className="border-gray-700">
                  <TableCell className="text-white font-medium">{blog.title}</TableCell>
                  <TableCell className="text-gray-300">{blog.author.email}</TableCell>
                  <TableCell className="text-gray-300">{blog.tags.join(', ')}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.isFeatured ? 'default' : 'outline'}>
                      {blog.isFeatured ? 'Featured' : 'Not Featured'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.image ? (
                      <img
                        src={getImageSrc(blog.image)}
                        alt={blog.title}
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      'No Image'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(blog._id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blog._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeatureToggle(blog._id, blog.isFeatured)}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {blogs.length === 0 && (
            <div className="p-6 text-center text-gray-400">No blog posts found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Events Page Component
function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Team Building Workshop",
      date: "2024-05-15",
      time: "10:00 AM",
      location: "Conference Room A",
      attendees: 12,
      type: "workshop",
    },
    {
      id: 2,
      title: "Product Launch Webinar",
      date: "2024-05-20",
      time: "2:00 PM",
      location: "Online",
      attendees: 45,
      type: "webinar",
    },
    {
      id: 3,
      title: "Code Review Session",
      date: "2024-05-18",
      time: "3:00 PM",
      location: "Dev Room",
      attendees: 8,
      type: "meeting",
    },
    {
      id: 4,
      title: "Client Presentation",
      date: "2024-05-25",
      time: "11:00 AM",
      location: "Board Room",
      attendees: 6,
      type: "presentation",
    },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Events</h2>
          <p className="text-gray-400">Schedule and manage company events</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {event.date} at {event.time}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{event.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{event.attendees} attendees</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Landing Page Component
function LandingPage() {
  const [activeSection, setActiveSection] = useState("hero")

  const sections = [
    { id: "hero", name: "Hero Section", icon: Image },
    { id: "features", name: "Features", icon: Star },
    { id: "about", name: "About Us", icon: User },
    { id: "contact", name: "Contact", icon: Mail },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Landing Page</h2>
          <p className="text-gray-400">Manage your website content</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Publish className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left ${
                  activeSection === section.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.name}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Edit {sections.find((s) => s.id === activeSection)?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection === "hero" && (
                <>
                  <div>
                    <Label className="text-gray-300">Headline</Label>
                    <Input
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                      placeholder="Enter headline"
                      defaultValue="Build Amazing Products with Our Team"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Subheading</Label>
                    <Textarea
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                      placeholder="Enter subheading"
                      defaultValue="We create innovative solutions that drive business growth and user engagement."
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">CTA Button Text</Label>
                    <Input
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                      placeholder="Button text"
                      defaultValue="Get Started"
                    />
                  </div>
                </>
              )}
              <div className="flex space-x-2 pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">Reset</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Newsletters Page Component
function NewslettersPage() {
  const newsletters = [
    {
      id: 1,
      title: "Weekly Dev Updates",
      subscribers: 1250,
      lastSent: "2024-04-20",
      status: "sent",
      openRate: "24.5%",
    },
    {
      id: 2,
      title: "Product Announcements",
      subscribers: 890,
      lastSent: "2024-04-15",
      status: "draft",
      openRate: "N/A",
    },
    {
      id: 3,
      title: "Tech Tips & Tricks",
      subscribers: 2100,
      lastSent: "2024-04-18",
      status: "sent",
      openRate: "31.2%",
    },
    { id: 4, title: "Company News", subscribers: 750, lastSent: "2024-04-22", status: "scheduled", openRate: "N/A" },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Newsletters</h2>
          <p className="text-gray-400">Create and manage email campaigns</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Newsletter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{newsletter.title}</CardTitle>
                <Badge
                  variant={
                    newsletter.status === "sent" ? "default" : newsletter.status === "draft" ? "secondary" : "outline"
                  }
                >
                  {newsletter.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subscribers</span>
                <span className="text-white">{newsletter.subscribers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Sent</span>
                <span className="text-white">{newsletter.lastSent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Open Rate</span>
                <span className="text-white">{newsletter.openRate}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Contact Page Component

// API configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/contacts';

// Helper function to get auth token (implement based on your auth system)
const getAuthToken = () => {
  // Replace with your actual token retrieval logic
  return localStorage.getItem('authToken') || '';
};

// API functions using your actual endpoints
const api = {
  getContacts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.responded !== undefined) {
        queryParams.append('responded', filters.responded);
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
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },
  
  getContact: async (id) => {
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
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }
  },
  
  respondToContact: async (id, responseText) => {
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
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error responding to contact:', error);
      throw error;
    }
  },
  
  deleteContact: async (id) => {
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
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
};

const StatusBadge = ({ status }) => {
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

const ContactModal = ({ contact, isOpen, onClose, onRespond }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: any) => {
    if (!response.trim()) return;

    setIsLoading(true);
    onRespond(contact._id, response)
      .then(() => {
        setResponse('');
        onClose();
      })
      .catch((error) => {
        console.error('Error sending response:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                    Sent on {new Date(contact.respondedAt).toLocaleString()}
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
                  rows="6"
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

type Contact = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  responded: boolean;
  response?: string;
  respondedAt?: string;
};

function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleRespond = async (contactId: any, response: any) => {
    await api.respondToContact(contactId, response);
    // Update the contact in the local state
    setContacts(contacts.map(contact => 
      contact._id === contactId 
        ? { ...contact, responded: true, response, respondedAt: new Date().toISOString() }
        : contact
    ));
  };

  const handleDelete = async (contactId) => {
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
  );
}

// Settings Page Component
function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Company Name</Label>
                <Input className="bg-gray-700 border-gray-600 text-white mt-1" defaultValue="DevPanel Inc." />
              </div>
              <div>
                <Label className="text-gray-300">Time Zone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" defaultChecked />
                <Label htmlFor="dark-mode" className="text-gray-300">
                  Dark Mode
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive email updates about your projects</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Task Reminders</Label>
                  <p className="text-sm text-gray-400">Get reminded about upcoming deadlines</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Team Updates</Label>
                  <p className="text-sm text-gray-400">Notifications about team activities</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Current Password</Label>
                <Input type="password" className="bg-gray-700 border-gray-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300">New Password</Label>
                <Input type="password" className="bg-gray-700 border-gray-600 text-white mt-1" />
              </div>
              <div>
                <Label className="text-gray-300">Confirm New Password</Label>
                <Input type="password" className="bg-gray-700 border-gray-600 text-white mt-1" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="2fa" />
                <Label htmlFor="2fa" className="text-gray-300">
                  Enable Two-Factor Authentication
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Team Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-gray-300">Team Size Limit</Label>
                  <p className="text-sm text-gray-400">Maximum number of team members</p>
                </div>
                <Select defaultValue="50">
                  <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-assign" defaultChecked />
                <Label htmlFor="auto-assign" className="text-gray-300">
                  Auto-assign tasks to available developers
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  )
}
