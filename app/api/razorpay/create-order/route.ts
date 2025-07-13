// File: src/app/api/razorpay/create-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Make sure your environment variables are loaded.
// You need RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env.local file.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // The request body from the client (checkout/page.tsx)
    const { amount, merchant_transaction_id } = await req.json();

    if (!amount || !merchant_transaction_id) {
      return NextResponse.json(
        { success: false, message: "Amount and Transaction ID are required" },
        { status: 400 }
      );
    }

    const options = {
      amount: amount, // Amount in the smallest currency unit (e.g., paise for INR)
      currency: "INR",
      receipt: merchant_transaction_id, // Your internal transaction ID
      notes: {
        // This is crucial for tracking in webhooks
        merchant_transaction_id: merchant_transaction_id,
      },
    };

    // Create the order with Razorpay
    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Razorpay order creation failed" },
        { status: 500 }
      );
    }

    // Return the successful order details to the client
    return NextResponse.json({ success: true, order: order }, { status: 200 });

  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}