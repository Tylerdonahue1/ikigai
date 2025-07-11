"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, MessageCircle, Bot, User, Loader2, AlertCircle } from "lucide-react"

// Your pre-created assistant ID
const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

interface VAPIChatInterfaceProps {
  email: string
  onComplete: (data: any) => void
  onError: (error: string) => void
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export default function VAPIChatInterface({ email, onComplete, onError }: VAPIChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Start conversation automatically
  useEffect(() => {
    startConversation()
  }, [])

  const startConversation = async () => {
    const welcomeMessage = `Hello! I'm Iki, your Ikigai guide. I'm here to help you discover your life's purpose through a meaningful conversation. Let's start by getting to know you better. What's your name?`

    addMessage("assistant", welcomeMessage)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setError(null)
    setIsLoading(true)

    // Add user message immediately
    addMessage("user", userMessage)

    try {
      console.log("Sending message to VAPI chat...")

      const response = await fetch("/api/vapi/create-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: userMessage,
          sessionId,
          previousChatId: messages.length > 0 ? `chat-${sessionId}-${messages.length}` : undefined,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to send message")
      }

      console.log("Chat response received:", data)

      // Extract assistant response from the chat
      if (data.chat && data.chat.output && data.chat.output.length > 0) {
        const assistantResponse = data.chat.output[data.chat.output.length - 1]
        if (assistantResponse.role === "assistant") {
          addMessage("assistant", assistantResponse.message)
        }
      } else if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
        const lastMessage = data.chat.messages[data.chat.messages.length - 1]
        if (lastMessage.role === "assistant") {
          addMessage("assistant", lastMessage.message)
        }
      } else {
        // Fallback response
        addMessage("assistant", "I understand. Please tell me more about that.")
      }

      // Check if conversation should be completed
      checkForCompletion(userMessage)
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = (role: "user" | "assistant", content: string) => {
    const message: ChatMessage = {
      id: `${role}-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, message])
  }

  const checkForCompletion = (userMessage: string) => {
    // Simple completion detection - you can make this more sophisticated
    const completionKeywords = ["thank you", "that's all", "finished", "complete", "done"]
    const messageCount = messages.length

    if (messageCount > 20 || completionKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword))) {
      setTimeout(() => {
        setIsComplete(true)
        onComplete({
          messages,
          sessionId,
          email,
          messageCount: messages.length + 1,
          timestamp: Date.now(),
        })
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className="max-w-4xl mx-auto h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Chat with Iki</span>
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Assistant: {IKIGAI_ASSISTANT_ID.substring(0, 8)}...</Badge>
            <Badge variant="outline">{messages.length} messages</Badge>
            {isComplete && <Badge className="bg-green-100 text-green-800">Complete</Badge>}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Starting your conversation with Iki...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900 border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="text-sm font-medium">{message.role === "user" ? "You" : "Iki"}</span>
                      <span className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Iki</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <p className="text-sm mt-2">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isComplete ? "Conversation completed" : "Type your message..."}
            disabled={isLoading || isComplete}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || isComplete}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Status Info */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>Session: {sessionId}</p>
          <p>Email: {email}</p>
          {isComplete && <p className="text-green-600">✅ Assessment completed successfully</p>}
        </div>
      </CardContent>
    </Card>
  )
}
