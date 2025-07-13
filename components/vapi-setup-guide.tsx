"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testVapiConnection, createVapiAssistant } from "@/lib/vapi-setup-actions"

export default function VapiSetupGuide() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    assistant?: any
  } | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const result = await testVapiConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: "Connection test failed",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleCreateAssistant = async () => {
    setIsCreatingAssistant(true)
    try {
      const assistantConfig = {
        name: "Ikigai Assessment Assistant",
        model: {
          provider: "openai",
          model: "gpt-4",
          temperature: 0.7,
        },
        voice: {
          provider: "11labs",
          voiceId: "default",
        },
      }

      const result = await createVapiAssistant(assistantConfig)
      console.log("Assistant creation result:", result)
    } catch (error) {
      console.error("Failed to create assistant:", error)
    } finally {
      setIsCreatingAssistant(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>VAPI Setup Guide</CardTitle>
          <CardDescription>Configure and test your VAPI integration for voice conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Test VAPI Connection</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verify that your VAPI API key is working and can connect to the service.
              </p>
              <Button onClick={handleTestConnection} disabled={isTestingConnection} className="w-full sm:w-auto">
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </Button>

              {connectionStatus && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    connectionStatus.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className={`font-medium ${connectionStatus.success ? "text-green-800" : "text-red-800"}`}>
                    {connectionStatus.message}
                  </p>
                  {connectionStatus.assistant && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Assistant ID: {connectionStatus.assistant.id}</p>
                      <p>Assistant Name: {connectionStatus.assistant.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Create Assistant (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">Create a new VAPI assistant for your Ikigai assessment.</p>
              <Button
                onClick={handleCreateAssistant}
                disabled={isCreatingAssistant}
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                {isCreatingAssistant ? "Creating..." : "Create Assistant"}
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Environment Variables</h3>
              <p className="text-sm text-gray-600 mb-2">Make sure you have the following environment variables set:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <code>VAPI_API_KEY</code> - Your VAPI API key
                </li>
                <li>
                  • <code>NEXT_PUBLIC_VAPI_PUBLIC_KEY</code> - Your VAPI public key
                </li>
                <li>
                  • <code>KV_REST_API_URL</code> - Upstash Redis URL
                </li>
                <li>
                  • <code>KV_REST_API_TOKEN</code> - Upstash Redis token
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Next Steps</h3>
              <p className="text-sm text-gray-600">
                Once your connection is working, you can start using the voice conversation features in your Ikigai
                assessment application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
