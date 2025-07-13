import { type NextRequest, NextResponse } from "next/server"
import { UpstashStorage } from "@/lib/upstash-storage"

export async function GET(request: NextRequest, { params }: { params: { customerId: string } }) {
  const { customerId } = params

  console.log(`📋 Retrieving all calls for customer ${customerId}`)

  try {
    // Validate customer ID
    if (!customerId) {
      console.error(`❌ Missing customer ID`)
      return NextResponse.json(
        {
          success: false,
          error: "Missing customer ID",
          message: "Customer ID is required",
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

    // Get customer calls
    const calls = await storage.getCustomerCalls(customerId)

    console.log(`✅ Retrieved ${calls.length} calls for customer ${customerId}`)

    return NextResponse.json({
      success: true,
      data: {
        calls,
        total: calls.length,
      },
      message: `Found ${calls.length} calls for customer ${customerId}`,
    })
  } catch (error: any) {
    console.error(`❌ Error retrieving customer calls:`, error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve customer calls",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
