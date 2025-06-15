// src/app/api/phonepe/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;

  if (!saltKey || !saltIndex) {
    console.error("PhonePe salt key/index not configured for callback.");
    return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
  }

  try {
    // The request body is a string, not JSON, so we read it as text
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);
    
    const phonepeResponse = body.response;
    const xVerifyHeader = req.headers.get('X-VERIFY');

    if (!phonepeResponse || !xVerifyHeader) {
      return NextResponse.json({ message: "Invalid callback: Missing headers or body." }, { status: 400 });
    }
    
    // Verify the checksum to ensure the request is genuinely from PhonePe
    const stringToHash = `${phonepeResponse}${saltKey}`;
    const calculatedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const calculatedChecksum = `${calculatedSha256}###${saltIndex}`;

    if (calculatedChecksum !== xVerifyHeader) {
      console.error("Checksum mismatch on callback. Request might be fraudulent.");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }
    
    const decodedResponse = Buffer.from(phonepeResponse, 'base64').toString('utf-8');
    const responseData = JSON.parse(decodedResponse);
    const { merchantTransactionId, code } = responseData;
    
    let newStatus = 'Payment Failed';
    if (code === 'PAYMENT_SUCCESS') {
      newStatus = 'Processing';
    } else if (code === 'PAYMENT_PENDING') {
      newStatus = 'Pending Payment';
    }

    // Update order status in your Supabase database
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('merchant_transaction_id', merchantTransactionId);

    if (error) {
      console.error("Supabase update error on callback:", error);
    } else {
      console.log(`Order ${merchantTransactionId} status updated to ${newStatus}`);
    }

    // Acknowledge the callback to PhonePe
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Callback handling error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}