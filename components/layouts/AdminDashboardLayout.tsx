"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Menu,
  Calendar,
  User,
  Settings,
  LogOut,
  Users,
  CheckSquare,
  LayoutDashboard,
  FolderOpen,
  FileText,
  MessageSquare,
  Globe,
  Newspaper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ProtectedRoute } from "../protectedRoutes"

interface SidebarItem {
  id: string
  icon: any
  label: string
  active: boolean
}

interface AccountItem {
  id?: string
  icon: any
  label: string
  active: boolean
  onClick?: () => void
}

interface AdminDashboardProps {
  children?: React.ReactNode
}

export function AdminDashboard({ children }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleLogout = () => {
    // Clear authentication data (e.g., token) from localStorage
    localStorage.removeItem("authToken")
    // Redirect to login page
    router.push("/login")
  }

  const sidebarItems: SidebarItem[] = [
    { id: "", icon: LayoutDashboard, label: "Dashboard", active: currentPage === "dashboard" },
    { id: "team", icon: Users, label: "Developers", active: currentPage === "team" },
    { id: "projects", icon: FolderOpen, label: "Projects", active: currentPage === "projects" },
    { id: "tasks", icon: CheckSquare, label: "Tasks", active: currentPage === "tasks" },
    { id: "blog", icon: FileText, label: "Blog Posts", active: currentPage === "blog" },
    { id: "events", icon: Calendar, label: "Events", active: currentPage === "events" },
    { id: "landing", icon: Globe, label: "Landing Page", active: currentPage === "landing" },
    { id: "newsletters", icon: Newspaper, label: "Newsletters", active: currentPage === "newsletters" },
    { id: "contact", icon: MessageSquare, label: "Contact Queries", active: currentPage === "contact" },
  ]

  const accountItems: AccountItem[] = [
    { id: "settings", icon: Settings, label: "Settings", active: currentPage === "settings" },
    { icon: LogOut, label: "Logout", active: false, onClick: handleLogout },
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
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">DEVPANEL</h1>
      </div>
      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">Management</p>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.id}
                href={`/${item.id}`}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
                  item.active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">Account</p>
          <nav className="space-y-1">
            {accountItems.map((item, index) => (
              item.id ? (
                <Link
                  key={index}
                  href={`/admin/${item.id}`}
                  onClick={() => item.id && handleNavigation(item.id)}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              )
            ))}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">Alex Wilson</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="hidden lg:block w-64">
        <SidebarContent />
      </div>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-gray-800">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col min-w-0">
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
        <div className="flex-1 overflow-hidden">
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </div>
      </div>
    </div>
  )
}