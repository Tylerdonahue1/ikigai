"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Phone, PhoneOff, Mic, MicOff, MessageCircle, Loader2, AlertCircle, Clock } from "lucide-react"

interface VoiceConversationProps {
  email: string
  onComplete: (data: any) => void
  onError: (error: string) => void
}

interface ConversationMessage {
  id: string
  timestamp: string
  role: "user" | "assistant"
  content: string
  functionCall?: any
}

export default function VoiceConversationInterface({ email, onComplete, onError }: VoiceConversationProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentCall, setCurrentCall] = useState<any>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [assistantId, setAssistantId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const callStartTime = useRef<number | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const webCallFrame = useRef<HTMLIFrameElement>(null)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // Initialize assistant on mount
  useEffect(() => {
    initializeAssistant()
  }, [])

  // Call duration timer
  useEffect(() => {
    if (isCallActive && callStartTime.current) {
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current!) / 1000))
      }, 1000)
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [isCallActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current)
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [])

  const initializeAssistant = async () => {
    try {
      // Check for existing assistant first
      const existingResponse = await fetch("/api/vapi/create-assistant", {
        method: "GET",
      })
      const existingData = await existingResponse.json()

      if (existingData.success && existingData.assistantId) {
        setAssistantId(existingData.assistantId)
        return
      }

      // Create new assistant if none exists
      const createResponse = await fetch("/api/vapi/create-assistant", {
        method: "POST",
      })
      const createData = await createResponse.json()

      if (createData.success) {
        setAssistantId(createData.assistantId)
      } else {
        throw new Error(createData.error || "Failed to create assistant")
      }
    } catch (error) {
      console.error("Error initializing assistant:", error)
      setError("Failed to initialize voice assistant")
      onError("Failed to initialize voice assistant")
    }
  }

  const startVoiceCall = async () => {
    if (!assistantId) {
      setError("Assistant not ready")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Create web call
      const callResponse = await fetch("/api/vapi/create-web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId,
          customer: { email },
          metadata: { surveyType: "ikigai" },
        }),
      })

      const callData = await callResponse.json()
      if (!callData.success) {
        throw new Error(callData.error || "Failed to create web call")
      }

      // Set up iframe for web call
      if (webCallFrame.current && callData.webCallUrl) {
        webCallFrame.current.src = callData.webCallUrl
        webCallFrame.current.style.display = "block"
      }

      setCurrentCall({ id: callData.callId, url: callData.webCallUrl })
      setIsCallActive(true)
      callStartTime.current = Date.now()

      // Add initial message
      addConversationMessage("assistant", "Voice conversation started. Please wait for Iki to begin speaking.")

      // Start polling for updates
      startPollingCallStatus(callData.callId)
    } catch (error) {
      console.error("Error starting call:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const endVoiceCall = async () => {
    if (!currentCall) return

    try {
      await fetch(`/api/vapi/end-call/${currentCall.id}`, {
        method: "POST",
      })

      setIsCallActive(false)
      callStartTime.current = null

      if (webCallFrame.current) {
        webCallFrame.current.style.display = "none"
        webCallFrame.current.src = ""
      }

      if (pollInterval.current) {
        clearInterval(pollInterval.current)
      }

      addConversationMessage("assistant", "Voice conversation ended.")
    } catch (error) {
      console.error("Error ending call:", error)
      setError("Failed to end call properly")
    }
  }

  const startPollingCallStatus = (callId: string) => {
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/vapi/get-call/${callId}`)
        const data = await response.json()

        if (!data.success) {
          console.error("Failed to get call status:", data.error)
          return
        }

        const call = data.call

        // Update conversation with new messages
        if (call.messages && call.messages.length > conversation.length) {
          const newMessages = call.messages.slice(conversation.length)
          newMessages.forEach((msg: any) => {
            addConversationMessage(msg.role, msg.content, msg.functionCall)
          })
        }

        // Update progress based on function calls
        if (call.functionCalls) {
          const totalExpectedCalls = 14 // Number of survey sections
          const completedCalls = call.functionCalls.filter((fc: any) => fc.name === "capture_survey_response").length
          setProgress((completedCalls / totalExpectedCalls) * 100)
        }

        // Check if call ended
        if (call.status === "ended") {
          if (pollInterval.current) {
            clearInterval(pollInterval.current)
          }
          setIsCallActive(false)

          // Process final data
          const surveyData = extractSurveyData(call.functionCalls || [])
          onComplete({
            email,
            surveyData,
            conversation,
            callId,
          })
        }
      } catch (error) {
        console.error("Error polling call status:", error)
      }
    }, 2000)

    // Clean up after 30 minutes
    setTimeout(
      () => {
        if (pollInterval.current) {
          clearInterval(pollInterval.current)
        }
      },
      30 * 60 * 1000,
    )
  }

  const extractSurveyData = (functionCalls: any[]) => {
    const surveyData: any = {}

    functionCalls
      .filter((fc) => fc.name === "capture_survey_response")
      .forEach((fc) => {
        const { questionType, response, extractedData } = fc.parameters
        surveyData[questionType] = extractedData || response
      })

    return surveyData
  }

  const addConversationMessage = (role: "user" | "assistant", content: string, metadata?: any) => {
    const message: ConversationMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      role,
      content,
      functionCall: metadata?.name ? metadata : undefined,
    }

    setConversation((prev) => [...prev, message])
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Call Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              {isCallActive ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span>Live Conversation</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  <span>Voice Conversation</span>
                </>
              )}
            </span>
            {isCallActive && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(callDuration)}</span>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCallActive ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Ready to start your voice conversation with Iki?</p>
              <Button
                onClick={startVoiceCall}
                disabled={isConnecting || !assistantId}
                className="bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Conversation
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Speaking with Iki</span>
                <span>Progress: {Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />

              <div className="flex space-x-2">
                <Button onClick={endVoiceCall} variant="destructive" className="flex-1">
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Conversation
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Log */}
      <Card className="h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversation</span>
            </span>
            <Badge variant="outline">{conversation.length} messages</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your conversation will appear here once started.</p>
                </div>
              ) : (
                conversation.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{message.role === "user" ? "You" : "Iki"}</span>
                        <span className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.functionCall && (
                        <div className="mt-2 text-xs opacity-70">Action: {message.functionCall.name}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Hidden iframe for VAPI web call */}
      <iframe
        ref={webCallFrame}
        style={{ display: "none" }}
        width="0"
        height="0"
        title="VAPI Voice Conversation"
        allow="microphone"
      />
    </div>
  )
}
