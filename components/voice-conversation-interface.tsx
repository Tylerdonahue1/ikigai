"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Phone, PhoneOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface VoiceConversationInterfaceProps {
  email: string
  onComplete: (data: any) => void
  onError: (error: string) => void
}

export default function VoiceConversationInterface({ email, onComplete, onError }: VoiceConversationInterfaceProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)
  const [webCallUrl, setWebCallUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended">("idle")

  const startVoiceCall = async () => {
    setIsConnecting(true)
    setError(null)
    setCallStatus("connecting")

    try {
      console.log("Starting voice call for email:", email)

      const response = await fetch("/api/vapi/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerEmail: email,
          metadata: {
            source: "ikigai-assessment",
            userEmail: email,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create voice call")
      }

      console.log("Voice call created:", data)

      setCallId(data.callId)
      setWebCallUrl(data.webCallUrl)
      setIsConnected(true)
      setCallStatus("connected")

      // If there's a web call URL, you might want to open it or embed it
      if (data.webCallUrl) {
        console.log("Web call URL:", data.webCallUrl)
        // You could open this in a new window or embed it
        // window.open(data.webCallUrl, '_blank');
      }
    } catch (error) {
      console.error("Failed to start voice call:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to start voice call"
      setError(errorMessage)
      onError(errorMessage)
      setCallStatus("idle")
    } finally {
      setIsConnecting(false)
    }
  }

  const endVoiceCall = async () => {
    if (!callId) return

    try {
      console.log("Ending voice call:", callId)

      const response = await fetch(`/api/vapi/end-call/${callId}`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setIsConnected(false)
        setCallStatus("ended")
        onComplete({ callId, email })
      }
    } catch (error) {
      console.error("Failed to end voice call:", error)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Assessment</span>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {callStatus === "connecting" && "Connecting..."}
            {callStatus === "connected" && "Connected"}
            {callStatus === "ended" && "Completed"}
            {callStatus === "idle" && "Ready"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {isConnecting ? (
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            ) : isConnected ? (
              <Mic className="w-10 h-10 text-purple-600" />
            ) : (
              <MicOff className="w-10 h-10 text-gray-400" />
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {callStatus === "idle" && "Ready to Start"}
            {callStatus === "connecting" && "Connecting to Iki..."}
            {callStatus === "connected" && "Speaking with Iki"}
            {callStatus === "ended" && "Assessment Complete"}
          </h3>

          <p className="text-gray-600 text-sm mb-4">
            {callStatus === "idle" &&
              "Click the button below to start your voice conversation with Iki, your Ikigai guide."}
            {callStatus === "connecting" && "Please wait while we connect you to your personal Ikigai assistant."}
            {callStatus === "connected" &&
              "You're now connected! Speak naturally with Iki about your interests, skills, and aspirations."}
            {callStatus === "ended" && "Thank you for completing your Ikigai assessment!"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {webCallUrl && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Voice call created successfully!</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(webCallUrl, "_blank")}
                  className="w-full"
                >
                  Open Voice Interface
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          {!isConnected ? (
            <Button
              onClick={startVoiceCall}
              disabled={isConnecting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Start Voice Chat
                </>
              )}
            </Button>
          ) : (
            <Button onClick={endVoiceCall} variant="destructive" className="flex-1">
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          )}
        </div>

        {callId && <div className="text-xs text-gray-500 text-center">Call ID: {callId.substring(0, 8)}...</div>}
      </CardContent>
    </Card>
  )
}
