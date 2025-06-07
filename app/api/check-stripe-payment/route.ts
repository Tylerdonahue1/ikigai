import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET(request: Request) {
  try {
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })

    // Get the URL parameters
    const url = new URL(request.url)
    const paymentIntentId = url.searchParams.get("pi")
    const sessionId = url.searchParams.get("session")

    const result: any = { success: true }

    // If a payment intent ID is provided, get its details
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      result.paymentIntent = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        metadata: paymentIntent.metadata,
      }
    }

    // If a session ID is provided, get its details
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      result.session = {
        id: session.id,
        status: session.status,
        clientReferenceId: session.client_reference_id,
        paymentStatus: session.payment_status,
      }
    }

    // If no specific IDs are provided, list recent sessions
    if (!paymentIntentId && !sessionId) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 5,
      })

      result.recentSessions = sessions.data.map((session) => ({
        id: session.id,
        status: session.status,
        clientReferenceId: session.client_reference_id,
        paymentStatus: session.payment_status,
        created: new Date(session.created * 1000).toISOString(),
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking Stripe payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
