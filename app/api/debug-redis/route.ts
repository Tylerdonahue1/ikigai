import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { kv } from "@vercel/kv"

export async function GET() {
  try {
    console.log("Debugging Redis connection...")

    // Check environment variables
    const envCheck = {
      STORAGE_URL: !!process.env.STORAGE_URL,
      STORAGE_TOKEN: !!process.env.STORAGE_TOKEN,
      urlValue: process.env.STORAGE_URL ? "Set (hidden)" : "Not set",
      tokenValue: process.env.STORAGE_TOKEN ? "Set (hidden)" : "Not set",
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      KV_URL: !!process.env.KV_URL,
      REDIS_URL: !!process.env.REDIS_URL,
    }

    console.log("Environment variables:", envCheck)

    // Test 1: Try @upstash/redis directly
    let upstashTest = null
    try {
      const redis = new Redis({
        url: process.env.STORAGE_URL!,
        token: process.env.STORAGE_TOKEN!,
      })

      const testKey = `test-${Date.now()}`
      await redis.set(testKey, "test-value")
      const result = await redis.get(testKey)
      await redis.del(testKey)

      upstashTest = {
        success: true,
        result,
        message: "@upstash/redis connection successful",
      }
    } catch (error) {
      upstashTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "@upstash/redis connection failed",
      }
    }

    // Test 2: Try @vercel/kv
    let vercelKvTest = null
    try {
      const testKey = `test-vercel-${Date.now()}`
      await kv.set(testKey, "test-value")
      const result = await kv.get(testKey)
      await kv.del(testKey)

      vercelKvTest = {
        success: true,
        result,
        message: "@vercel/kv connection successful",
      }
    } catch (error) {
      vercelKvTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "@vercel/kv connection failed",
      }
    }

    return NextResponse.json({
      environmentVariables: envCheck,
      upstashTest,
      vercelKvTest,
      recommendations: [
        "If both tests fail, check your Upstash Redis URL and token",
        "Make sure the Redis instance is active in your Upstash dashboard",
        "Verify the environment variables are correctly set in Vercel",
        "Check if your Upstash Redis instance region matches your Vercel deployment region",
      ],
    })
  } catch (error) {
    console.error("Debug Redis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to debug Redis connection",
      },
      { status: 500 },
    )
  }
}
