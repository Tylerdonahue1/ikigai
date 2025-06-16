import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Testing data for ID:", id)

    // Initialize Redis client
    const redis = new Redis({
      url: process.env.STORAGE_URL || "", // Or your new URL variable name
      token: process.env.STORAGE_TOKEN || "", // Or your new TOKEN variable name
    })

    // Fetch the data
    const data = await redis.get(`ikigai:${id}`)

    // Return the data
    return NextResponse.json({
      success: true,
      dataExists: !!data,
      data,
    })
  } catch (error) {
    console.error("Error testing data:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
