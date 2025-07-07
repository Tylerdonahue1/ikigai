"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Mic, Phone, PhoneOff, User, MessageSquare, CheckCircle, Loader2 } from "lucide-react"

interface VoiceBotHomepageProps {
  onEmailSubmit?: (email: string) => void
}

export default function VoiceBotHomepage({ onEmailSubmit }: VoiceBotHomepageProps) {
  const [email, setEmail] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<string>("idle")
  const [conversationLog, setConversationLog] = useState<
    Array<{
      timestamp: Date
      type: "user" | "assistant" | "system"
      content: string
    }>
  >([])
  const [surveyProgress, setSurveyProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [callId, setCallId] = useState<string | null>(null)

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(emailRegex.test(email))
  }, [email])

  const addToConversationLog = (type: "user" | "assistant" | "system", content: string) => {
    setConversationLog((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        type,
        content,
      },
    ])
  }

  const startVoiceConversation = async () => {
    if (!isEmailValid) return

    setIsLoading(true)
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
            userEmail: email,
            surveyType: "ikigai_comprehensive",
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCallId(data.call.id)
        setIsCallActive(true)
        setCallStatus("connecting")
        addToConversationLog("system", "Starting voice conversation with Iki...")

        if (onEmailSubmit) {
          onEmailSubmit(email)
        }
      } else {
        setError(data.error || "Failed to start voice conversation")
      }
    } catch (error) {
      console.error("Error starting voice conversation:", error)
      setError("Failed to start voice conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const endVoiceConversation = async () => {
    if (!callId) return

    try {
      await fetch(`/api/vapi/end-call/${callId}`, {
        method: "DELETE",
      })

      setIsCallActive(false)
      setCallStatus("ended")
      setCallId(null)
      addToConversationLog("system", "Voice conversation ended")
    } catch (error) {
      console.error("Error ending voice conversation:", error)
      addToConversationLog("system", "Error ending conversation")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Ikigai with Iki</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a natural voice conversation with Iki, your AI guide, to explore the intersection of what you love,
            what you're good at, what the world needs, and what you can be paid for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Email & Voice Controls */}
          <div className="space-y-6">
            {/* Email Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Get Started</span>
                </CardTitle>
                <CardDescription>Enter your email to begin your Ikigai discovery journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isCallActive}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={startVoiceConversation}
                  disabled={!isEmailValid || isCallActive || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : isCallActive ? (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Active
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Start Voice Survey
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Voice Controls */}
            {isCallActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Voice Conversation</span>
                    <Badge variant="default">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">Connected to Iki</span>
                    </div>
                    <Badge variant="outline">{callStatus}</Badge>
                  </div>

                  <Button onClick={endVoiceConversation} variant="destructive" className="w-full">
                    <PhoneOff className="w-4 h-4 mr-2" />
                    End Conversation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Survey Progress */}
            {isCallActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Survey Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{surveyProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${surveyProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {currentSection && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Current Section:</strong> {currentSection}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <div className="font-medium">14 Sections</div>
                      <div className="text-gray-600">Comprehensive Survey</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-center">
                      <div className="font-medium">~30-40 min</div>
                      <div className="text-gray-600">Estimated Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Conversation Log */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversation Log</span>
                </CardTitle>
                <CardDescription>Real-time log of your conversation with Iki</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto space-y-3 pr-2">
                  {conversationLog.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Your conversation will appear here</p>
                        <p className="text-sm">Start by entering your email and clicking "Start Voice Survey"</p>
                      </div>
                    </div>
                  ) : (
                    conversationLog.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          entry.type === "user"
                            ? "bg-blue-100 ml-8"
                            : entry.type === "assistant"
                              ? "bg-gray-100 mr-8"
                              : "bg-yellow-50 text-center"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-medium text-sm">
                            {entry.type === "user" ? "You" : entry.type === "assistant" ? "Iki" : "System"}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm">{entry.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How the Voice Survey Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">1. Enter Email</h3>
                <p className="text-sm text-gray-600">Provide your email to get started and receive your results</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">2. Voice Conversation</h3>
                <p className="text-sm text-gray-600">Speak naturally with Iki through 14 comprehensive sections</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">3. Real-time Logging</h3>
                <p className="text-sm text-gray-600">Watch your responses being captured in real-time</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-medium mb-2">4. Get Results</h3>
                <p className="text-sm text-gray-600">Receive your personalized Ikigai analysis and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
