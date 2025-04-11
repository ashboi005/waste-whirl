"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Recycle,
  RefreshCw,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCustomerRequests, getRagpickers } from "@/lib/api"
import type { Request, RagpickerSummary } from "@/lib/api"

export default function UserDashboard() {
  // Mock user data - in a real app, this would come from authentication
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    clerkId: "user_123456",
  }

  const [requests, setRequests] = useState<Request[]>([])
  const [ragpickers, setRagpickers] = useState<RagpickerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would use the actual user's clerkId
        const requestsData = await getCustomerRequests(mockUser.clerkId)
        const ragpickersData = await getRagpickers()

        setRequests(requestsData)
        setRagpickers(ragpickersData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Use mock data for demonstration
        setRequests([
          {
            id: 1,
            customer_clerkId: mockUser.clerkId,
            ragpicker_clerkId: "ragpicker_123",
            status: "PENDING",
            created_at: new Date().toISOString(),
            ragpicker_name: "Alex Johnson",
          },
          {
            id: 2,
            customer_clerkId: mockUser.clerkId,
            ragpicker_clerkId: "ragpicker_456",
            status: "COMPLETED",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            ragpicker_name: "Sarah Williams",
          },
          {
            id: 3,
            customer_clerkId: mockUser.clerkId,
            ragpicker_clerkId: "ragpicker_789",
            status: "ACCEPTED",
            created_at: new Date(Date.now() - 43200000).toISOString(),
            ragpicker_name: "Mike Brown",
          },
        ] as Request[])

        setRagpickers([
          {
            clerkId: "ragpicker_123",
            firstName: "Alex",
            lastName: "Johnson",
            average_rating: 4.8,
            profile_pic_url: "/placeholder.svg?height=40&width=40",
          },
          {
            clerkId: "ragpicker_456",
            firstName: "Sarah",
            lastName: "Williams",
            average_rating: 4.5,
            profile_pic_url: "/placeholder.svg?height=40&width=40",
          },
          {
            clerkId: "ragpicker_789",
            firstName: "Mike",
            lastName: "Brown",
            average_rating: 4.2,
            profile_pic_url: "/placeholder.svg?height=40&width=40",
          },
        ] as RagpickerSummary[])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "ACCEPTED":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const pendingRequests = requests.filter((req) => req.status === "PENDING").length
  const completedRequests = requests.filter((req) => req.status === "COMPLETED").length
  const activeRequests = requests.filter((req) => req.status === "ACCEPTED").length

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {mockUser.firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your waste collection activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time waste collection requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting ragpicker response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">Successfully completed pickups</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest waste collection requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : requests.length > 0 ? (
                requests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center gap-4 rounded-lg border p-3">
                    {getStatusIcon(request.status)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Request #{request.id}</p>
                      <p className="text-xs text-muted-foreground">Ragpicker: {request.ragpicker_name || "Unknown"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium">{formatDate(request.created_at)}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          request.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Trash2 className="h-8 w-8 text-gray-400" />
                  <p className="text-muted-foreground">No requests found</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/user-dashboard/requests" className="w-full">
              <Button variant="outline" className="w-full">
                View All Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Ragpickers</CardTitle>
            <CardDescription>Highest rated waste collectors in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : ragpickers.length > 0 ? (
                ragpickers.slice(0, 3).map((ragpicker) => (
                  <div key={ragpicker.clerkId} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {ragpicker.profile_pic_url ? (
                        <img
                          src={ragpicker.profile_pic_url || "/placeholder.svg"}
                          alt={`${ragpicker.firstName} ${ragpicker.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {ragpicker.firstName} {ragpicker.lastName}
                      </p>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(ragpicker.average_rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {ragpicker.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/user-dashboard/ragpickers/${ragpicker.clerkId}`}>
                      <Button size="sm" variant="outline">
                        Request
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Users className="h-8 w-8 text-gray-400" />
                  <p className="text-muted-foreground">No ragpickers found</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/user-dashboard/ragpickers" className="w-full">
              <Button variant="outline" className="w-full">
                View All Ragpickers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Schedule</CardTitle>
          <CardDescription>Your upcoming waste collection appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {activeRequests > 0 ? (
            <div className="space-y-4">
              {requests
                .filter((req) => req.status === "ACCEPTED")
                .map((request) => (
                  <div key={request.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">Waste Collection</h4>
                      <p className="text-sm text-muted-foreground">Ragpicker: {request.ragpicker_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">Requested on {formatDate(request.created_at)}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Calendar className="h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No upcoming pickups</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any active waste collection requests. Browse ragpickers and schedule a pickup.
              </p>
              <Link href="/user-dashboard/ragpickers" className="mt-2">
                <Button className="bg-green-600 hover:bg-green-700">Find Ragpickers</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
