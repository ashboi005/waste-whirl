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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getUser,
  getUserDetails,
  getRagpickerDetails,
  updateUser,
  updateUserDetails,
  updateRagpickerDetails,
} from "@/lib/api"
import { toast } from "@/hooks/use-toast"

// Mock user data - in a real app, this would come from authentication
const mockUser = {
  firstName: "Alex",
  lastName: "Johnson",
  clerkId: "user_2vXyaXunjfYEnioyFnZFvc4q8ah",
  email: "alex.johnson@example.com",
  role: "ragpicker",
}

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

const ragpickerDetailsFormSchema = z.object({
  wallet_address: z.string().min(10, { message: "Please enter a valid wallet address" }),
  RFID: z.string().optional(),
})

export default function RagpickerProfile() {
  const [isLoading, setIsLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // User form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "ragpicker",
      clerkId: "",
    },
  })

  // User details form
  const userDetailsForm = useForm<z.infer<typeof userDetailsFormSchema>>({
    resolver: zodResolver(userDetailsFormSchema),
    defaultValues: {
      phone: "",
      address: "",
      bio: "",
    },
  })

  // Ragpicker details form
  const ragpickerDetailsForm = useForm<z.infer<typeof ragpickerDetailsFormSchema>>({
    resolver: zodResolver(ragpickerDetailsFormSchema),
    defaultValues: {
      wallet_address: "",
      RFID: "",
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you would use the actual ragpicker's clerkId
        const userData = await getUser(mockUser.clerkId)
        const userDetailsData = await getUserDetails(mockUser.clerkId)
        const ragpickerDetailsData = await getRagpickerDetails(mockUser.clerkId)

        // Set user form data
        userForm.reset({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          clerkId: userData.clerkId,
        })

        // Set user details form data
        userDetailsForm.reset({
          phone: userDetailsData.phone || "",
          address: userDetailsData.address || "",
          bio: userDetailsData.bio || "",
        })

        // Set profile image if available
        if (userDetailsData.profile_pic_url) {
          setProfileImage(userDetailsData.profile_pic_url)
        }

        // Set ragpicker details form data
        ragpickerDetailsForm.reset({
          wallet_address: ragpickerDetailsData.wallet_address || "",
          RFID: ragpickerDetailsData.RFID || "",
        })
      } catch (error) {
        console.error("Error fetching ragpicker data:", error)
        // Use mock data for demonstration
        userForm.reset({
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          clerkId: mockUser.clerkId,
        })

        userDetailsForm.reset({
          phone: "+1 (555) 987-6543",
          address: "456 Recycle Avenue, Green Town, GT 54321",
          bio: "Professional waste collector with 5 years of experience in sustainable waste management.",
        })

        ragpickerDetailsForm.reset({
          wallet_address: "0xabcdef1234567890abcdef1234567890abcdef12",
          RFID: "RF123456",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const onUserSubmit = async (data: z.infer<typeof userFormSchema>) => {
    try {
      await updateUser(mockUser.clerkId, data)
      toast({
        title: "Profile updated",
        description: "Your basic information has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onUserDetailsSubmit = async (data: z.infer<typeof userDetailsFormSchema>) => {
    try {
      // If there's a new image, convert it to base64
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

          await updateUserDetails(mockUser.clerkId, dataWithImage)
          toast({
            title: "Profile details updated",
            description: "Your profile details and image have been updated successfully.",
          })
        }
      } else {
        await updateUserDetails(mockUser.clerkId, data)
        toast({
          title: "Profile details updated",
          description: "Your profile details have been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating user details:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onRagpickerDetailsSubmit = async (data: z.infer<typeof ragpickerDetailsFormSchema>) => {
    try {
      await updateRagpickerDetails(mockUser.clerkId, data)
      toast({
        title: "Ragpicker details updated",
        description: "Your wallet address and RFID have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating ragpicker details:", error)
      toast({
        title: "Update failed",
        description: "There was a problem updating your ragpicker details. Please try again.",
        variant: "destructive",
      })
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="ragpicker">Ragpicker Info</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
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
                            <Input placeholder="Alex" {...field} />
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
                            <Input placeholder="Johnson" {...field} />
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
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your profile information and photo</CardDescription>
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
                              <Input placeholder="+1 (555) 987-6543" {...field} />
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
                              <Input placeholder="456 Recycle Avenue, Green Town, GT 54321" {...field} />
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
                            placeholder="Tell us about your experience as a waste collector..."
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
                    Save Details
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="ragpicker" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ragpicker Information</CardTitle>
              <CardDescription>Update your ragpicker-specific details</CardDescription>
            </CardHeader>
            <Form {...ragpickerDetailsForm}>
              <form onSubmit={ragpickerDetailsForm.handleSubmit(onRagpickerDetailsSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={ragpickerDetailsForm.control}
                    name="wallet_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0xabcdef1234567890abcdef1234567890abcdef12" {...field} />
                        </FormControl>
                        <FormDescription>Your blockchain wallet address for receiving payments</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ragpickerDetailsForm.control}
                    name="RFID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFID Tag</FormLabel>
                        <FormControl>
                          <Input placeholder="RF123456" {...field} />
                        </FormControl>
                        <FormDescription>Your RFID tag for waste collection verification (if assigned)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" />
                    Save Ragpicker Info
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
