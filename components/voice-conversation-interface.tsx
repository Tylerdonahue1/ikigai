"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Phone, PhoneOff, MessageSquare, User, Bot, AlertCircle } from "lucide-react"

interface VoiceConversationInterfaceProps {
  userEmail: string
  onConversationEnd?: (data: any) => void
}

interface ConversationEntry {
  timestamp: Date
  type: "user" | "assistant" | "system" | "function"
  content: string
  functionName?: string
  functionArgs?: any
}

export default function VoiceConversationInterface({ userEmail, onConversationEnd }: VoiceConversationInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<string>("idle")
  const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([])
  const [surveyProgress, setSurveyProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState("")
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [callId, setCallId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const callStartTime = useRef<Date | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Auto-start the conversation when component mounts
    startVoiceConversation()

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [])

  const addToConversationLog = (
    type: ConversationEntry["type"],
    content: string,
    functionName?: string,
    functionArgs?: any,
  ) => {
    setConversationLog((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        type,
        content,
        functionName,
        functionArgs,
      },
    ])
  }

  const startCallDurationTimer = () => {
    callStartTime.current = new Date()
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTime.current.getTime()) / 1000)
        setCallDuration(duration)
      }
    }, 1000)
  }

  const stopCallDurationTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current)
      durationInterval.current = null
    }
    callStartTime.current = null
  }

  const startVoiceConversation = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Create web call through secure API
      const response = await fetch("/api/vapi/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: "your-assistant-id", // This would come from setup
          metadata: {
            userEmail,
            surveyType: "ikigai_comprehensive",
            startTime: new Date().toISOString(),
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCallId(data.call.id)
        setIsCallActive(true)
        setCallStatus("connected")
        startCallDurationTimer()
        addToConversationLog("system", "Connected to Iki. Voice conversation started.")
        addToConversationLog(
          "assistant",
          "Hello I'm Iki, here to help you leverage the Ikigai framework for discovering meaningful work.",
        )
      } else {
        setError(data.error || "Failed to start voice conversation")
      }
    } catch (error) {
      console.error("Error starting voice conversation:", error)
      setError("Failed to connect to voice service")
    } finally {
      setIsConnecting(false)
    }
  }

  const endVoiceConversation = async () => {
    if (!callId) return

    try {
      const response = await fetch(`/api/vapi/end-call/${callId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsCallActive(false)
        setCallStatus("ended")
        stopCallDurationTimer()
        addToConversationLog("system", "Voice conversation ended")

        // Get final call data
        const callDataResponse = await fetch(`/api/vapi/get-call/${callId}`)
        if (callDataResponse.ok) {
          const callData = await callDataResponse.json()
          if (onConversationEnd) {
            onConversationEnd(callData.call)
          }
        }
      }
    } catch (error) {
      console.error("Error ending voice conversation:", error)
      addToConversationLog("system", "Error ending conversation")
    }

    setCallId(null)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getTypeIcon = (type: ConversationEntry["type"]) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />
      case "assistant":
        return <Bot className="w-4 h-4" />
      case "function":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: ConversationEntry["type"]) => {
    switch (type) {
      case "user":
        return "bg-blue-100 border-blue-200"
      case "assistant":
        return "bg-gray-100 border-gray-200"
      case "function":
        return "bg-green-100 border-green-200"
      default:
        return "bg-yellow-100 border-yellow-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice Conversation with Iki</h1>
          <p className="text-gray-600">Speak naturally about your interests, strengths, and aspirations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls & Status */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {isCallActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  <span>Voice Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnecting ? (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-700">Connecting...</span>
                  </div>
                ) : isCallActive ? (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">Connected to Iki</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700">Disconnected</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="font-medium">{formatDuration(callDuration)}</div>
                    <div className="text-gray-600">Duration</div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="font-medium">{callStatus}</div>
                    <div className="text-gray-600">Status</div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isCallActive ? (
                  <Button onClick={endVoiceConversation} variant="destructive" className="w-full">
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Conversation
                  </Button>
                ) : (
                  <Button onClick={startVoiceConversation} disabled={isConnecting} className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    {isConnecting ? "Connecting..." : "Restart Conversation"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Survey Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Survey Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{surveyProgress}%</span>
                  </div>
                  <Progress value={surveyProgress} className="w-full" />
                </div>

                {currentSection && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Current Section:</strong> {currentSection}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded text-center">
                    <div className="font-medium">14 Sections Total</div>
                    <div className="text-gray-600">Comprehensive Ikigai Survey</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Session Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Survey Type:</span>
                    <span className="font-medium">Ikigai Discovery</span>
                  </div>
                  {callId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Call ID:</span>
                      <span className="font-mono text-xs">{callId.slice(0, 8)}...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Conversation Log */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Live Conversation Log</span>
                  <Badge variant="outline">{conversationLog.length} entries</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-3 pr-2">
                  {conversationLog.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Conversation will appear here</p>
                        <p className="text-sm">Start speaking with Iki to see the live log</p>
                      </div>
                    </div>
                  ) : (
                    conversationLog.map((entry, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${getTypeColor(entry.type)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(entry.type)}
                            <span className="font-medium text-sm capitalize">
                              {entry.type === "assistant" ? "Iki" : entry.type}
                            </span>
                            {entry.functionName && (
                              <Badge variant="outline" className="text-xs">
                                {entry.functionName}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{formatTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{entry.content}</p>
                        {entry.functionArgs && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(entry.functionArgs, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Conversation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">🎤 Speaking</h4>
                <p className="text-gray-600">
                  Speak clearly and naturally. Iki will wait for you to finish before responding.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-2">⏱️ Pacing</h4>
                <p className="text-gray-600">
                  Take your time to think. The survey covers 14 sections and typically takes 30-40 minutes.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">💭 Responses</h4>
                <p className="text-gray-600">
                  Be honest and detailed. Your responses help create a more accurate Ikigai analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
