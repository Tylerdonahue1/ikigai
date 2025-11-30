"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ProcessingPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [status, setStatus] = useState<"checking" | "ready" | "not-found">("checking")
  const [attempts, setAttempts] = useState(0)
  const [countdown, setCountdown] = useState(45)

  // Check if the assessment data exists
  const checkAssessment = async () => {
    try {
      const response = await fetch(`/api/test-data/${id}`)
      const data = await response.json()

      if (data.success && data.dataExists) {
        setStatus("ready")
        // Redirect to preview page
        router.push(`/ikigai/${id}/preview`)
      } else {
        setStatus("checking")
        setAttempts((prev) => prev + 1)

        // If we've tried 15 times (45 seconds at 3-second intervals), stop checking
        if (attempts >= 15) {
          setStatus("not-found")
        }
      }
    } catch (error) {
      console.error("Error checking assessment:", error)
      setStatus("checking")
      setAttempts((prev) => prev + 1)
    }
  }

  // Check every 3 seconds
  useEffect(() => {
    if (status === "checking" && attempts < 15) {
      const timer = setTimeout(() => {
        checkAssessment()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [status, attempts])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl  font-bold text-[#3D405B] mb-8">Processing Your Ikigai Assessment</h1>

        {status === "checking" && (
          <>
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-[#E07A5F] h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, (attempts / 15) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xl text-[#3D405B] ">Please wait while we prepare your assessment...</p>
              <p className="text-lg text-[#3D405B]  mt-2">Estimated time remaining: {countdown} seconds</p>
            </div>

            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#E07A5F] animate-bounce"></div>
              <div
                className="w-3 h-3 rounded-full bg-[#E07A5F] animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 rounded-full bg-[#E07A5F] animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </>
        )}

        {status === "ready" && (
          <p className="text-xl text-[#3D405B] ">Your assessment is ready! Redirecting you now...</p>
        )}

        {status === "not-found" && (
          <>
            <p className="text-xl text-[#3D405B]  mb-8">
              We're still processing your assessment. This is taking longer than expected.
            </p>

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-center">
              <Button
                onClick={() => {
                  setStatus("checking")
                  setAttempts(0)
                  setCountdown(45)
                  checkAssessment()
                }}
                className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
              >
                Check Again
              </Button>

              <Button onClick={() => router.push("/")} variant="outline">
                Return Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
