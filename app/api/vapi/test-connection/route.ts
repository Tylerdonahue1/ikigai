import { NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function GET() {
  try {
    console.log("Testing VAPI connection...")

    // Check if API key is configured
    const apiKey = process.env.VAPI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "VAPI_API_KEY environment variable is not configured",
          configured: false,
          suggestion: "Please add VAPI_API_KEY to your environment variables",
        },
        { status: 500 },
      )
    }

    console.log(`API Key configured: ${apiKey.substring(0, 10)}... (${apiKey.length} characters)`)

    // Check API key format
    const keyFormat = {
      length: apiKey.length,
      startsWithSk: apiKey.startsWith("sk-"),
      startsWithPk: apiKey.startsWith("pk-"),
      prefix: apiKey.substring(0, 4),
    }

    console.log("API Key format analysis:", keyFormat)

    const vapi = new VAPIServer()
    const result = await vapi.testConnection()

    if (result.connected) {
      return NextResponse.json({
        success: true,
        message: "VAPI connection successful",
        configured: true,
        keyFormat,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          configured: true,
          isAuthError: result.isAuthError,
          keyFormat,
          suggestion: result.isAuthError
            ? "Please verify you're using the correct type of API key (private vs public) and that it's active in your VAPI dashboard"
            : "Please verify your VAPI_API_KEY is correct and has proper permissions",
        },
        { status: result.isAuthError ? 401 : 500 },
      )
    }
  } catch (error) {
    console.error("Error testing VAPI connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        configured: !!process.env.VAPI_API_KEY,
        suggestion: "Check server logs for detailed error information",
      },
      { status: 500 },
    )
  }
}
