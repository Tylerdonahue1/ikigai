"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Mic, MessageCircle, ArrowRight } from "lucide-react"

interface EmailCollectionInterfaceProps {
  onEmailSubmitted: (email: string) => void
}

export default function EmailCollectionInterface({ onEmailSubmitted }: EmailCollectionInterfaceProps) {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsValid(validateEmail(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)

    // Simulate API call to validate/store email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onEmailSubmitted(email)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">🎤 Voice-Powered Ikigai Discovery</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Experience a natural conversation with our AI coach to discover your life's purpose. We'll guide you through
            thoughtful questions using advanced voice technology.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Natural Voice Conversation</h3>
              <p className="text-sm text-gray-600">
                Speak naturally with our AI coach. No typing required - just have a conversation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat Log</h3>
              <p className="text-sm text-gray-600">
                See your conversation in real-time and resume from any point if interrupted.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your conversation is securely stored and only accessible to you.</p>
            </CardContent>
          </Card>
        </div>

        {/* Email Collection Form */}
        <Card className="max-w-md mx-auto bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Get Started</CardTitle>
            <p className="text-gray-600 text-center">Enter your email to begin your voice-powered Ikigai journey</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your.email@example.com"
                  className="mt-1 text-lg p-3"
                  required
                />
                {email && !isValid && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
              </div>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Setting up your session...
                  </>
                ) : (
                  <>
                    Start Voice Conversation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our privacy policy. Your email will be used to send you your personalized
                Ikigai report and save your conversation progress.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ⏱️ Takes 10-15 minutes • 🔒 Completely private • 📊 Detailed personalized report
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span>Powered by VAPI Voice AI</span>
            <ArrowRight className="w-4 h-4" />
            <span>Claude AI Analysis</span>
            <ArrowRight className="w-4 h-4" />
            <span>Your Ikigai Report</span>
          </div>
        </div>
      </div>
    </div>
  )
}
