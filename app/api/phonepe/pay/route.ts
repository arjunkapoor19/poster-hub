import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;

  if (!saltKey || !saltIndex) {
    console.error("Server configuration error: Salt key or index missing.");
    return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const responsePayload = formData.get('response');

    if (!responsePayload) {
      return NextResponse.json({ success: false, message: "Invalid callback: No response payload found." }, { status: 400 });
    }

    const decodedResponse = Buffer.from(responsePayload as string, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedResponse);
    
    const xVerifyHeader = req.headers.get('X-VERIFY');
    
    const stringToHash = `${responsePayload as string}${saltKey}`;
    const calculatedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const calculatedChecksum = `${calculatedSha256}###${saltIndex}`;

    if (calculatedChecksum !== xVerifyHeader) {
      console.error("Checksum mismatch on callback. Request might be fraudulent.");
      // You can update the order to 'Payment Verification Failed' here if you want
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
    }
    
    const { merchantTransactionId, code } = responseData.data; // Data is nested inside a 'data' object in the callback
    
    let newStatus = 'Payment Failed';
    if (code === 'PAYMENT_SUCCESS') {
      newStatus = 'Processing'; // or 'Paid' or 'Confirmed'
    } else if (code === 'PAYMENT_PENDING') {
      newStatus = 'Pending Payment';
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (error) {
      console.error("Supabase update error on callback:", error);
      // Even if DB update fails, we must acknowledge the webhook
      // You should have monitoring/retry logic for this
    } else {
      console.log(`Order ${merchantTransactionId} status updated to ${newStatus}`);
    }

    // Acknowledge the server-to-server call with a 200 OK
    return NextResponse.json({ success: true, message: "Callback received successfully." }, { status: 200 });

  } catch (error) {
    console.error("Callback handling error:", error);
    // Return a server error response
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}