"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  MessageCircle,
  User,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Clock,
  Settings,
  Key,
  ExternalLink,
} from "lucide-react"

interface ConversationMessage {
  id: string
  timestamp: string
  role: "user" | "assistant"
  content: string
  functionCall?: any
  metadata?: any
}

interface SurveyData {
  firstName?: string
  lastName?: string
  email?: string
  primaryReason?: string
  activities?: string[]
  activityRatings?: Record<string, number>
  strengthStatements?: string[]
  currentWork?: string
  futureWorkPreferences?: string[]
  threeYearVision?: string
  causes?: string[]
  coreValues?: string[]
  [key: string]: any
}

const SURVEY_SECTIONS = [
  { key: "personal_info", label: "Personal Information", questions: 3 },
  { key: "core_motivation", label: "Core Motivation", questions: 1 },
  { key: "activities_interests", label: "Activities & Interests", questions: 3 },
  { key: "strengths_identity", label: "Strengths & Identity", questions: 3 },
  { key: "current_work", label: "Current Work", questions: 1 },
  { key: "future_work", label: "Future Work Preferences", questions: 1 },
  { key: "vision_dreams", label: "Vision & Dreams", questions: 2 },
  { key: "causes_values", label: "Causes & Values", questions: 2 },
  { key: "daily_energy", label: "Daily Life & Energy", questions: 3 },
  { key: "social_recognition", label: "Social Recognition", questions: 1 },
  { key: "core_values", label: "Core Values", questions: 1 },
  { key: "career_priorities", label: "Career Priorities", questions: 1 },
  { key: "skill_development", label: "Skill Development", questions: 1 },
  { key: "additional_info", label: "Additional Information", questions: 1 },
]

export default function VoiceBotHomepage() {
  // State management
  const [email, setEmail] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentCall, setCurrentCall] = useState<any>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [surveyData, setSurveyData] = useState<SurveyData>({})
  const [currentSection, setCurrentSection] = useState("personal_info")
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [surveyProgress, setSurveyProgress] = useState(0)
  const [assistantId, setAssistantId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "failed" | "not_configured" | "auth_error"
  >("testing")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)

  // Refs
  const callStartTime = useRef<number | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const webCallFrame = useRef<HTMLIFrameElement>(null)
  const pollInterval = useRef<NodeJS.Timeout | null>(null)

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(emailRegex.test(email))
  }, [email])

  // Initialize assistant on component mount
  useEffect(() => {
    testConnectionAndInitialize()
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

  // Update progress based on completed sections
  useEffect(() => {
    const progress = (completedSections.size / SURVEY_SECTIONS.length) * 100
    setSurveyProgress(progress)
  }, [completedSections])

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

  const testConnectionAndInitialize = async () => {
    try {
      setIsInitializing(true)
      setConnectionStatus("testing")
      setError(null)

      // First test the VAPI connection
      const testResponse = await fetch("/api/vapi/test-connection")
      const testData = await testResponse.json()

      setConnectionDetails(testData)

      if (!testData.success) {
        if (!testData.configured) {
          setConnectionStatus("not_configured")
          setError("VAPI API key is not configured. Please contact support.")
        } else if (testData.isAuthError) {
          setConnectionStatus("auth_error")
          setError(testData.error)
        } else {
          setConnectionStatus("failed")
          setError(`VAPI connection failed: ${testData.error}`)
        }
        return
      }

      setConnectionStatus("connected")

      // Now initialize the assistant
      await initializeAssistant()
    } catch (error) {
      console.error("Error testing connection:", error)
      setConnectionStatus("failed")
      setError("Failed to connect to voice service. Please try again.")
    } finally {
      setIsInitializing(false)
    }
  }

  const initializeAssistant = async () => {
    try {
      // Check if we have a cached assistant ID
      const cachedAssistantId = localStorage.getItem("ikigai-assistant-id")
      if (cachedAssistantId) {
        setAssistantId(cachedAssistantId)
        return
      }

      // Check for existing assistant
      const existingResponse = await fetch("/api/vapi/create-assistant", {
        method: "GET",
      })
      const existingData = await existingResponse.json()

      if (existingData.success && existingData.assistantId) {
        setAssistantId(existingData.assistantId)
        localStorage.setItem("ikigai-assistant-id", existingData.assistantId)
        return
      }

      // Create new assistant if none exists
      const createResponse = await fetch("/api/vapi/create-assistant", {
        method: "POST",
      })
      const createData = await createResponse.json()

      if (createData.success) {
        setAssistantId(createData.assistantId)
        localStorage.setItem("ikigai-assistant-id", createData.assistantId)
      } else {
        console.error("Failed to create assistant:", createData.error)
        if (createData.isAuthError) {
          setConnectionStatus("auth_error")
          setError(`Authentication error: ${createData.error}`)
        } else {
          setError("Failed to initialize voice assistant. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error initializing assistant:", error)
      setError("Failed to initialize voice assistant. Please refresh the page.")
    }
  }

  const startVoiceCall = async () => {
    if (!isEmailValid || !assistantId) return

    setIsConnecting(true)
    setError(null)

    try {
      // Create web call with proper assistant ID
      const callResponse = await fetch("/api/vapi/create-web-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId,
          customer: {
            email,
            name: surveyData.firstName || "User",
          },
          metadata: {
            surveyType: "ikigai",
            existingData: surveyData,
          },
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

      // Add initial conversation message
      addConversationMessage("assistant", "Voice survey started. Iki will begin speaking with you shortly.")

      // Start polling for call updates
      startPollingCallStatus(callData.callId)

      // Set up message listeners for real-time updates
      setupMessageListeners()
    } catch (error) {
      console.error("Error starting call:", error)
      setError(`Failed to start voice call: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const endVoiceCall = async () => {
    if (!currentCall) return

    try {
      const response = await fetch(`/api/vapi/end-call/${currentCall.id}`, {
        method: "POST",
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to end call")
      }

      setIsCallActive(false)
      callStartTime.current = null

      if (webCallFrame.current) {
        webCallFrame.current.style.display = "none"
        webCallFrame.current.src = ""
      }

      if (pollInterval.current) {
        clearInterval(pollInterval.current)
      }

      addConversationMessage("assistant", "Voice survey ended. Processing your responses...")

      // Process the final survey data
      await processFinalData()
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

        // Handle function calls (data capture)
        if (call.functionCalls) {
          processFunctionCalls(call.functionCalls)
        }

        // Get survey progress
        const progressResponse = await fetch(`/api/vapi/survey-progress/${callId}`)
        const progressData = await progressResponse.json()

        if (progressData.success) {
          const progress = progressData.progress
          setCurrentSection(progress.currentSection)
          setCompletedSections(new Set(progress.completedSections))
        }

        // Check if call ended
        if (call.status === "ended") {
          if (pollInterval.current) {
            clearInterval(pollInterval.current)
          }
          setIsCallActive(false)
          await processFinalData()
        }
      } catch (error) {
        console.error("Error polling call status:", error)
      }
    }, 2000)

    // Clean up after 40 minutes
    setTimeout(
      () => {
        if (pollInterval.current) {
          clearInterval(pollInterval.current)
        }
      },
      40 * 60 * 1000,
    )
  }

  const setupMessageListeners = () => {
    // Listen for VAPI events if using web SDK
    if (typeof window !== "undefined" && (window as any).vapi) {
      const vapi = (window as any).vapi

      vapi.on("speech-start", () => {
        addConversationMessage("user", "[Speaking...]")
      })

      vapi.on("speech-end", (data: any) => {
        if (data.transcript) {
          // Replace the "[Speaking...]" message with actual transcript
          setConversation((prev) => {
            const updated = [...prev]
            const lastMessage = updated[updated.length - 1]
            if (lastMessage && lastMessage.content === "[Speaking...]") {
              lastMessage.content = data.transcript
            }
            return updated
          })
        }
      })

      vapi.on("function-call", (data: any) => {
        processFunctionCalls([data])
      })
    }
  }

  const processFunctionCalls = (functionCalls: any[]) => {
    functionCalls.forEach((call) => {
      if (call.name === "capture_survey_response") {
        const { section, questionType, response, extractedData } = call.parameters

        // Update survey data
        setSurveyData((prev) => ({
          ...prev,
          [questionType]: extractedData.selectedOptions || extractedData.values || response,
          [`${questionType}_details`]: extractedData.details,
          [`${questionType}_ratings`]: extractedData.ratings,
        }))

        // Update current section and completed sections
        setCurrentSection(section)
        setCompletedSections((prev) => new Set([...prev, section]))

        // Add to conversation log
        addConversationMessage("assistant", `✓ Captured: ${questionType}`, call)
      } else if (call.name === "navigate_survey") {
        const { action, nextSection } = call.parameters

        if (action === "complete_survey") {
          setIsComplete(true)
        } else if (nextSection) {
          setCurrentSection(nextSection)
        }
      } else if (call.name === "validate_rating_response") {
        const { question, extractedRating, isValid, needsClarification } = call.parameters

        if (!isValid && needsClarification) {
          addConversationMessage("assistant", `Please provide a rating from 1 to 5 for: ${question}`)
        }
      }
    })
  }

  const processFinalData = async () => {
    try {
      // Send collected data to backend for processing
      const response = await fetch("/api/process-voice-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          surveyData,
          conversation,
          callId: currentCall?.id,
        }),
      })

      if (response.ok) {
        const { assessmentId } = await response.json()
        // Redirect to processing page
        window.location.href = `/processing/${assessmentId}`
      } else {
        throw new Error("Failed to process survey data")
      }
    } catch (error) {
      console.error("Error processing final data:", error)
      setError("Failed to process your survey. Please try again.")
    }
  }

  const addConversationMessage = (role: "user" | "assistant", content: string, metadata?: any) => {
    const message: ConversationMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      role,
      content,
      functionCall: metadata?.name ? metadata : undefined,
      metadata,
    }

    setConversation((prev) => [...prev, message])
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const retryConnection = () => {
    setError(null)
    setIsCallActive(false)
    setCurrentCall(null)
    if (webCallFrame.current) {
      webCallFrame.current.style.display = "none"
      webCallFrame.current.src = ""
    }
    if (pollInterval.current) {
      clearInterval(pollInterval.current)
    }
    // Clear cached assistant ID and reinitialize
    localStorage.removeItem("ikigai-assistant-id")
    setAssistantId(null)
    testConnectionAndInitialize()
  }

  const getCurrentSectionInfo = () => {
    return SURVEY_SECTIONS.find((section) => section.key === currentSection) || SURVEY_SECTIONS[0]
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      case "not_configured":
        return "text-orange-500"
      case "auth_error":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "testing":
        return "Testing Connection..."
      case "connected":
        return "Connected"
      case "failed":
        return "Connection Failed"
      case "not_configured":
        return "Not Configured"
      case "auth_error":
        return "Authentication Error"
      default:
        return "Unknown"
    }
  }

  const renderAuthErrorHelp = () => {
    if (connectionStatus !== "auth_error" || !connectionDetails) return null

    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Key className="w-5 h-5" />
            <span>API Key Configuration Issue</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-red-600">
            <p className="font-medium mb-2">The VAPI API key appears to be the wrong type:</p>
            <p>{error}</p>
          </div>

          {connectionDetails.keyFormat && (
            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-medium text-gray-700 mb-2">Current Key Analysis:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Length: {connectionDetails.keyFormat.length} characters</li>
                <li>• Prefix: {connectionDetails.keyFormat.prefix}...</li>
                <li>• Starts with 'sk-': {connectionDetails.keyFormat.startsWithSk ? "Yes" : "No"}</li>
                <li>• Starts with 'pk-': {connectionDetails.keyFormat.startsWithPk ? "Yes" : "No"}</li>
              </ul>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-2">How to Fix:</p>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>Go to your VAPI dashboard</li>
              <li>Check if you need a private key (sk-) or public key (pk-)</li>
              <li>For server-side operations, you typically need a private key (sk-)</li>
              <li>Update your VAPI_API_KEY environment variable</li>
              <li>Redeploy your application</li>
            </ol>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://dashboard.vapi.ai", "_blank")}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open VAPI Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🎤 Discover Your Ikigai with Iki</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have a comprehensive conversation with Iki, our AI Ikigai assistant. She'll guide you through a detailed
            survey to discover meaningful work through the intersection of what you love, what you're good at, what the
            world needs, and what you can be paid for.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Call Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className={`w-5 h-5 ${getConnectionStatusColor()}`} />
                  <span>Voice Service Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection</span>
                    <Badge variant={connectionStatus === "connected" ? "default" : "secondary"}>
                      {getConnectionStatusText()}
                    </Badge>
                  </div>

                  {assistantId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Iki Assistant</span>
                      <Badge variant="default">Ready</Badge>
                    </div>
                  )}

                  {isInitializing && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Authentication Error Help */}
            {renderAuthErrorHelp()}

            {/* Email Input */}
            {!isCallActive && connectionStatus === "connected" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Get Started</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="mt-1"
                    />
                    {email && !isEmailValid && (
                      <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                    )}
                  </div>

                  <Button
                    onClick={startVoiceCall}
                    disabled={!isEmailValid || isConnecting || !assistantId || isInitializing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting to Iki...
                      </>
                    ) : isInitializing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Initializing Assistant...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Start Voice Survey
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Call Controls */}
            {isCallActive && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span>Live Survey</span>
                    </span>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(callDuration)}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Speaking with:</strong> Iki (Ikigai Assistant)
                    </p>
                    <p>
                      <strong>Current Section:</strong> {getCurrentSectionInfo().label}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Survey Progress</span>
                      <span>{Math.round(surveyProgress)}%</span>
                    </div>
                    <Progress value={surveyProgress} className="w-full" />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={endVoiceCall} variant="destructive" className="flex-1">
                      <PhoneOff className="w-4 h-4 mr-2" />
                      End Survey
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
                </CardContent>
              </Card>
            )}

            {/* Survey Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Survey Sections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {SURVEY_SECTIONS.map((section, index) => (
                      <div key={section.key} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                          <span
                            className={`text-sm ${currentSection === section.key ? "font-medium text-purple-600" : "text-gray-600"}`}
                          >
                            {section.label}
                          </span>
                        </div>
                        <Badge
                          variant={
                            completedSections.has(section.key)
                              ? "default"
                              : currentSection === section.key
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {completedSections.has(section.key)
                            ? "✓"
                            : currentSection === section.key
                              ? "Active"
                              : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {isComplete && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Survey Complete!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && connectionStatus !== "auth_error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={retryConnection}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Panel - Conversation Log */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Conversation with Iki</span>
                  </span>
                  <Badge variant="outline">{conversation.length} messages</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {conversation.length === 0 ? (
                      <div className="text-center text-gray-500 py-12">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        {connectionStatus === "connected" ? (
                          <>
                            <p className="text-lg mb-2">Ready to discover your Ikigai?</p>
                            <p className="text-sm">
                              Enter your email above and click "Start Voice Survey" to begin your comprehensive journey
                              with Iki.
                            </p>
                            <div className="mt-6 text-xs text-gray-400">
                              <p>The survey covers 14 sections including:</p>
                              <p>
                                Personal info • Motivation • Interests • Strengths • Work preferences • Values • And
                                more
                              </p>
                            </div>
                          </>
                        ) : connectionStatus === "failed" ? (
                          <>
                            <p className="text-lg mb-2">Connection Issue</p>
                            <p className="text-sm">
                              Unable to connect to the voice service. Please check the connection status above and try
                              again.
                            </p>
                          </>
                        ) : connectionStatus === "not_configured" ? (
                          <>
                            <p className="text-lg mb-2">Service Not Available</p>
                            <p className="text-sm">
                              The voice service is not properly configured. Please contact support for assistance.
                            </p>
                          </>
                        ) : connectionStatus === "auth_error" ? (
                          <>
                            <p className="text-lg mb-2">Authentication Issue</p>
                            <p className="text-sm">
                              There's an issue with the API key configuration. Please check the details in the left
                              panel.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg mb-2">Initializing...</p>
                            <p className="text-sm">
                              Setting up your voice conversation experience. This may take a moment.
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      conversation.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 text-gray-900"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{message.role === "user" ? "You" : "Iki"}</span>
                              <span className="text-xs opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>

                            {message.functionCall && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <span className="font-medium">Action:</span> {message.functionCall.name}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Survey</h3>
              <p className="text-sm text-gray-600">
                Complete a thorough 14-section survey covering all aspects of the Ikigai framework through natural
                conversation.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Intelligent Guidance</h3>
              <p className="text-sm text-gray-600">
                Iki adapts to your responses, provides clarification when needed, and ensures all important data is
                captured accurately.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h3>
              <p className="text-sm text-gray-600">
                Receive a comprehensive Ikigai report based on your voice responses, with personalized insights and
                actionable recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden iframe for VAPI web call */}
      <iframe
        ref={webCallFrame}
        style={{ display: "none" }}
        width="0"
        height="0"
        title="VAPI Voice Survey"
        allow="microphone"
      />
    </div>
  )
}
