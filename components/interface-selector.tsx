"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Mic, ArrowRight } from "lucide-react"

interface InterfaceSelectorProps {
  onSelect: (mode: "chat" | "voice") => void
}

export default function InterfaceSelector({ onSelect }: InterfaceSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<"chat" | "voice" | null>(null)

  const handleSelect = (mode: "chat" | "voice") => {
    setSelectedMode(mode)
    setTimeout(() => onSelect(mode), 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Discover Your Ikigai</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Choose how you'd like to explore your reason for being. Both experiences will guide you through the same
            thoughtful questions, just in different ways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Chat Interface Option */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              selectedMode === "chat" ? "ring-4 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelect("chat")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">💬 Chat Experience</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Have a thoughtful conversation with our AI coach. Type your responses and receive personalized follow-up
                questions in a natural dialogue.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Natural conversation flow</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Quick response suggestions</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Perfect for detailed responses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Interface Option */}
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              selectedMode === "voice" ? "ring-4 ring-green-500 bg-green-50" : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelect("voice")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Mic className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">🎤 Voice Experience</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Speak naturally with our voice-enabled AI coach. Share your thoughts out loud and hear responses that
                guide you through your Ikigai discovery.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Hands-free interaction</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Natural speech recognition</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>✓</span>
                  <span>Audio responses you can hear</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-4">
            Both experiences take about 10-15 minutes and generate the same comprehensive Ikigai report.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span>Powered by Claude AI</span>
            <ArrowRight className="w-4 h-4" />
            <span>Personalized Analysis</span>
            <ArrowRight className="w-4 h-4" />
            <span>Your Ikigai Report</span>
          </div>
        </div>
      </div>
    </div>
  )
}
