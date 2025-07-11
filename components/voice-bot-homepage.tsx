"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MessageCircle, Settings, CheckCircle, AlertCircle, Loader2, RefreshCw, Shield } from "lucide-react"
import EmailCollectionInterface from "./email-collection-interface"
import VAPIRealtimeChat from "./vapi-realtime-chat"

// Your pre-created assistant ID - no creation needed
const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

type Step = "email" | "voice" | "complete"

interface ConnectionStatus {
  connected: boolean
  configured: boolean
  error?: string
  suggestion?: string
}

export default function VoiceBotHomepage() {
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [userEmail, setUserEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setIsTestingConnection(true)
    setError(null)

    try {
      console.log("Testing connection to existing assistant:", IKIGAI_ASSISTANT_ID)

      const response = await fetch("/api/vapi/test-connection")
      const data = await response.json()

      console.log("Connection test result:", data)

      setConnectionStatus({
        connected: data.success,
        configured: !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
        error: data.error,
        suggestion: data.suggestion,
      })

      if (!data.success) {
        setError(data.error || "Failed to connect to voice service")
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus({
        connected: false,
        configured: false,
        error: "Connection test failed",
      })
      setError("Failed to test voice service connection")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email)
    setCurrentStep("voice")
  }

  const handleVoiceComplete = (data: any) => {
    console.log("Voice conversation completed:", data)
    setCurrentStep("complete")
  }

  const handleVoiceError = (error: string) => {
    setError(error)
  }

  const renderConnectionStatus = () => {
    if (isTestingConnection) {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Testing connection to assistant {IKIGAI_ASSISTANT_ID.substring(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!connectionStatus) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Voice Service Status</span>
            </span>
            <Badge
              variant={connectionStatus.connected ? "default" : "destructive"}
              className="flex items-center space-x-1"
            >
              {connectionStatus.connected ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{connectionStatus.connected ? "Connected" : "Disconnected"}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionStatus.connected ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected to assistant: {IKIGAI_ASSISTANT_ID}</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Voice service ready</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>Connection Failed:</strong> {connectionStatus.error}
                    </p>
                    {connectionStatus.suggestion && <p className="text-sm">{connectionStatus.suggestion}</p>}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button onClick={testConnection} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "email":
        return <EmailCollectionInterface onEmailSubmit={handleEmailSubmit} isLoading={isLoading} error={error} />
      case "voice":
        return <VAPIRealtimeChat email={userEmail} onComplete={handleVoiceComplete} onError={handleVoiceError} />
      case "complete":
        return (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for completing your Ikigai voice assessment. Your results are being processed.
              </p>
              <Button onClick={() => setCurrentStep("email")} variant="outline">
                Start New Assessment
              </Button>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your Ikigai with Voice</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a natural conversation with Iki, our AI assistant, to uncover your life's purpose through an
            interactive voice assessment.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div
              className={`flex items-center space-x-2 ${currentStep === "email" ? "text-purple-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "email" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="text-sm font-medium">Email</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div
              className={`flex items-center space-x-2 ${currentStep === "voice" ? "text-purple-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "voice" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="text-sm font-medium">Voice Chat</span>
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div
              className={`flex items-center space-x-2 ${currentStep === "complete" ? "text-purple-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "complete" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              >
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {renderConnectionStatus()}

        {/* Current Step Content */}
        {connectionStatus?.connected || currentStep === "email" ? (
          renderCurrentStep()
        ) : (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Service Unavailable</h2>
              <p className="text-gray-600 mb-4">
                The voice service is currently unavailable. Please check the connection status above and try again.
              </p>
              <Button onClick={testConnection} className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Mic className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Natural Conversation</h3>
              <p className="text-gray-600 text-sm">
                Speak naturally with Iki as if you're talking to a friend about your life and aspirations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 text-sm">
                Our AI analyzes your responses to provide personalized insights about your Ikigai.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your conversations are processed securely and your privacy is our top priority.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
