"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

interface EmailCollectionProps {
  onEmailSubmit: (email: string) => void
  isLoading?: boolean
  error?: string | null
}

export default function EmailCollectionInterface({ onEmailSubmit, isLoading = false, error }: EmailCollectionProps) {
  const [email, setEmail] = useState("")
  const [isEmailValid, setIsEmailValid] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    setIsEmailValid(validateEmail(newEmail))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEmailValid && !isLoading) {
      onEmailSubmit(email)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Start Your Ikigai Journey</CardTitle>
          <p className="text-gray-600">
            Enter your email to begin a personalized voice conversation with Iki, our AI assistant who will guide you
            through discovering your purpose.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your.email@example.com"
                className="mt-1"
                disabled={isLoading}
                required
              />
              {email && !isEmailValid && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isEmailValid || isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  Continue to Voice Survey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>🎤 Voice-powered • 🤖 AI-guided • 📊 Personalized results</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
