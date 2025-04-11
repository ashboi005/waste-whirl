"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, Search, Trash2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getRagpickerRequests,
  updateRequestStatus,
} from "@/lib/api"
import type { Request } from "@/lib/api"

export default function RagpickerRequests() {
  // Hardcoded ragpicker user info
  const ragpickerUser = {
    firstName: "Alex",
    lastName: "Johnson",
    clerkId: "string2", // Hardcoded clerk ID
  }

  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsData = await getRagpickerRequests(ragpickerUser.clerkId)
        setRequests(requestsData)
        setFilteredRequests(requestsData)
      } catch (error) {
        console.error("Error fetching requests:", error)
        setRequests([])
        setFilteredRequests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [ragpickerUser.clerkId])

  useEffect(() => {
    let result = [...requests]

    // Filter by status (tab)
    if (activeTab !== "all") {
      result = result.filter(
        (request) => request.status.toLowerCase() === activeTab.toLowerCase()
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (request) =>
          request.customer_name?.toLowerCase().includes(query) ||
          request.id.toString().includes(query)
      )
    }

    setFilteredRequests(result)
  }, [activeTab, searchQuery, requests])

  const handleUpdateStatus = async (
    requestId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const updated = await updateRequestStatus(requestId, status)
      // Replace the old request with the updated one in local state
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? updated : req))
      )
    } catch (error) {
      console.error(`Error updating request status to ${status}:`, error)
    }
  }

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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pickup Requests</h1>
        <p className="text-muted-foreground">
          Manage and track waste collection requests from customers
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by customer or request ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        <TabsContent value="accepted" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface RequestsListProps {
  requests: Request[]
  isLoading: boolean
  getStatusIcon: (status: string) => JSX.Element
  formatDate: (dateString: string) => string
  onUpdateStatus: (requestId: number, status: "ACCEPTED" | "REJECTED") => void
}

function RequestsList({
  requests,
  isLoading,
  getStatusIcon,
  formatDate,
  onUpdateStatus
}: RequestsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-2">
        <Trash2 className="h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          You don&apos;t have any waste collection requests matching your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Request #{request.id}</CardTitle>
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
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
            <CardDescription>Created on {formatDate(request.created_at)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(request.status)}
                <div>
                  <p className="text-sm font-medium">
                    Customer: {request.customer_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === "PENDING" && "Customer is waiting for your response"}
                    {request.status === "ACCEPTED" && "You have accepted this request"}
                    {request.status === "COMPLETED" && "Waste collection completed"}
                    {request.status === "REJECTED" && "You have declined this request"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {request.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onUpdateStatus(request.id, "ACCEPTED")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => onUpdateStatus(request.id, "REJECTED")}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
