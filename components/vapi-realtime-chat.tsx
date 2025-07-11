"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageCircle,
  Bot,
  User,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { getVAPIWebClient, type VAPIWebClient, IKIGAI_ASSISTANT_ID } from "@/lib/vapi-web-client"

interface VAPIRealtimeChatProps {
  email: string
  onComplete: (data: any) => void
  onError: (error: string) => void
}

interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export default function VAPIRealtimeChat({ email, onComplete, onError }: VAPIRealtimeChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [callDuration, setCallDuration] = useState(0)

  const vapiClientRef = useRef<VAPIWebClient | null>(null)
  const callStartTimeRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Initialize VAPI client
  useEffect(() => {
    initializeVAPIClient()
    return () => {
      cleanup()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const initializeVAPIClient = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Initializing VAPI Web Client...")
      vapiClientRef.current = getVAPIWebClient()

      await vapiClientRef.current.initialize()
      setupEventListeners()

      setIsConnected(true)
      addSystemMessage("Connected to Iki. Click 'Start Call' to begin your Ikigai assessment.")
    } catch (error) {
      console.error("Failed to initialize VAPI client:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize voice chat"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const setupEventListeners = useCallback(() => {
    if (!vapiClientRef.current) return

    const vapi = vapiClientRef.current

    // Call started
    vapi.on("call-start", () => {
      console.log("Call started")
      setIsCallActive(true)
      setError(null)
      callStartTimeRef.current = Date.now()
      startDurationTimer()
      addSystemMessage("Call started. Iki is ready to talk!")
    })

    // Call ended
    vapi.on("call-end", () => {
      console.log("Call ended")
      setIsCallActive(false)
      setIsMuted(false)
      stopDurationTimer()
      addSystemMessage("Call ended. Thank you for your conversation with Iki!")

      // Check if we should complete the assessment
      setTimeout(() => {
        onComplete({
          messages,
          email,
          callDuration,
          timestamp: Date.now(),
        })
      }, 2000)
    })

    // Speech events
    vapi.on("speech-start", () => {
      console.log("User started speaking")
      addSystemMessage("🎤 You're speaking...")
    })

    vapi.on("speech-end", () => {
      console.log("User stopped speaking")
    })

    // Message from assistant
    vapi.on("message", (message: any) => {
      console.log("Message received:", message)

      if (message.type === "transcript" && message.transcript) {
        if (message.transcript.role === "user") {
          addMessage("user", message.transcript.content)
        } else if (message.transcript.role === "assistant") {
          addMessage("assistant", message.transcript.content)
        }
      }

      if (message.type === "function-call") {
        console.log("Function call received:", message)
        // Handle function calls if needed
      }
    })

    // Volume level updates
    vapi.on("volume-level", (volume: number) => {
      setVolumeLevel(volume)
    })

    // Error handling
    vapi.on("error", (error: any) => {
      console.error("VAPI Error:", error)
      const errorMessage = error.message || error.error?.message || "An error occurred during the call"
      setError(errorMessage)
      addSystemMessage(`❌ Error: ${errorMessage}`)
    })
  }, [messages, email, callDuration, onComplete])

  const startCall = async () => {
    if (!vapiClientRef.current) {
      setError("VAPI client not initialized")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("Starting call with assistant:", IKIGAI_ASSISTANT_ID)

      // Call configuration with metadata - pass as second parameter to start()
      const callConfig = {
        metadata: {
          customerEmail: email,
          sessionType: "ikigai-assessment",
          timestamp: new Date().toISOString(),
        },
      }

      // Pass assistant ID as first parameter, config as second
      await vapiClientRef.current.startCall(callConfig)
    } catch (error) {
      console.error("Failed to start call:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to start call"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const endCall = async () => {
    if (!vapiClientRef.current) return

    try {
      setIsLoading(true)
      await vapiClientRef.current.endCall()
    } catch (error) {
      console.error("Failed to end call:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to end call"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMute = () => {
    if (!vapiClientRef.current) return

    const newMutedState = !isMuted
    vapiClientRef.current.setMuted(newMutedState)
    setIsMuted(newMutedState)
    addSystemMessage(newMutedState ? "🔇 Microphone muted" : "🎤 Microphone unmuted")
  }

  const addMessage = (type: "user" | "assistant", content: string) => {
    const message: ChatMessage = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, message])
  }

  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: `system-${Date.now()}-${Math.random()}`,
      type: "system",
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, message])
  }

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
      }
    }, 1000)
  }

  const stopDurationTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }

  const cleanup = () => {
    stopDurationTimer()
    if (vapiClientRef.current && isCallActive) {
      vapiClientRef.current.endCall().catch(console.error)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="max-w-4xl mx-auto h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Voice Chat with Iki</span>
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Connecting..."}</Badge>
            {isCallActive && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {formatDuration(callDuration)}
              </Badge>
            )}
            <Badge variant="outline">{messages.length} messages</Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Call Controls */}
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              disabled={!isConnected || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              size="lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Phone className="w-5 h-5 mr-2" />}
              Start Call
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Button onClick={toggleMute} variant={isMuted ? "destructive" : "outline"} size="lg">
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Volume indicator */}
              <div className="flex items-center space-x-2">
                {volumeLevel > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
                  />
                </div>
              </div>

              <Button onClick={endCall} variant="destructive" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PhoneOff className="w-5 h-5 mr-2" />}
                End Call
              </Button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && !isLoading ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Ready to start your voice conversation with Iki</p>
                <p className="text-sm mt-2">Click "Start Call" to begin your Ikigai assessment</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === "user"
                        ? "bg-purple-600 text-white"
                        : message.type === "assistant"
                          ? "bg-gray-100 text-gray-900 border border-gray-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.type === "user" ? (
                        <User className="w-4 h-4" />
                      ) : message.type === "assistant" ? (
                        <Bot className="w-4 h-4 text-purple-600" />
                      ) : (
                        <MessageCircle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {message.type === "user" ? "You" : message.type === "assistant" ? "Iki" : "System"}
                      </span>
                      <span className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Info */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Assistant ID: {IKIGAI_ASSISTANT_ID}</p>
          <p>Email: {email}</p>
          {isCallActive && <p>🔴 Live conversation in progress</p>}
        </div>
      </CardContent>
    </Card>
  )
}
