import { NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    
    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })

  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
