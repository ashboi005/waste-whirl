"use client"

import { useState, useEffect } from "react"
import { Filter, Search, Star, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getRagpickerReviews } from "@/lib/api"
import type { Review } from "@/lib/api"

export default function RagpickerReviews() {
  // Mock user data - in a real app, this would come from authentication
  const mockUser = {
    firstName: "Alex",
    lastName: "Johnson",
    clerkId: "ragpicker_123456",
  }

  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would use the actual ragpicker's clerkId
        const reviewsData = await getRagpickerReviews(mockUser.clerkId)
        setReviews(reviewsData)
        setFilteredReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        // Use mock data for demonstration
        const mockReviews = [
          {
            id: 1,
            customer_clerkId: "customer_123",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 5,
            review:
              "Alex was very professional and prompt. He collected all the waste efficiently and left the area clean. Highly recommend!",
            created_at: new Date().toISOString(),
            customer_name: "John Doe",
          },
          {
            id: 2,
            customer_clerkId: "customer_456",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 4,
            review: "Good service, arrived on time. Would use again.",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            customer_name: "Jane Smith",
          },
          {
            id: 3,
            customer_clerkId: "customer_789",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 5,
            review: "Excellent service! Very friendly and efficient.",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            customer_name: "Robert Brown",
          },
          {
            id: 4,
            customer_clerkId: "customer_101",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 3,
            review: "Service was okay. A bit late but got the job done.",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            customer_name: "Emily Davis",
          },
          {
            id: 5,
            customer_clerkId: "customer_202",
            ragpicker_clerkId: mockUser.clerkId,
            rating: 5,
            review: "Very thorough and careful with sorting the waste. Great job!",
            created_at: new Date(Date.now() - 345600000).toISOString(),
            customer_name: "James Wilson",
          },
        ] as Review[]

        setReviews(mockReviews)
        setFilteredReviews(mockReviews)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = reviews.filter(
        (review) => review.customer_name?.toLowerCase().includes(query) || review.review?.toLowerCase().includes(query),
      )
      setFilteredReviews(filtered)
    } else {
      setFilteredReviews(reviews)
    }
  }, [searchQuery, reviews])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // Count ratings by star
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
        <p className="text-muted-foreground">See what customers are saying about your service</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rating Summary</CardTitle>
            <CardDescription>Your overall performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl font-bold text-green-600">{averageRating.toFixed(1)}</div>
              <div className="flex items-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium w-3">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{
                        width:
                          reviews.length > 0
                            ? `${(ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100}%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reviews..."
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
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{review.customer_name || "Anonymous"}</h3>
                          <span className="text-sm text-muted-foreground">{formatDate(review.created_at)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.review && <p className="mt-2 text-gray-700">{review.review}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 gap-2">
              <Star className="h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                You don't have any reviews matching your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
