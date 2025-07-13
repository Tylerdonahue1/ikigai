import { NextResponse } from "next/server"
import { testVapiConnection } from "@/lib/vapi-actions"

export async function GET() {
  try {
    console.log("Testing VAPI connection...")

    const result = await testVapiConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "VAPI connection successful",
        assistant: result.assistant,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("VAPI connection test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to test VAPI connection",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
