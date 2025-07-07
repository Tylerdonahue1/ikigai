"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import InterfaceSelector from "@/components/interface-selector"
import ConversationInterface from "@/components/conversation-interface"

export default function ConversationPage() {
  const [selectedMode, setSelectedMode] = useState<"chat" | "voice" | null>(null)
  const router = useRouter()

  const handleModeSelect = (mode: "chat" | "voice") => {
    setSelectedMode(mode)
  }

  const handleComplete = async (collectedData: any) => {
    try {
      // Process the collected data through the existing assessment API
      const response = await fetch("/api/process-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectedData),
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

  if (!selectedMode) {
    return <InterfaceSelector onSelect={handleModeSelect} />
  }

  return <ConversationInterface mode={selectedMode} onComplete={handleComplete} />
}
