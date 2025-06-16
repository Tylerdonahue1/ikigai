import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.STORAGE_URL || "", // Or your new URL variable name
      token: process.env.STORAGE_TOKEN || "", // Or your new TOKEN variable name
    })

    // Test connection by setting and getting a value
    const testKey = "test-connection-" + Date.now()
    await redis.set(testKey, "Connection successful")
    const result = await redis.get(testKey)

    return NextResponse.json({
      success: true,
      message: "Redis connection successful",
      result,
      env: {
        url: process.env.STORAGE_URL ? "Set" : "Not set", // Or your new URL variable name
        token: process.env.STORAGE_TOKEN ? "Set" : "Not set", // Or your new TOKEN variable name
      },
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Redis connection failed",
        details: error instanceof Error ? error.message : String(error),
        env: {
          url: process.env.STORAGE_URL ? "Set" : "Not set", // Or your new URL variable name
          token: process.env.STORAGE_TOKEN ? "Set" : "Not set", // Or your new TOKEN variable name
        },
      },
      { status: 500 },
    )
  }
}
