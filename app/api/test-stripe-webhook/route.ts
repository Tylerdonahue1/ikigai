import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

export async function GET(request: Request) {
  try {
    // Get the ID and session ID from the query parameters
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const sessionId = url.searchParams.get("session_id") || "manual_test_session"

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID parameter" }, { status: 400 })
    }

    console.log(`Manually marking payment as completed for ID: ${id} with session: ${sessionId}`)

    // Manually mark the payment as completed in Redis
    await redis.set(`payment:${id}`, {
      paid: true,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    })

    // Check if the data was saved correctly
    const paymentData = await redis.get(`payment:${id}`)

    return NextResponse.json({
      success: true,
      message: `Payment for ID ${id} has been manually marked as paid`,
      paymentData,
    })
  } catch (error) {
    console.error("Error in test webhook:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
