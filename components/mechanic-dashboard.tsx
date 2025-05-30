"use client"

import { useState } from "react"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  Settings,
  LogOut,
  Users,
  BookOpen,
  DollarSign,
  CheckSquare,
  LayoutDashboard,
  Phone,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  MoreVertical,
  Link,
  ImageIcon,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MechanicDashboard() {
  const [selectedDate, setSelectedDate] = useState(26)
  const [currentMonth, setCurrentMonth] = useState("April, 2024")

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false },
    { icon: BookOpen, label: "Incoming bookings", active: false },
    { icon: CheckSquare, label: "Active bookings", active: false },
    { icon: Users, label: "Customers", active: false },
    { icon: User, label: "Mechanics", active: true },
    { icon: DollarSign, label: "Price settings", active: false },
    { icon: CheckSquare, label: "Finished bookings", active: false },
  ]

  const accountItems = [
    { icon: Settings, label: "Settings", active: false },
    { icon: LogOut, label: "Logout", active: false },
  ]

  const specializations = ["Engines", "Transmission", "Braking system", "Wheel balancing", "Light", "Air conditions"]

  const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const calendarData = [
    { date: 1, tasks: ["Brake pad...", "Steering s..."] },
    { date: 2, tasks: ["Engine mo..."], count: "+2" },
    { date: 3, tasks: ["Air conditi...", "Wheel alig..."], count: "+2" },
    { date: 4, tasks: ["Engine tun...", "Air filter re..."] },
    { date: 5, tasks: [] },
    { date: 6, tasks: [] },
    { date: 7, tasks: [] },
    { date: 8, tasks: ["Engine tun...", "Wheel alig..."], count: "+2" },
    { date: 9, tasks: ["Air filter re..."], count: "+2" },
    { date: 10, tasks: ["Steering s..."], count: "+2" },
    { date: 11, tasks: [] },
    { date: 12, tasks: [] },
    { date: 13, tasks: [] },
    { date: 14, tasks: [] },
    { date: 15, tasks: [] },
    { date: 16, tasks: [] },
    { date: 17, tasks: [] },
    { date: 18, tasks: ["Engine mo..."], count: "+3" },
    { date: 19, tasks: [] },
    { date: 20, tasks: [] },
    { date: 21, tasks: [] },
    { date: 22, tasks: [] },
    { date: 23, tasks: ["Battery re..."] },
    { date: 24, tasks: [] },
    { date: 25, tasks: [] },
    { date: 26, tasks: [], selected: true },
    { date: 27, tasks: [] },
    { date: 28, tasks: [] },
    { date: 29, tasks: [] },
    { date: 30, tasks: ["Engine mo..."], count: "+2" },
  ]

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <h1 className="text-xl font-bold">CARJOY</h1>
        </div>

        {/* Menu */}
        <div className="flex-1 px-4">
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Menus</p>
            <nav className="space-y-1">
              {sidebarItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                    item.active ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Account settings</p>
            <nav className="space-y-1">
              {accountItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700"
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>OW</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">Oliver W.</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
            <div className="flex items-center text-sm">
              <span className="text-white">MECHANICS</span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-400">PROFILE</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 w-64"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘F</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Profile Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback>FM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold">Floyd Miles</h2>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">$75/h</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">12 Mo, 6 days old</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">
                  <User className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  .pdf
                </Button>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Specializations</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckSquare className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Certifications</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">ASE certificate</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                    .pdf
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">ASE advanced</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                    .jpg
                  </Button>
                </div>
              </div>
            </div>

            {/* General */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">General</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Financial reward</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">$45/h</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Start of work</span>
                  <span className="text-sm">17 Jun 2023</span>
                </div>
              </div>
            </div>

            {/* Available absences */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Available absences</h3>
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Days off</span>
                  <span className="text-sm text-gray-400">4 / 15</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Vacation</span>
                  <span className="text-sm text-gray-400">14 / 20</span>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">Contacts</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Phone</span>
                  <span className="text-sm">+47 2375 6571, +47 7875 6572</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">E-mail</span>
                  <span className="text-sm">floyd.miles@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Address</span>
                  <span className="text-sm">Aarhus, Rosenvej 24, 8000, Midtjylland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-96 bg-gray-800 p-6 space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentMonth}</h3>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Week
                </Button>
                <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                  Month
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Year
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Today
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" />
                  New absence
                </Button>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer" />
              <div className="grid grid-cols-7 gap-1 flex-1 mx-4">
                {calendarDays.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day) => (
                <div
                  key={day.date}
                  className={`p-2 min-h-[60px] text-xs border border-gray-700 ${
                    day.selected ? "border-blue-500 bg-blue-900/20" : ""
                  }`}
                >
                  <div className="font-medium mb-1">{day.date}</div>
                  {day.tasks.map((task, index) => (
                    <div key={index} className="text-xs text-gray-400 truncate mb-1">
                      {task}
                    </div>
                  ))}
                  {day.count && <div className="text-xs text-gray-400">{day.count}</div>}
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Notes</h3>
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </div>

              {/* Text Editor Toolbar */}
              <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-700 rounded-t-lg">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <select className="bg-transparent text-sm text-gray-300 border-none outline-none">
                  <option>Usual text</option>
                </select>
                <div className="flex items-center space-x-1 ml-auto">
                  <Button variant="ghost" size="sm" className="p-1">
                    <Bold className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Italic className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <AlignRight className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <List className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Link className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <ImageIcon className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Bot className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                className="w-full h-20 p-3 bg-gray-700 border border-gray-600 rounded-b-lg text-sm text-gray-300 placeholder-gray-500 resize-none"
                placeholder="Type your comment here or @ to mention and notify someone"
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-3">
                <Button variant="ghost" size="sm" className="text-gray-400">
                  Cancel
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8 bg-red-600">
                  <AvatarFallback className="text-white">A</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Anders Johansen</span>
                    <span className="text-xs text-gray-400">23 June, 2024 at 14:24</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Floyd received positive feedback for his detailed engine diagnostics from 5 clients and completed
                    one more certification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
