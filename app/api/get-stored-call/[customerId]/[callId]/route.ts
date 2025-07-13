import { type NextRequest, NextResponse } from "next/server"
import { UpstashStorage } from "@/lib/upstash-storage"

export async function GET(request: NextRequest, { params }: { params: { customerId: string; callId: string } }) {
  const { customerId, callId } = params

  console.log(`🔍 Retrieving stored call data for customer ${customerId}, call ${callId}`)

  try {
    // Validate parameters
    if (!customerId || !callId) {
      console.error(`❌ Missing required parameters: customerId=${customerId}, callId=${callId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Missing parameters",
          message: "Both customerId and callId are required",
        },
        { status: 400 },
      )
    }

    // Initialize storage
    const storage = new UpstashStorage()

    // Test connection
    const connectionTest = await storage.testConnection()
    if (!connectionTest) {
      console.error(`❌ Upstash connection failed`)
      return NextResponse.json(
        {
          success: false,
          error: "Storage connection failed",
          message: "Unable to connect to database",
        },
        { status: 503 },
      )
    }

    // Retrieve call data
    const callData = await storage.getCallDataByCustomerAndCall(customerId, callId)

    if (!callData) {
      console.log(`⚠️ No call data found for customer ${customerId}, call ${callId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Call not found",
          message: `No call data found for customer ${customerId} and call ${callId}`,
        },
        { status: 404 },
      )
    }

    console.log(`✅ Successfully retrieved call data for customer ${customerId}, call ${callId}`)

    return NextResponse.json({
      success: true,
      data: callData,
      message: "Call data retrieved successfully",
    })
  } catch (error: any) {
    console.error(`❌ Error retrieving call data:`, error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve call data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
