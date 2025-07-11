"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Mail, ArrowRight, Mic } from "lucide-react"
import VAPIRealtimeChat from "@/components/vapi-realtime-chat"

export default function VoiceRealtimePage() {
  const [email, setEmail] = useState("")
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    setIsStarted(true)
  }

  const handleComplete = (data: any) => {
    console.log("Voice assessment completed:", data)
    // Here you could save the results, redirect to results page, etc.
    alert("Voice assessment completed! Check console for details.")
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    console.error("Voice chat error:", errorMessage)
  }

  const handleReset = () => {
    setIsStarted(false)
    setError(null)
  }

  if (isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voice Chat with Iki</h1>
              <p className="text-gray-600 mt-2">Real-time voice conversation for your Ikigai assessment</p>
            </div>
            <Button onClick={handleReset} variant="outline">
              Start Over
            </Button>
          </div>

          <VAPIRealtimeChat email={email} onComplete={handleComplete} onError={handleError} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Voice Chat with Iki</CardTitle>
          <p className="text-gray-600">
            Start a real-time voice conversation to discover your Ikigai through natural dialogue
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              <span>Natural voice conversation</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Badge className="w-4 h-4 bg-green-500" />
              <span>Real-time AI responses</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Results sent to your email</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">We'll send your Ikigai results to this email</p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Start Button */}
          <Button onClick={handleStart} className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
            Start Voice Chat
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Assistant ID: 5542140a-b071-4455-8d43-6a0eb424dbc4</p>
            <p>Powered by VAPI Web SDK</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
