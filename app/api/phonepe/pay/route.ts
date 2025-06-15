// src/app/api/phonepe/pay/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  // Load environment variables
  const merchantId = process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const phonepeApiUrl = process.env.PHONEPE_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!merchantId || !saltKey || !saltIndex || !phonepeApiUrl || !baseUrl) {
    console.error("PhonePe environment variables are not set correctly.");
    return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
  }

  // Generate a unique transaction ID for this order
  const merchantTransactionId = uuidv4();

  const data = {
    merchantId: merchantId,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: 'MUID123', // This can be a static value for now
    amount: amount * 100, // Amount in paise
    redirectUrl: `${baseUrl}/payment-status/${merchantTransactionId}`,
    redirectMode: 'REDIRECT',
    callbackUrl: `${baseUrl}/api/phonepe/status`, // Server-to-server callback
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  try {
    // Create the payload and the X-VERIFY checksum
    const payload = JSON.stringify(data);
    const payloadBase64 = Buffer.from(payload).toString('base64');
    
    const stringToHash = `${payloadBase64}/pg/v1/pay${saltKey}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    // Make the API call to PhonePe
    const response = await fetch(`${phonepeApiUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const responseData = await response.json();

    if (responseData.success && responseData.data.instrumentResponse.redirectInfo.url) {
      // Send the redirect URL back to the frontend
      return NextResponse.json({ 
        success: true, 
        redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId: merchantTransactionId 
      });
    } else {
      console.error("PhonePe API Error:", responseData);
      return NextResponse.json({ success: false, message: responseData.message || "Payment initiation failed." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred." }, { status: 500 });
  }
}