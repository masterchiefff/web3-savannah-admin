"use client"

import {
  Plus,
  Calendar,
  Users,
  CheckSquare,
  FolderOpen,
  FileText,
  DollarSign,
  BookIcon as Publish,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card"
import { AdminDashboard } from "@/components/layouts/AdminDashboardLayout"


export default function DashboardPage() {
  const stats = [
    { title: "Total Developers", value: "24", change: "+2", icon: Users, color: "text-blue-400" },
    { title: "Active Projects", value: "12", change: "+3", icon: FolderOpen, color: "text-green-400" },
    { title: "Pending Tasks", value: "47", change: "-5", icon: CheckSquare, color: "text-yellow-400" },
    { title: "Monthly Revenue", value: "$45,230", change: "+12%", icon: DollarSign, color: "text-purple-400" },
  ]

  const recentActivities = [
    { user: "Sarah Mitchell", action: "completed task", project: "E-commerce Platform", time: "2 hours ago" },
    { user: "John Doe", action: "started project", project: "Mobile App", time: "4 hours ago" },
    { user: "Emma Wilson", action: "submitted code review", project: "Dashboard UI", time: "6 hours ago" },
    { user: "Mike Johnson", action: "deployed to production", project: "API Gateway", time: "1 day ago" },
  ]

  return (
    <AdminDashboard>
      <div className="p-4 lg:p-6 space-y-6 overflow-y-auto scrollbar-hide h-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`text-sm ${stat.change.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action} in{" "}
                      <span className="text-blue-400">{activity.project}</span>
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Developer
              </Button>
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700">
                <FolderOpen className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                <FileText className="w-4 h-4 mr-2" />
                Write Blog Post
              </Button>
              <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminDashboard>
  )
}