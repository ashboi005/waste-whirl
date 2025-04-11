"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Recycle,
  RefreshCw,
  Star,
  Trash2,
  Users,
  XCircle,
  MessageSquare,
  User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRagpickerDetails, getRagpickerRequests, getRagpickerReviews } from "@/lib/api"
import type { Request, Review, RagpickerDetails } from "@/lib/api"

export default function RagpickerDashboard() {
  // Mock user data - in a real app, this would come from authentication
  const mockUser = {
    firstName: "Alex",
    lastName: "Johnson",
    clerkId: "ragpicker_123456",
  }

  const [requests, setRequests] = useState<Request[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [details, setDetails] = useState<RagpickerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would use the actual ragpicker's clerkId
        const requestsData = await getRagpickerRequests(mockUser.clerkId)
        const reviewsData = await getRagpickerReviews(mockUser.clerkId)
        const detailsData = await getRagpickerDetails(mockUser.clerkId)

        setRequests(requestsData)
        setReviews(reviewsData)
        setDetails(detailsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Use mock data for demonstration
        setRequests([
          {
            id: 1,
            customer_clerkId: "customer_123",
            ragpicker_clerkId: mockUser.clerkId,
            status: "PENDING",
            created_at: new Date().toISOString(),
            customer_name: "John Doe",
          },
          {
            id: 2,
            customer_clerkId: "customer_456",
            ragpicker_clerkId: mockUser.clerkId,
            status: "COMPLETED",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            customer_name: "Jane Smith",
          },
          {
            id: 3,
            customer_clerkId: "customer_789",
            ragpicker_clerkId: mockUser.clerkId,
            status: "ACCEPTED",
            created_at: new Date(Date.now() - 43200000).toISOString(),
            customer_name: "Robert Brown",
          },
        ] as Request[])

        setReviews([
          {
            id: 1,
            customer_clerkId: "customer_456",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 5,
            review: "Excellent service! Very prompt and professional.",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            customer_name: "Jane Smith",
          },
          {
            id: 2,
            customer_clerkId: "customer_789",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 4,
            review: "Good job, arrived on time.",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            customer_name: "Robert Brown",
          },
        ] as Review[])

        setDetails({
          clerkId: mockUser.clerkId,
          wallet_address: "0x1234567890abcdef",
          RFID: "RF123456",
          average_rating: 4.5,
        } as RagpickerDetails)
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
  const totalEarnings = completedRequests * 50 // Mock calculation, $50 per completed request

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {mockUser.firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your waste collection activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pickups</CardTitle>
            <Recycle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time waste collection requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pickups</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings}</div>
            <p className="text-xs text-muted-foreground">Total earnings from completed pickups</p>
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
                      <p className="text-xs text-muted-foreground">Customer: {request.customer_name || "Unknown"}</p>
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
            <Link href="/ragpicker-dashboard/requests" className="w-full">
              <Button variant="outline" className="w-full">
                View All Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>What customers are saying about you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : reviews.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{review.customer_name || "Anonymous"}</p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    {review.review && <p className="mt-2 text-sm text-gray-600">"{review.review}"</p>}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Star className="h-8 w-8 text-gray-400" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/ragpicker-dashboard/reviews" className="w-full">
              <Button variant="outline" className="w-full">
                View All Reviews
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
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
                      <p className="text-sm text-muted-foreground">Customer: {request.customer_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">Requested on {formatDate(request.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Calendar className="h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No active pickups</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any active waste collection requests. Check your pending requests and accept new pickups.
              </p>
              <Link href="/ragpicker-dashboard/requests" className="mt-2">
                <Button className="bg-green-600 hover:bg-green-700">View Pending Requests</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your waste collection statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Average Rating</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(details?.average_rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{details?.average_rating.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {requests.length > 0 ? `${Math.round((completedRequests / requests.length) * 100)}%` : "N/A"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your ragpicker profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {mockUser.firstName} {mockUser.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">Ragpicker ID: {mockUser.clerkId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {details?.wallet_address || "Not set"}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">RFID</p>
                  <p className="text-sm text-muted-foreground">{details?.RFID || "Not assigned"}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-sm">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/ragpicker-dashboard/profile" className="w-full">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
