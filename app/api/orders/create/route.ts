// /api/orders/create/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const {
      user_id,
      items,
      shipping_address,
      shipping_method,
      shipping_cost,
      subtotal,
      total_amount,
      merchant_transaction_id,
      payment_id,
      razorpay_order_id,
      status = "Payment Confirmed"
    } = await request.json()

    // Validate required fields
    if (!user_id || !items || !merchant_transaction_id) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Retry logic for database operations
    const maxRetries = 3
    let lastError

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id,
            items,
            status,
            shipping_address,
            shipping_method,
            shipping_cost,
            subtotal,
            total_amount,
            merchant_transaction_id,
            payment_id,
            razorpay_order_id,
            payment_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (orderError) {
          lastError = orderError
          console.error(`Order creation attempt ${attempt + 1} failed:`, orderError)
          
          if (attempt < maxRetries - 1) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            continue
          }
        } else {
          // Success
          return NextResponse.json({
            success: true,
            data: orderData,
            message: 'Order created successfully'
          })
        }
      } catch (error) {
        lastError = error
        console.error(`Order creation attempt ${attempt + 1} error:`, error)
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          continue
        }
      }
    }

    // All retries failed
    return NextResponse.json({
      success: false,
      message: 'Failed to create order after multiple attempts',
      error: lastError
    }, { status: 500 })

  } catch (error) {
    console.error('Order creation API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error
    }, { status: 500 })
  }
}