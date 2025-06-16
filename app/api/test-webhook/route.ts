import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

export async function GET(request: Request) {
  try {
    // Get the ID from the query parameters
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID parameter" }, { status: 400 })
    }

    console.log(`Manually marking payment as completed for ID: ${id}`)

    // Manually mark the payment as completed in Redis
    await redis.set(`payment:${id}`, {
      paid: true,
      sessionId: "manual_test",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: `Payment for ID ${id} has been manually marked as paid`,
    })
  } catch (error) {
    console.error("Error in test webhook:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
