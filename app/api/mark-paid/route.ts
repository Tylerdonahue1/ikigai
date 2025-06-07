import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request) {
  try {
    // Get the ID from the query parameters
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID parameter" }, { status: 400 })
    }

    console.log(`Marking payment as completed for ID: ${id}`)

    // Mark the payment as completed
    await kv.set(`payment:${id}`, {
      paid: true,
      sessionId: "manual_set",
      timestamp: new Date().toISOString(),
    })

    // Verify it was set
    const paymentData = await kv.get(`payment:${id}`)

    return NextResponse.json({
      success: true,
      message: `Payment for ID ${id} has been marked as paid`,
      paymentData,
    })
  } catch (error) {
    console.error("Error marking payment:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
