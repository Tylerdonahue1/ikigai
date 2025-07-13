import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"
import { VAPIDataExtractor } from "@/lib/vapi-data-extractor"
import { UpstashStorage } from "@/lib/upstash-storage"
import type { VAPICallResponse } from "@/types/vapi-response"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  const startTime = Date.now()
  const { callId } = params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId") || `customer_${Date.now()}`

  console.log(`🚀 Starting VAPI call retrieval for callId: ${callId}, customerId: ${customerId}`)

  try {
    // Validate call ID format
    if (!callId || callId.length < 10) {
      console.error(`❌ Invalid call ID format: ${callId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid call ID format",
          message: "Call ID must be a valid identifier",
        },
        { status: 400 },
      )
    }

    // 90-second delay to ensure VAPI has processed the call
    console.log(`⏳ Waiting 90 seconds for VAPI to process call ${callId}...`)
    await new Promise((resolve) => setTimeout(resolve, 90000))
    console.log(`✅ 90-second delay completed for call ${callId}`)

    // Initialize VAPI server
    const vapiServer = new VAPIServer()
    console.log(`🔗 Initialized VAPI server for call ${callId}`)

    // Fetch call data from VAPI
    console.log(`📞 Fetching call data from VAPI for call ${callId}`)
    let vapiResponse: VAPICallResponse

    try {
      vapiResponse = await vapiServer.getCall(callId)
      console.log(`✅ Successfully fetched call data from VAPI for call ${callId}`)
      console.log(
        `📊 Call status: ${vapiResponse.status}, duration: ${
          vapiResponse.startedAt && vapiResponse.endedAt
            ? Math.round((new Date(vapiResponse.endedAt).getTime() - new Date(vapiResponse.startedAt).getTime()) / 1000)
            : "unknown"
        } seconds`,
      )
    } catch (vapiError: any) {
      console.error(`❌ VAPI API request failed for call ${callId}:`, vapiError)

      // Handle specific VAPI errors
      if (vapiError.message?.includes("404")) {
        return NextResponse.json(
          {
            success: false,
            error: "Call not found",
            message: `Call ${callId} was not found in VAPI`,
          },
          { status: 404 },
        )
      }

      if (vapiError.message?.includes("401")) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication failed",
            message: "VAPI API key is invalid or expired",
          },
          { status: 401 },
        )
      }

      if (vapiError.message?.includes("429")) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded",
            message: "Too many requests to VAPI API. Please try again later.",
          },
          { status: 429 },
        )
      }

      throw vapiError
    }

    // Validate call data before processing
    console.log(`🔍 Validating call data for call ${callId}`)
    const validation = VAPIDataExtractor.validateCallForProcessing(vapiResponse)

    if (!validation.isValid) {
      console.warn(`⚠️ Call validation failed for call ${callId}:`, validation.errors)
      return NextResponse.json(
        {
          success: false,
          error: "Call not ready for processing",
          message: "Call data is incomplete or invalid",
          details: validation.errors,
        },
        { status: 422 },
      )
    }

    console.log(`✅ Call validation passed for call ${callId}`)

    // Extract structured data from VAPI response
    console.log(`🔄 Extracting structured data from call ${callId}`)
    const extractedData = VAPIDataExtractor.extractCallData(vapiResponse)

    if (extractedData.warnings && extractedData.warnings.length > 0) {
      console.warn(`⚠️ Data extraction warnings for call ${callId}:`, extractedData.warnings)
    }

    console.log(`✅ Successfully extracted data from call ${callId}`)
    console.log(`📋 Extracted data summary:`, {
      id: extractedData.id,
      status: extractedData.status,
      duration: extractedData.duration,
      hasTranscript: !!extractedData.transcript,
      hasSummary: !!extractedData.summary,
      hasStructuredData: !!extractedData.structuredData,
      warnings: extractedData.warnings?.length || 0,
    })

    // Initialize Upstash storage
    console.log(`💾 Initializing Upstash storage for call ${callId}`)
    const storage = new UpstashStorage()

    // Test storage connection
    const connectionTest = await storage.testConnection()
    if (!connectionTest) {
      console.error(`❌ Upstash connection failed for call ${callId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Storage connection failed",
          message: "Unable to connect to Upstash database",
        },
        { status: 503 },
      )
    }

    console.log(`✅ Upstash connection verified for call ${callId}`)

    // Store data in Upstash with customer association
    console.log(`💾 Storing call data in Upstash for call ${callId}, customer ${customerId}`)
    const storageResult = await storage.storeCallData(customerId, callId, extractedData)

    if (!storageResult.success) {
      console.error(`❌ Failed to store call data for call ${callId}`)
      return NextResponse.json(
        {
          success: false,
          error: "Storage failed",
          message: "Failed to store call data in database",
        },
        { status: 500 },
      )
    }

    const { uniqueId } = storageResult
    console.log(`✅ Successfully stored call data with unique ID: ${uniqueId}`)

    // Calculate processing time
    const processingTime = Date.now() - startTime
    console.log(`⏱️ Total processing time for call ${callId}: ${processingTime}ms`)

    // Return success response with unique ID
    const response = {
      success: true,
      data: {
        uniqueId,
        callData: extractedData,
      },
      message: "Call data successfully retrieved and stored",
      metadata: {
        callId,
        customerId,
        processingTimeMs: processingTime,
        extractedAt: extractedData.extractedAt,
        warnings: extractedData.warnings,
      },
    }

    console.log(`🎉 Successfully completed processing for call ${callId}`)
    return NextResponse.json(response)
  } catch (error: any) {
    const processingTime = Date.now() - startTime
    console.error(`❌ Unexpected error processing call ${callId}:`, error)
    console.error(`💥 Error stack:`, error.stack)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while processing the call",
        details: error.message,
        metadata: {
          callId,
          customerId,
          processingTimeMs: processingTime,
          errorAt: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
