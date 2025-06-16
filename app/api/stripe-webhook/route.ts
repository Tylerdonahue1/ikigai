import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import Stripe from "stripe"

// Initialize Redis client
const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Add more detailed logging to help troubleshoot

export async function POST(request: Request) {
  try {
    console.log("Stripe webhook called at:", new Date().toISOString())

    const body = await request.text()
    const signature = request.headers.get("stripe-signature") as string

    console.log("Webhook signature:", signature ? "Present" : "Missing")

    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
      console.log("Webhook signature verified successfully")
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    console.log("Webhook event type:", event.type)
    console.log("Webhook event data:", JSON.stringify(event.data.object).substring(0, 200) + "...")

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Get the client_reference_id which should be your ikigai ID
      const ikigaiId = session.client_reference_id

      console.log("Checkout session completed:", session.id)
      console.log("Client reference ID:", ikigaiId)

      if (ikigaiId) {
        // Mark the payment as completed in Redis
        await redis.set(`payment:${ikigaiId}`, {
          paid: true,
          sessionId: session.id,
          timestamp: new Date().toISOString(),
        })

        console.log(`Payment completed for ikigai ID: ${ikigaiId}`)
      } else {
        console.error("No client_reference_id found in the session")
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        Allow: "POST, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, stripe-signature",
      },
    },
  )
}
