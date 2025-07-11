import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("VAPI capture response:", body)

    // Here you would typically store the response in your database
    // For now, we'll just log it and return success

    return NextResponse.json({
      success: true,
      message: "Response captured successfully",
      data: body,
    })
  } catch (error) {
    console.error("Error capturing VAPI response:", error)
    return NextResponse.json({ success: false, error: "Failed to capture response" }, { status: 500 })
  }
}
