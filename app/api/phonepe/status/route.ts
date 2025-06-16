// src/app/api/phonepe/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;

  if (!saltKey || !saltIndex) {
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const responsePayload = formData.get('response');

    if (!responsePayload) {
      return NextResponse.json({ message: "Invalid callback: No response payload found." }, { status: 400 });
    }

    const decodedResponse = Buffer.from(responsePayload as string, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedResponse);
    
    const xVerifyHeader = req.headers.get('X-VERIFY');
    
    // V2 checksum calculation for the callback
    const stringToHash = `${responsePayload as string}${saltKey}`;
    const calculatedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const calculatedChecksum = `${calculatedSha256}###${saltIndex}`;

    if (calculatedChecksum !== xVerifyHeader) {
      console.error("Checksum mismatch on callback. Request might be fraudulent.");
      // You might want to update the order status to "Payment Verification Failed" here
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }
    
    const { merchantTransactionId, code } = responseData;
    
    let newStatus = 'Payment Failed';
    if (code === 'PAYMENT_SUCCESS') {
      newStatus = 'Processing';
    } else if (code === 'PAYMENT_PENDING') {
      newStatus = 'Pending Payment';
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (error) {
      console.error("Supabase update error on callback:", error);
    } else {
      console.log(`Order ${merchantTransactionId} status updated to ${newStatus}`);
    }

    // After updating your database, you must redirect the user.
    // The user's browser is waiting for this response.
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-status/${merchantTransactionId}`, 302);

  } catch (error) {
    console.error("Callback handling error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-status/failed`, 302);
  }
}