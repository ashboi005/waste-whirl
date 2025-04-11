"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, Save, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getUser, createUserDetails, createUser, createCustomerDetails } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Set your clerkId
const clerkId = "user_2vZXlUiRU8byiwYo9QPJOzmxHx4";

// Schemas for each form
const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  role: z.string(),
  clerkId: z.string(),
})

const userDetailsFormSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  base64_image: z.string().optional(),
  file_extension: z.string().optional(),
})

const customerDetailsFormSchema = z.object({
  wallet_address: z.string().min(10, { message: "Please enter a valid wallet address" }),
})

export default function CreateUserDetails() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // User form (for creating user)
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "customer",
      clerkId: clerkId,
    },
  })

  // User details form (for creating user details)
  const userDetailsForm = useForm<z.infer<typeof userDetailsFormSchema>>({
    resolver: zodResolver(userDetailsFormSchema),
    defaultValues: {
      phone: "",
      address: "",
      bio: "",
    },
  })

  // Customer details form (for creating customer details)
  const customerDetailsForm = useForm<z.infer<typeof customerDetailsFormSchema>>({
    resolver: zodResolver(customerDetailsFormSchema),
    defaultValues: {
      wallet_address: "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission for User details
  const onUserSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      setIsLoading(true)
      await createUser({ ...data, clerkId })
      setSuccessMessage("User created successfully.")
      toast({
        title: "User created",
        description: "The user has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Creation failed",
        description: "There was a problem creating the user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission for User details
  const onUserDetailsSubmit = async (data: z.infer<typeof userDetailsFormSchema>) => {
    try {
      setIsLoading(true)

      if (imageFile) {
        const reader = new FileReader()
        reader.readAsDataURL(imageFile)
        reader.onload = async () => {
          const base64String = reader.result as string
          const base64Data = base64String.split(",")[1]
          const fileExtension = imageFile.name.split(".").pop() || "jpg"

          const dataWithImage = {
            ...data,
            base64_image: base64Data,
            file_extension: fileExtension,
          }

          // Create user details (POST request)
          await createUserDetails(clerkId, dataWithImage)
          setSuccessMessage("User details and image created successfully.")
          toast({
            title: "User details created",
            description: "Your user details and image have been created successfully.",
          })
        }
      } else {
        await createUserDetails(clerkId, data)
        setSuccessMessage("User details created successfully.")
        toast({
          title: "User details created",
          description: "Your user details have been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error creating user details:", error)
      toast({
        title: "Creation failed",
        description: "There was a problem creating your user details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission for Customer details
  const onCustomerDetailsSubmit = async (data: z.infer<typeof customerDetailsFormSchema>) => {
    try {
      setIsLoading(true)
      await createCustomerDetails(clerkId, data)
      setSuccessMessage("Customer details created successfully.")
      toast({
        title: "Customer details created",
        description: "Your customer details have been created successfully.",
      })
    } catch (error) {
      console.error("Error creating customer details:", error)
      toast({
        title: "Creation failed",
        description: "There was a problem creating your customer details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create User, User Details, and Customer Details</h1>
        <p className="text-muted-foreground">Fill out the forms to create your user data</p>
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md">
            {successMessage}
          </div>
        )}
      </div>

      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user">Create User</TabsTrigger>
          <TabsTrigger value="details">Create User Details</TabsTrigger>
          <TabsTrigger value="wallet">Create Customer Details</TabsTrigger>
        </TabsList>

        {/* Create User Tab */}
        <TabsContent value="user" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create User</CardTitle>
              <CardDescription>Fill in your basic information</CardDescription>
            </CardHeader>
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(onUserSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={userForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormDescription>Your role cannot be changed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Create User
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Create User Details Tab */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create User Details</CardTitle>
              <CardDescription>Provide additional information and photo</CardDescription>
            </CardHeader>
            <Form {...userDetailsForm}>
              <form onSubmit={userDetailsForm.handleSubmit(onUserDetailsSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {profileImage ? (
                          <img
                            src={profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center cursor-pointer"
                      >
                        <Camera className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={userDetailsForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userDetailsForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Green Street, Eco City, EC 12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <FormField
                    control={userDetailsForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Create Details
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Create Customer Details Tab */}
        <TabsContent value="wallet" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Customer Details</CardTitle>
              <CardDescription>Provide your wallet address</CardDescription>
            </CardHeader>
            <Form {...customerDetailsForm}>
              <form onSubmit={customerDetailsForm.handleSubmit(onCustomerDetailsSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={customerDetailsForm.control}
                    name="wallet_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x1234567890abcdef1234567890abcdef12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Create Wallet
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
