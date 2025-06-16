import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Initialize Redis client
const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()
    const { id, sessionId } = body

    if (!id || !sessionId) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // In a real implementation, you would verify the payment with Stripe
    // For now, we'll just mark it as paid in Redis

    // Store the payment status in Redis
    await redis.set(`payment:${id}`, {
      paid: true,
      sessionId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Get the ID from the query parameters
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID parameter" }, { status: 400 })
    }

    // Check if the payment exists in Redis
    const payment = await redis.get(`payment:${id}`)

    return NextResponse.json({
      success: true,
      paid: !!payment && payment.paid === true,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
