"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Mic, Phone, Settings, User } from "lucide-react"
import VAPIRealtimeChat from "@/components/vapi-realtime-chat"

export default function VoiceRealtimePage() {
  const [email, setEmail] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedData, setCompletedData] = useState<any>(null)

  const handleStart = () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    setIsStarted(true)
  }

  const handleComplete = (data: any) => {
    console.log("Voice assessment completed:", data)
    setCompletedData(data)
    setIsStarted(false)
  }

  const handleError = (errorMessage: string) => {
    console.error("Voice assessment error:", errorMessage)
    setError(errorMessage)
  }

  const handleReset = () => {
    setIsStarted(false)
    setCompletedData(null)
    setError(null)
    setEmail("")
  }

  if (completedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-6 h-6 text-green-600" />
                <span>Voice Assessment Completed</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Assessment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {completedData.email}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {Math.floor(completedData.callDuration / 60)}m{" "}
                    {completedData.callDuration % 60}s
                  </div>
                  <div>
                    <span className="font-medium">Messages:</span> {completedData.messages?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Completed:</span> {new Date(completedData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              {completedData.messages && completedData.messages.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Conversation Summary</h3>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {completedData.messages.slice(-5).map((message: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">
                          {message.type === "user" ? "You" : message.type === "assistant" ? "Iki" : "System"}:
                        </span>{" "}
                        {message.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button onClick={handleReset} variant="outline">
                  Start New Assessment
                </Button>
                <Button onClick={() => (window.location.href = "/dashboard")}>Go to Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <VAPIRealtimeChat email={email} onComplete={handleComplete} onError={handleError} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="w-6 h-6 text-purple-600" />
              <span>Voice-Powered Ikigai Assessment</span>
            </CardTitle>
            <p className="text-gray-600">
              Have a natural conversation with Iki, our AI assistant, to discover your Ikigai through voice interaction.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Natural Conversation</span>
                </div>
                <p className="text-sm text-blue-700">
                  Speak naturally with Iki about your passions, skills, and values.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Real-time Processing</span>
                </div>
                <p className="text-sm text-green-700">
                  Your responses are processed in real-time for immediate insights.
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Personalized Results</span>
                </div>
                <p className="text-sm text-purple-700">Get a customized Ikigai diagram based on your conversation.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">We'll use this to save your assessment results.</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Before You Start</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Make sure you're in a quiet environment</li>
                  <li>• Allow microphone access when prompted</li>
                  <li>• Speak clearly and naturally</li>
                  <li>• The conversation typically takes 10-15 minutes</li>
                </ul>
              </div>

              <Button
                onClick={handleStart}
                disabled={!email.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                size="lg"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Assessment
              </Button>
            </div>

            <div className="text-center">
              <Badge variant="outline" className="bg-gray-50">
                Assistant ID: 5542140a-b071-4455-8d43-6a0eb424dbc4
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
