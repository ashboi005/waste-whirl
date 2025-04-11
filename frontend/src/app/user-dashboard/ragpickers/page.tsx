"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Filter, Search, Star, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRagpickers } from "@/lib/api" // Ensure this import is correct
import type { RagpickerSummary } from "@/lib/api"

export default function UserRagpickers() {
  const [ragpickers, setRagpickers] = useState<RagpickerSummary[]>([])
  const [filteredRagpickers, setFilteredRagpickers] = useState<RagpickerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ragpickersData = await getRagpickers()
        setRagpickers(ragpickersData)
        setFilteredRagpickers(ragpickersData)
      } catch (error) {
        console.error("Error fetching ragpickers:", error)
        // You can add fallback logic here if needed
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = ragpickers.filter((ragpicker) =>
        `${ragpicker.firstName} ${ragpicker.lastName}`.toLowerCase().includes(query),
      )
      setFilteredRagpickers(filtered)
    } else {
      setFilteredRagpickers(ragpickers)
    }
  }, [searchQuery, ragpickers])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ragpickers</h1>
        <p className="text-muted-foreground">Find and connect with waste collectors in your area</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : filteredRagpickers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRagpickers.map((ragpicker) => (
            <Card key={ragpicker.clerkId} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="h-32 bg-green-50 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {ragpicker.profile_pic_url ? (
                      <img
                        src={ragpicker.profile_pic_url || "/placeholder.svg"}
                        alt={`${ragpicker.firstName} ${ragpicker.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Users className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <CardTitle className="text-xl">
                    {ragpicker.firstName} {ragpicker.lastName}
                  </CardTitle>
                  <CardDescription>Waste Collector</CardDescription>
                  <div className="flex items-center justify-center mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(ragpicker.average_rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{ragpicker.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-2">
                  <Link href={`/user-dashboard/ragpickers/${ragpicker.clerkId}`}>
                    <Button variant="outline">View Profile</Button>
                  </Link>
                  <Button className="bg-green-600 hover:bg-green-700">Request Pickup</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 gap-2">
          <Users className="h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">No ragpickers found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            We couldn't find any ragpickers matching your search criteria.
          </p>
        </div>
      )}
    </div>
  )
}
