import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL || "",
      token: process.env.KV_REST_API_TOKEN || "",
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
        url: process.env.KV_REST_API_URL ? "Set" : "Not set",
        token: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
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
          url: process.env.KV_REST_API_URL ? "Set" : "Not set",
          token: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
        },
      },
      { status: 500 },
    )
  }
}
