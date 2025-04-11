"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeft, Star, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createReview } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

// Mock user data - in a real app, this would come from authentication
const mockUser = {
  firstName: "John",
  lastName: "Doe",
  clerkId: "user_123456",
}

const reviewFormSchema = z.object({
  rating: z.string().min(1, { message: "Please select a rating" }),
  review: z.string().optional(),
})

export default function NewReview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ragpickerClerkId = searchParams.get("ragpickerId")
  const requestId = searchParams.get("requestId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ragpicker, setRagpicker] = useState({
    firstName: "Alex",
    lastName: "Johnson",
    clerkId: ragpickerClerkId || "ragpicker_123",
    profile_pic_url: "/placeholder.svg?height=80&width=80",
  })

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: "5",
      review: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof reviewFormSchema>) => {
    if (!ragpickerClerkId) {
      toast({
        title: "Error",
        description: "Ragpicker ID is missing. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createReview({
        customer_clerkId: mockUser.clerkId,
        ragpicker_clerkId: ragpickerClerkId,
        rating: Number.parseInt(data.rating),
        review: data.review,
      })
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      })
      router.push("/user-dashboard/requests")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link href="/user-dashboard/requests">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave a Review</h1>
        <p className="text-muted-foreground">Share your experience with the ragpicker</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {ragpicker.profile_pic_url ? (
                <img
                  src={ragpicker.profile_pic_url || "/placeholder.svg"}
                  alt={`${ragpicker.firstName} ${ragpicker.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <CardTitle>
                {ragpicker.firstName} {ragpicker.lastName}
              </CardTitle>
              <CardDescription>{requestId ? `Request #${requestId}` : "Waste Collection Service"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <FormItem key={value} className="flex flex-col items-center space-y-1">
                            <FormControl>
                              <RadioGroupItem value={value.toString()} className="sr-only" />
                            </FormControl>
                            <FormLabel className="cursor-pointer">
                              <Star
                                className={`h-8 w-8 ${
                                  value <= Number.parseInt(field.value)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </FormLabel>
                            <span className="text-xs">{value}</span>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Review (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this ragpicker..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your feedback helps other users and helps the ragpicker improve their service.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
