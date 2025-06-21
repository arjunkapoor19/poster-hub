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
    // --- THE FIX IS HERE ---
    // Use req.json() to parse the incoming JSON body from PhonePe
    const body = await req.json(); 
    const responsePayload = body.response;
    // --- END OF FIX ---

    if (!responsePayload) {
      return NextResponse.json({ success: false, message: "Invalid callback: No response payload found." }, { status: 400 });
    }

    // The rest of the logic can stay the same, as `responsePayload` is the Base64 string we need.
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
    
    // According to PhonePe docs, the actual payment data is nested.
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

    // Acknowledge the server-to-server call with a 200 OK
    return NextResponse.json({ success: true, message: "Callback received successfully." }, { status: 200 });

  } catch (error: any) {
    console.error("Callback handling error:", error);
    return NextResponse.json({ success: false, message: "Internal server error.", error: error.message }, { status: 500 });
  }
}