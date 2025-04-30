"use client";

import { createPayment, PaymentResponse } from "@/app/actions/payment";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form validation schema
const formSchema = z.object({
  amount: z.coerce
    .number()
    .positive({
      message: "Amount must be a positive number",
    })
    .min(1, {
      message: "Amount must be at least 1 Euro",
    }),
});

// API constants - duplicated here to show in the UI
const API_URL = "https://developers.flouci.com/api/generate_payment";
const APP_TOKEN_DISPLAY = "***************"; // Redacted for UI display

export default function PaymentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<PaymentResponse | null>(null);
  const [requestDetails, setRequestDetails] = useState<{
    url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
    euroAmount: number;
    millimesAmount: number;
    exchangeRate?: number;
    isLiveRate: boolean;
  } | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // Handle form submission
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Submit the payment through server action
      const formData = new FormData();
      formData.append("amount", data.amount.toString());
      
      const result = await createPayment(formData);
      setResponse(result);
      
      // Prepare request details to display in UI with the real exchange rate
      const euroAmount = data.amount;
      const exchangeRate = result.exchangeRate || 3.37; // Use the real rate or fall back to default
      const isLiveRate = !!result.exchangeRate; // Check if we got a real exchange rate from the API
      const millimesAmount = Math.round(euroAmount * exchangeRate * 1000);

      // Create redacted payload to show in UI (hiding secret)
      const mockPayload = {
        app_token: APP_TOKEN_DISPLAY,
        app_secret: "***************", // Redacted for security
        accept_card: "true",
        amount: millimesAmount.toString(),
        success_link: "https://example.website.com/success",
        fail_link: "https://example.website.com/fail",
        session_timeout_secs: 1200,
        developer_tracking_id: `payment_${Date.now()}`,
      };

      // Save request details for display with the real exchange rate
      setRequestDetails({
        url: API_URL,
        payload: mockPayload,
        euroAmount,
        millimesAmount,
        exchangeRate,
        isLiveRate
      });
      
      // Log exchange rate details for debugging
      console.log("Exchange rate information:", {
        receivedFromServer: result.exchangeRate,
        usedInCalculation: exchangeRate,
        isLiveRate
      });
      
    } catch (error) {
      console.error("Payment submission error:", error);
      setResponse({
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Payment</CardTitle>
          <CardDescription>
            Enter an amount in Euros to generate a payment link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (€)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Generate Payment Link"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {requestDetails && (
        <Card className="w-full mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-600">API Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm">URL:</h3>
                <p className="text-sm font-mono break-all">
                  {requestDetails.url}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm">Currency Conversion:</h3>
                <p className="text-sm">
                  {requestDetails.euroAmount} EUR ≈{" "}
                  {requestDetails.millimesAmount} millimes
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">
                    (1 EUR ≈ {requestDetails.exchangeRate?.toFixed(4)} TND, 1 TND = 1000 millimes)
                  </p>
                  {requestDetails.isLiveRate && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 font-medium rounded-full">
                      Live Rate
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm">Request Payload:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs mt-2 max-h-48">
                  {JSON.stringify(requestDetails.payload, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="w-full mt-6 shadow-lg">
          <CardHeader>
            <CardTitle className={response.success ? "text-green-600" : "text-red-600"}>
              {response.success ? "Payment Link Generated" : "Error"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm">Status:</h3>
                <p className={response.success ? "text-green-600" : "text-red-600"}>
                  {response.message}
                </p>
              </div>

              {response.data && (
                <div>
                  <h3 className="font-medium text-sm">Response Data:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs mt-2 max-h-48">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}

              {response.success && (
                <div className="pt-4 space-y-3">
                  {/* Check for payment_url from previous implementation */}
                  {response.data?.payment_url && (
                    <Button
                      className="w-full"
                      onClick={() => window.open(response.data.payment_url, "_blank")}
                    >
                      Open Payment Page
                    </Button>
                  )}

                  {/* Check for the link in the result object as per the new sample response */}
                  {response.data?.result?.link && (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      onClick={() => window.open(response.data.result.link, "_blank")}
                    >
                      <span className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                        Open Flouci Payment Link
                      </span>
                    </Button>
                  )}

                  {/* Display payment ID if available */}
                  {response.data?.result?.payment_id && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                      Payment ID: {response.data.result.payment_id}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}