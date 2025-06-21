// Pasting this code ensures we are working from a known-good state.
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
    // This is the critical part. We are explicitly using req.json().
    const body = await req.json();
    const responsePayload = body.response;

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
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 403 });
    }
    
    const { merchantTransactionId, code } = responseData.data; 
    
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

    return NextResponse.json({ success: true, message: "Callback received successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Callback handling error:", error);
    return NextResponse.json({ success: false, message: "Internal server error in callback.", error: error.message }, { status: 500 });
  }
}