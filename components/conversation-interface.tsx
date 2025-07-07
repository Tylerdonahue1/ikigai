"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react"
import { ConversationEngine } from "@/lib/conversation-engine"
import type { Message, ConversationState } from "@/types/conversation"
import { type SpeechRecognition, webkitSpeechRecognition } from "speech-recognition-polyfill"

interface ConversationInterfaceProps {
  mode: "chat" | "voice"
  onComplete: (data: any) => void
}

export default function ConversationInterface({ mode, onComplete }: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationEngine, setConversationEngine] = useState<ConversationEngine | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize conversation engine
    const initialState: ConversationState = {
      currentSection: "welcome",
      currentQuestion: 0,
      collectedData: {},
      conversationHistory: [],
      userPreferences: {
        interface: mode,
        pace: "normal",
        detailLevel: "detailed",
      },
    }

    const engine = new ConversationEngine(initialState)
    setConversationEngine(engine)

    // Add welcome message
    const welcomeMessage: Message = {
      id: "1",
      role: "assistant",
      content:
        "Hi there! I'm excited to help you discover your Ikigai - your reason for being. Let's start with getting to know you better. What's your first name?",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])

    // Initialize speech recognition for voice mode
    if (mode === "voice" && webkitSpeechRecognition) {
      const recognition = new webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        handleUserInput(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [mode])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleUserInput = async (input: string) => {
    if (!conversationEngine || !input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      // Process with conversation engine
      const response = await conversationEngine.processUserInput(input)

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
        metadata: {
          suggestions: response.suggestions,
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      setSuggestions(response.suggestions || [])

      // Speak response in voice mode
      if (mode === "voice") {
        speakText(response.response)
      }

      // Check if assessment is complete
      if (response.isComplete) {
        // Handle completion
        setTimeout(() => {
          onComplete(conversationEngine.state.collectedData)
        }, 2000)
      }
    } catch (error) {
      console.error("Error processing input:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I had trouble processing that. Could you try again?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setInputValue("")
  }

  const speakText = (text: string) => {
    if (!synthRef.current) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (!recognitionRef.current) return

    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    if (!recognitionRef.current) return

    setIsListening(false)
    recognitionRef.current.stop()
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleUserInput(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUserInput(inputValue)
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "voice" ? "🎤 Voice Ikigai Assessment" : "💬 Chat Ikigai Assessment"}
          </h1>
          <div className="flex items-center space-x-2">
            {mode === "voice" && (
              <Button variant="ghost" size="sm" onClick={() => synthRef.current?.cancel()} disabled={!isSpeaking}>
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-[80%] ${message.role === "user" ? "bg-blue-600 text-white" : "bg-white shadow-md"}`}
            >
              <CardContent className="p-4">
                <p className="text-lg leading-relaxed">{message.content}</p>
                {message.metadata?.suggestions && (
                  <div className="mt-3 text-sm text-gray-500">Suggested responses available below</div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          {mode === "voice" && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "default"}
              size="lg"
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className="px-6"
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Speak
                </>
              )}
            </Button>
          )}

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={mode === "voice" ? "Or type your response..." : "Type your response..."}
            className="flex-1 text-lg p-3"
            disabled={isListening}
          />

          <Button type="submit" size="lg" disabled={!inputValue.trim() || isListening} className="px-6">
            <Send className="w-5 h-5" />
          </Button>
        </form>

        {mode === "voice" && (
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500">
              {isListening ? "🎤 Listening..." : isSpeaking ? "🔊 Speaking..." : "Click speak or type your response"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
