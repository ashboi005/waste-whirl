"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateCustomerDetails } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const customerDetailsFormSchema = z.object({
  wallet_address: z.string().min(10, { message: "Please enter a valid wallet address" }),
});

interface WalletCardProps {
  walletAddress: string;
  clerkId: string;
}

export default function WalletCard({ walletAddress, clerkId }: WalletCardProps) {
  const customerDetailsForm = useForm({
    resolver: zodResolver(customerDetailsFormSchema),
    defaultValues: { wallet_address: walletAddress },
  });

  const onSubmit = async (data: z.infer<typeof customerDetailsFormSchema>) => {
    try {
      await updateCustomerDetails(clerkId, data);
      toast({ title: "Wallet updated", description: "Your wallet address has been updated." });
    } catch (error) {
      toast({ title: "Error", description: "There was an error updating your wallet.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
        <CardDescription>Update your blockchain wallet address for transactions</CardDescription>
      </CardHeader>
      <Form {...customerDetailsForm}>
        <form onSubmit={customerDetailsForm.handleSubmit(onSubmit)}>
          <CardContent>
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
              Save Wallet
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
