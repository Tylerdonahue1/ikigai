"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import EmailCollectionInterface from "@/components/email-collection-interface"
import VoiceConversationInterface from "@/components/voice-conversation-interface"

export default function VoiceConversationPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [existingData, setExistingData] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")

  const handleEmailSubmitted = async (email: string) => {
    setUserEmail(email)

    // If there's a session ID, load existing data
    if (sessionId) {
      try {
        const response = await fetch(`/api/voice-conversation/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setExistingData(data.collectedData)
        }
      } catch (error) {
        console.error("Error loading existing session:", error)
      }
    }
  }

  const handleComplete = async (data: any) => {
    try {
      // Process the collected data through the existing assessment API
      const response = await fetch("/api/process-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const { id } = await response.json()
        router.push(`/processing/${id}`)
      } else {
        throw new Error("Failed to submit assessment")
      }
    } catch (error) {
      console.error("Error submitting assessment:", error)
      alert("There was an error submitting your assessment. Please try again.")
    }
  }

  if (!userEmail) {
    return <EmailCollectionInterface onEmailSubmitted={handleEmailSubmitted} />
  }

  return (
    <VoiceConversationInterface
      userEmail={userEmail}
      onComplete={handleComplete}
      existingData={existingData}
      sessionId={sessionId}
    />
  )
}
