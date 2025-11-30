"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestPaymentPage() {
  const [ikigaiId, setIkigaiId] = useState("hnKGvHJYpe")
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/check-payment/${ikigaiId}`)
      const data = await response.json()
      setPaymentStatus(data)
    } catch (error) {
      console.error("Error checking payment:", error)
      setPaymentStatus({ error: "Failed to check payment" })
    }
    setLoading(false)
  }

  const markAsPaid = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/mark-paid?id=${ikigaiId}`)
      const data = await response.json()
      setPaymentStatus(data)
    } catch (error) {
      console.error("Error marking as paid:", error)
      setPaymentStatus({ error: "Failed to mark as paid" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#3D405B] mb-8">Test Payment Flow</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ikigai Assessment ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input value={ikigaiId} onChange={(e) => setIkigaiId(e.target.value)} placeholder="Enter Ikigai ID" />
              <Button onClick={checkPayment} disabled={loading}>
                Check Payment
              </Button>
            </div>

            <div className="flex gap-4">
              <Button onClick={markAsPaid} disabled={loading} className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white">
                Mark as Paid
              </Button>

              <Button asChild variant="outline" disabled={!ikigaiId}>
                <a href={`/ikigai/${ikigaiId}`} target="_blank" rel="noopener noreferrer">
                  View Report
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {paymentStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(paymentStatus, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-serif font-bold text-[#3D405B] mb-4">Stripe Payment Link</h2>
          <p className="mb-4">Use this link to test a real Stripe payment (includes the client_reference_id):</p>
          <Card>
            <CardContent className="p-4">
              <code className="break-all">
                https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id={ikigaiId}
              </code>
            </CardContent>
          </Card>
          <Button asChild className="mt-4 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white">
            <a
              href={`https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id=${ikigaiId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Test Real Payment
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
