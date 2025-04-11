"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserDetails } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const userDetailsFormSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  base64_image: z.string().optional(),
  file_extension: z.string().optional(),
});

interface ProfileDetailsCardProps {
  userDetails: { phone?: string; address?: string; bio?: string; profile_pic_url?: string };
  clerkId: string;
}

export default function ProfileDetailsCard({ userDetails, clerkId }: ProfileDetailsCardProps) {
  const userDetailsForm = useForm({
    resolver: zodResolver(userDetailsFormSchema),
    defaultValues: userDetails,
  });

  const onSubmit = async (data: z.infer<typeof userDetailsFormSchema>) => {
    try {
      await updateUserDetails(clerkId, data);
      toast({ title: "Profile details updated", description: "Your profile details have been updated." });
    } catch (error) {
      toast({ title: "Error", description: "There was an error updating your profile details.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your profile information and photo</CardDescription>
      </CardHeader>
      <Form {...userDetailsForm}>
        <form onSubmit={userDetailsForm.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {userDetails.profile_pic_url ? (
                    <img
                      src={userDetails.profile_pic_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-12 w-12 text-gray-400" />
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
                    <Textarea placeholder="Tell us a bit about yourself..." className="min-h-[120px]" {...field} />
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
  );
}
