"use server";

import { z } from "zod";

// Payment API details from the provided Python file
const FLOUCI_API_URL = "https://developers.flouci.com/api/generate_payment";
const APP_TOKEN = process.env.APP_TOKEN;
const APP_SECRET = process.env.APP_SECRET;
if (!APP_TOKEN || !APP_SECRET) {
  throw new Error("Missing APP_TOKEN or APP_SECRET environment variables");
}

// Define the schema for payment form validation
const PaymentFormSchema = z.object({
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number",
  }),
});

// Define response types
export type PaymentResponse = {
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
};

export async function createPayment(
  formData: FormData
): Promise<PaymentResponse> {
  try {
    // Validate the amount
    const validatedFields = PaymentFormSchema.safeParse({
      amount: formData.get("amount"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        error: validatedFields.error.format(),
      };
    }

    // Convert amount from euros to millimes (Tunisian currency unit)
    // 1 EUR ≈ 3.37 TND as of April 2025
    // 1 TND = 1000 millimes
    const euroAmount = validatedFields.data.amount;
    const millimesAmount = Math.round(euroAmount * 3.37 * 1000);

    // Prepare the payload for Flouci API
    const payload = {
      app_token: APP_TOKEN,
      app_secret: APP_SECRET,
      accept_card: "true",
      amount: millimesAmount.toString(),
      success_link: "https://example.website.com/success",
      fail_link: "https://example.website.com/fail",
      session_timeout_secs: 1200,
      developer_tracking_id: `payment_${Date.now()}`,
    };

    // Make the API call to Flouci
    const response = await fetch(FLOUCI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    return {
      success: response.ok,
      message: response.ok
        ? "Payment link generated successfully"
        : "Failed to generate payment link",
      data: responseData,
    };
  } catch (error) {
    console.error("Payment creation error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
