// src/app/api/phonepe/pay/route.ts

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { amount, userId } = await req.json(); // Accept userId for better tracking

  // Load environment variables
  const merchantId = process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;
  const phonepeApiUrl = process.env.PHONEPE_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!merchantId || !saltKey || !saltIndex || !phonepeApiUrl || !baseUrl) {
    console.error("PhonePe V2: Environment variables are not set correctly.");
    return NextResponse.json({ success: false, message: "Server configuration error." }, { status: 500 });
  }

  const merchantTransactionId = `MT_${uuidv4().slice(0, 12)}`;
  const merchantUserId = `MUID_${userId.slice(0, 8)}`; // Create a more robust user ID

  const data = {
    merchantId: merchantId,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: merchantUserId,
    amount: Math.round(amount * 100), // Ensure amount is an integer in paise
    redirectUrl: `${baseUrl}/payment-status/${merchantTransactionId}`,
    redirectMode: 'POST', // V2 docs often recommend POST for redirect
    callbackUrl: `${baseUrl}/api/phonepe/status`,
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  try {
    const payload = JSON.stringify(data);
    const payloadBase64 = Buffer.from(payload).toString('base64');
    
    // This checksum calculation is for the V2 API
    const stringToHash = `${payloadBase64}/pg/v1/pay${saltKey}`;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${saltIndex}`;

    const response = await fetch(`${phonepeApiUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const responseData = await response.json();

    if (responseData.success) {
      return NextResponse.json(responseData); // Send the whole success response back
    } else {
      console.error("PhonePe V2 API Error:", responseData);
      return NextResponse.json(responseData, { status: 400 });
    }
  } catch (error) {
    console.error("PhonePe V2: Error initiating payment:", error);
    return NextResponse.json({ success: false, message: "An unexpected error occurred." }, { status: 500 });
  }
}