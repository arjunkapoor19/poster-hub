// File: app/api/webhooks/razorpay/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from 'crypto';

// The secret you defined in your environment variables and Razorpay dashboard
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("Server configuration error: Razorpay webhook secret is missing.");
    return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
  }

  // 1. Get the raw body and signature from the request
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    console.error("Webhook error: Signature missing from header.");
    return NextResponse.json({ success: false, message: "Signature not found" }, { status: 400 });
  }

  try {
    // 2. Verify the signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed. Request might be fraudulent.");
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
    }

    // 3. Signature is valid. Parse the body and process the event.
    const webhookData = JSON.parse(body);
    const event = webhookData.event;
    
    // We are interested in the 'payment.captured' event
    if (event === 'payment.captured') {
      const paymentEntity = webhookData.payload.payment.entity;
      
      // IMPORTANT: Retrieve your internal transaction ID from the 'notes' field.
      // You must pass this when creating the order on the client-side.
      const merchantTransactionId = paymentEntity.notes?.merchant_transaction_id;

      if (!merchantTransactionId) {
        console.error("Webhook error: merchant_transaction_id not found in payment notes.");
        // Return 200 OK to Razorpay, as the webhook itself is valid.
        // You should have monitoring to investigate these cases.
        return NextResponse.json({ success: true, message: "Webhook received, but no transaction ID found." }, { status: 200 });
      }

      let newStatus = 'Processing'; // Payment was successful

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, razorpay_payment_id: paymentEntity.id }) // Optionally save the Razorpay ID
        .eq('merchant_transaction_id', merchantTransactionId);

      if (error) {
        console.error("Supabase update error on webhook:", error);
        // Even if DB update fails, acknowledge the webhook with 200 OK.
        // Implement retry logic or monitoring for failed DB updates.
      } else {
        console.log(`Order ${merchantTransactionId} status updated to ${newStatus}`);
      }
    } else if (event === 'payment.failed') {
        const paymentEntity = webhookData.payload.payment.entity;
        const merchantTransactionId = paymentEntity.notes?.merchant_transaction_id;
        
        if (!merchantTransactionId) {
            console.error("Webhook error: merchant_transaction_id not found in failed payment notes.");
            return NextResponse.json({ success: true, message: "Webhook received, but no transaction ID found." }, { status: 200 });
        }

        const { error } = await supabase
          .from('orders')
          .update({ status: 'Payment Failed' })
          .eq('merchant_transaction_id', merchantTransactionId);

        if (error) {
            console.error("Supabase update error on failed payment webhook:", error);
        } else {
            console.log(`Order ${merchantTransactionId} status updated to Payment Failed`);
        }
    }
    
    // 4. Acknowledge receipt of the webhook
    return NextResponse.json({ success: true, message: "Webhook received successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook handling error:", error);
    return NextResponse.json({ success: false, message: "Internal server error.", error: error.message }, { status: 500 });
  }
}