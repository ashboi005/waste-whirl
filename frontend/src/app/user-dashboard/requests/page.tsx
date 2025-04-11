"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ethers } from "ethers"
import { CheckCircle, Clock, Search, Trash2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCustomerRequests, updateRequestStatus } from "@/lib/api"
import type { Request as BaseRequest } from "@/lib/api"
import type { JSX } from "react/jsx-runtime"
import { toast } from "@/hooks/use-toast" // <-- Make sure you have this hook imported

// Extend the Request interface to include smart_contract_address
interface Request extends BaseRequest {
  smart_contract_address?: string;
}

// Minimal ABI for calling confirmCompletion() on RagJob
const RagJobABI = [
  {
    "inputs": [],
    "name": "confirmCompletion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

export default function UserRequests() {
  // Hardcode the clerkId as a string (customer user)
  const clerkId = "string"

  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isMarking, setIsMarking] = useState<number | null>(null) // store request ID being completed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsData = await getCustomerRequests(clerkId)
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
  }, [clerkId])

  useEffect(() => {
    let result = [...requests]

    // Filter by status (activeTab)
    if (activeTab !== "all") {
      result = result.filter((req) => req.status.toLowerCase() === activeTab.toLowerCase())
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (req) =>
          req.ragpicker_name?.toLowerCase().includes(query) ||
          req.id.toString().includes(query)
      )
    }

    setFilteredRequests(result)
  }, [activeTab, searchQuery, requests])

  // Calls confirmCompletion() in the RagJob contract
  const handleMarkCompleted = async (request: Request) => {
    if (!request.smart_contract_address) {
      console.error("No contract address found on this request.")
      toast({
        title: "No Contract Address",
        description: "Cannot mark this request completed without a contract address",
        variant: "destructive"
      })
      return
    }

    try {
      setIsMarking(request.id)

      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install or unlock MetaMask to proceed",
          variant: "destructive"
        })
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Instantiate RagJob contract
      const contract = new ethers.Contract(
        request.smart_contract_address,
        RagJobABI,
        signer
      )

      // Call confirmCompletion
      const tx = await contract.confirmCompletion()
      console.log("confirmCompletion transaction sent:", tx)
      await tx.wait() // wait for mining
      console.log("Transaction mined")

      // Optionally update the request status in your backend
      const updatedReq = await updateRequestStatus(request.id, "COMPLETED")

      // Update local state
      setRequests((prev) => prev.map((r) => (r.id === request.id ? updatedReq : r)))

      // Show a success toast
      toast({
        title: "Payment Released",
        description: "Payment has been successfully transferred to the ragpicker."
      })
    } catch (error: any) {
      console.error("Error calling confirmCompletion:", error)
      toast({
        title: "Error",
        description: error.reason || error.message || "Failed to confirm completion",
        variant: "destructive"
      })
    } finally {
      setIsMarking(null)
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
        <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
        <p className="text-muted-foreground">
          Manage and track your waste collection requests
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ragpicker or request ID..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/user-dashboard/requests/new">
          <Button className="bg-green-600 hover:bg-green-700">
            New Request
          </Button>
        </Link>
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
            handleMarkCompleted={handleMarkCompleted}
            isMarking={isMarking}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            handleMarkCompleted={handleMarkCompleted}
            isMarking={isMarking}
          />
        </TabsContent>
        <TabsContent value="accepted" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            handleMarkCompleted={handleMarkCompleted}
            isMarking={isMarking}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            handleMarkCompleted={handleMarkCompleted}
            isMarking={isMarking}
          />
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <RequestsList
            requests={filteredRequests}
            isLoading={isLoading}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            handleMarkCompleted={handleMarkCompleted}
            isMarking={isMarking}
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
  handleMarkCompleted: (request: Request) => Promise<void>
  isMarking: number | null
}

function RequestsList({
  requests,
  isLoading,
  getStatusIcon,
  formatDate,
  handleMarkCompleted,
  isMarking
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
            <CardDescription>
              Created on {formatDate(request.created_at)}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(request.status)}
                <div>
                  <p className="text-sm font-medium">
                    Ragpicker: {request.ragpicker_name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === "PENDING" && "Waiting for ragpicker to accept"}
                    {request.status === "ACCEPTED" && "Ragpicker has accepted your request"}
                    {request.status === "COMPLETED" && "Waste collection completed"}
                    {request.status === "REJECTED" && "Ragpicker has declined your request"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {request.status === "ACCEPTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-500 border-green-200 hover:bg-green-50"
                    onClick={() => handleMarkCompleted(request)}
                    disabled={isMarking === request.id}
                  >
                    {isMarking === request.id ? "Marking..." : "Mark as Completed"}
                  </Button>
                )}

                {request.status === "COMPLETED" && (
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      href={`/user-dashboard/reviews/new?ragpickerId=${request.ragpicker_clerkId}&requestId=${request.id}`}
                    >
                      Leave Review
                    </Link>
                  </Button>
                )}

                {request.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
