"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle, Clock, MessageSquare, Recycle, Star, User, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getRagpickerDetails, getRagpickers, getRagpickerReviews, createRequest, createReview } from "@/lib/api"
import type { RagpickerDetails, RagpickerSummary, Review } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function RagpickerProfile({ params }: { params: { clerkId: string } }) {
  const [ragpicker, setRagpicker] = useState<RagpickerSummary | null>(null)
  const [details, setDetails] = useState<RagpickerDetails | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rating, setRating] = useState<number>(5)
  const [reviewText, setReviewText] = useState("")
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the ragpicker summary
        const ragpickerData = await getRagpickers(100, 0)
        const currentRagpicker = ragpickerData.find((ragpicker) => ragpicker.clerkId === params.clerkId)

        if (!currentRagpicker) throw new Error("Ragpicker not found")

        setRagpicker(currentRagpicker)

        // Fetch ragpicker details
        const ragpickerDetailsData = await getRagpickerDetails(params.clerkId)
        setDetails(ragpickerDetailsData)

        // Fetch ragpicker reviews
        const reviewsData = await getRagpickerReviews(params.clerkId)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load ragpicker data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.clerkId])

  const handleRequestPickup = async () => {
    setIsSubmittingRequest(true)
    try {
      await createRequest({
        customer_clerkId: params.clerkId,  // assuming the customer clerkId is available in params or mock data
        ragpicker_clerkId: params.clerkId,
      })
      toast({
        title: "Request sent",
        description: "Your pickup request has been sent to the ragpicker.",
      })
      setRequestDialogOpen(false)
    } catch (error) {
      console.error("Error creating request:", error)
      toast({
        title: "Request failed",
        description: "There was a problem sending your request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true)
    try {
      await createReview({
        customer_clerkId: params.clerkId,  // assuming the customer clerkId is available in params or mock data
        ragpicker_clerkId: params.clerkId,
        rating,
        review: reviewText,
      })
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })
      setReviewDialogOpen(false)

      // Refresh reviews
      const updatedReviews = await getRagpickerReviews(params.clerkId)
      setReviews(updatedReviews)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/user-dashboard/ragpickers">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Ragpickers
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                {ragpicker?.profile_pic_url ? (
                  <img
                    src={ragpicker.profile_pic_url || "/placeholder.svg"}
                    alt={`${ragpicker.firstName} ${ragpicker.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold">
                {ragpicker?.firstName} {ragpicker?.lastName}
              </h2>
              <p className="text-muted-foreground mb-2">Waste Collector</p>
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(details?.average_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium">{details?.average_rating.toFixed(1) || "N/A"}</span>
                <span className="ml-1 text-sm text-muted-foreground">({reviews.length} reviews)</span>
              </div>
              <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">Request Pickup</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Waste Pickup</DialogTitle>
                    <DialogDescription>
                      You are about to request a waste pickup from {ragpicker?.firstName} {ragpicker?.lastName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>
                      Once you submit this request, the ragpicker will be notified and can accept or decline your
                      request. You will be notified of their response.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleRequestPickup}
                      disabled={isSubmittingRequest}
                    >
                      {isSubmittingRequest ? "Sending..." : "Confirm Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-2">
                    Leave a Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogDescription>
                      Share your experience with {ragpicker?.firstName} {ragpicker?.lastName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <RadioGroup
                        defaultValue="5"
                        className="flex space-x-2"
                        onValueChange={(value) => setRating(Number.parseInt(value))}
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex flex-col items-center">
                            <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="sr-only" />
                            <Label
                              htmlFor={`rating-${value}`}
                              className="cursor-pointer p-2 rounded-full hover:bg-gray-100"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  value <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            </Label>
                            <span className="text-xs">{value}</span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review">Your Review (Optional)</Label>
                      <Textarea
                        id="review"
                        placeholder="Share your experience with this ragpicker..."
                        className="min-h-[100px]"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>Information about this ragpicker</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completion Rate</p>
                        <p className="text-lg font-bold">{details?.completion_rate || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Response Time</p>
                        <p className="text-lg font-bold">{details?.response_time || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-lg font-bold">{details?.member_since || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Recycle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pickups Completed</p>
                        <p className="text-lg font-bold">{details?.pickups_completed || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Bio</h3>
                    <p className="text-gray-600">{details?.bio || "No bio available"}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Services</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {details?.services ? (
                        details.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))
                      ) : (
                        <li>No services listed</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>What others are saying about this ragpicker</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
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
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <MessageSquare className="h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          This ragpicker hasn't received any reviews yet. Be the first to leave a review!
                        </p>
                        <Button
                          className="mt-2 bg-green-600 hover:bg-green-700"
                          onClick={() => setReviewDialogOpen(true)}
                        >
                          Leave a Review
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                {reviews.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setReviewDialogOpen(true)}>
                      Leave a Review
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
