"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProcessingPageProps {
  params: {
    id: string
  }
}

export default function ProcessingPage({ params }: ProcessingPageProps) {
  const { id } = params
  const router = useRouter()
  const [status, setStatus] = useState("processing")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/check-processing-status?id=${id}`)
        const data = await response.json()

        if (data.hasResults) {
          // Analysis is complete, redirect to preview
          router.push(`/ikigai/${id}/preview`)
        } else if (data.status === "error") {
          setStatus("error")
        } else {
          // Still processing, check again in a few seconds
          setTimeout(checkStatus, 3000)
        }
      } catch (error) {
        console.error("Error checking status:", error)
        setTimeout(checkStatus, 5000) // Retry after longer delay on error
      }
    }

    // Start checking status
    checkStatus()

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev // Don't go to 100% until actually complete
        return prev + Math.random() * 10
      })
    }, 1000)

    return () => {
      clearInterval(progressInterval)
    }
  }, [id, router])

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Error</h2>
            <p className="text-gray-600 mb-4">There was an issue processing your assessment. Please try again.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Start Over
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 mx-auto text-orange-500 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Ikigai</h2>

          <p className="text-gray-600 mb-6">
            Our AI is carefully analyzing your responses to create your personalized Ikigai report. This usually takes
            1-2 minutes.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 90)}%` }}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <p>✓ Processing your interests and passions</p>
            <p>✓ Analyzing your skills and abilities</p>
            <p>✓ Identifying your potential impact</p>
            <p className={progress > 60 ? "text-orange-600 font-medium" : ""}>
              {progress > 60 ? "✓" : "○"} Generating personalized insights
            </p>
            <p className={progress > 80 ? "text-orange-600 font-medium" : ""}>
              {progress > 80 ? "✓" : "○"} Finding your role models
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
