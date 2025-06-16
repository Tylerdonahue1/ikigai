import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`Checking payment status for ID: ${id}`)

    // Check if the payment exists in Redis
    const payment = await redis.get(`payment:${id}`)
    console.log(`Payment data:`, payment)

    // Also check if the ikigai data exists
    const ikigaiData = await redis.get(`ikigai:${id}`)

    return NextResponse.json({
      id,
      paymentFound: !!payment,
      paymentDetails: payment,
      ikigaiDataExists: !!ikigaiData,
    })
  } catch (error) {
    console.error("Error checking payment:", error)
    return NextResponse.json(
      {
        error: "Failed to check payment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
