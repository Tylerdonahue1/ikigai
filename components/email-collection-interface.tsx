"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowRight, AlertCircle } from "lucide-react"

interface EmailCollectionInterfaceProps {
  onEmailSubmit: (email: string) => void
  isLoading?: boolean
  error?: string | null
}

export default function EmailCollectionInterface({
  onEmailSubmit,
  isLoading = false,
  error = null,
}: EmailCollectionInterfaceProps) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setEmailError("Email address is required")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setEmailError("")
    onEmailSubmit(email.trim())
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) {
      setEmailError("")
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center space-x-2">
          <Mail className="w-6 h-6 text-purple-600" />
          <span>Get Started</span>
        </CardTitle>
        <p className="text-center text-gray-600 text-sm">
          Enter your email to begin your personalized Ikigai assessment with Iki
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              "Starting..."
            ) : (
              <>
                Continue to Voice Chat
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>🎤 Make sure your microphone is enabled</p>
            <p>🔊 Use headphones for the best experience</p>
            <p>⏱️ The conversation typically takes 10-15 minutes</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
