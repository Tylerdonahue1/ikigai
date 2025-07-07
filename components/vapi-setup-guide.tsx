"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Settings, ExternalLink, Copy, Loader2 } from "lucide-react"

export default function VAPISetupGuide() {
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch("/api/vapi-setup")
      const data = await response.json()
      setSetupStatus(data)
    } catch (error) {
      console.error("Error checking setup status:", error)
      setError("Failed to check setup status")
    }
  }

  const runSetup = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/vapi-setup", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setSetupStatus({ ...setupStatus, assistantId: data.assistantId })
        alert("VAPI setup completed successfully!")
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error running setup:", error)
      setError("Failed to run setup")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">VAPI Voice Bot Setup Guide</h1>
        <p className="text-gray-600">Follow these steps to configure your VAPI-powered Ikigai voice bot assistant.</p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Setup Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>API Key</span>
              <Badge variant={setupStatus?.apiKeyConfigured ? "default" : "destructive"}>
                {setupStatus?.apiKeyConfigured ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {setupStatus?.apiKeyConfigured ? "Configured" : "Missing"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Connection</span>
              <Badge variant={setupStatus?.connected ? "default" : "destructive"}>
                {setupStatus?.connected ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {setupStatus?.connected ? "Connected" : "Failed"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Assistant</span>
              <Badge variant={setupStatus?.assistantId ? "default" : "secondary"}>
                {setupStatus?.assistantId ? (
                  <CheckCircle className="w-4 h-4 mr-1" />
                ) : (
                  <XCircle className="w-4 h-4 mr-1" />
                )}
                {setupStatus?.assistantId ? "Ready" : "Not Created"}
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-6">
        {/* Step 1: VAPI Account Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: VAPI Account Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Go to{" "}
                <a
                  href="https://vapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  vapi.ai <ExternalLink className="w-3 h-3 ml-1" />
                </a>{" "}
                and create an account
              </li>
              <li>Navigate to the Dashboard and go to "API Keys"</li>
              <li>Create a new API key and copy it</li>
              <li>Add the API key to your server environment variables as VAPI_API_KEY</li>
            </ol>

            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">VAPI_API_KEY=your_api_key_here</code>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard("VAPI_API_KEY=your_api_key_here")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Security Note:</strong> The API key is stored server-side only for better security. Never use
                NEXT_PUBLIC_ prefix for sensitive API keys.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 2: Assistant Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Assistant Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              The assistant will be automatically configured with the following settings:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Model Configuration:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Provider: OpenAI</li>
                  <li>• Model: GPT-4</li>
                  <li>• Temperature: 0.7</li>
                  <li>• Max Tokens: 500</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Voice Configuration:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Provider: Eleven Labs</li>
                  <li>• Voice: Rachel (warm, professional)</li>
                  <li>• Speed: 0.9x</li>
                  <li>• Stability: 0.6</li>
                </ul>
              </div>
            </div>

            <Button onClick={runSetup} disabled={isLoading || !setupStatus?.apiKeyConfigured} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up assistant...
                </>
              ) : (
                "Create Ikigai Assistant"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Step 3: Function Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Function Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              The assistant will be configured with these functions to capture and process Ikigai data:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">capture_survey_response</h4>
                <p className="text-xs text-gray-600">Captures and validates user responses to survey questions</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">navigate_survey</h4>
                <p className="text-xs text-gray-600">Manages conversation flow and section transitions</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm">validate_rating_response</h4>
                <p className="text-xs text-gray-600">Validates 1-5 rating scale responses for activity preferences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Testing & Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Once the assistant is created, test the voice bot functionality:</p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Enter a valid email address</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Click "Start Voice Survey"</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Allow microphone permissions when prompted</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Speak with Iki and verify responses are captured</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Complete the survey and verify data processing</span>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Make sure your browser allows microphone access and that you're using HTTPS
                in production for voice functionality to work properly.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 5: Deployment Considerations */}
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Deployment Considerations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Environment Variables</h4>
                <div className="bg-gray-100 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <code className="text-xs">VAPI_API_KEY</code>
                    <Badge variant="outline">Required (Server-side)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs">ANTHROPIC_API_KEY</code>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs">STORAGE_URL</code>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs">STORAGE_TOKEN</code>
                    <Badge variant="outline">Required</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Security Best Practices</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• VAPI API key is server-side only (no NEXT_PUBLIC_ prefix)</li>
                  <li>• All VAPI operations go through secure API routes</li>
                  <li>• Client-side code never accesses sensitive keys</li>
                  <li>• Implement rate limiting for voice calls</li>
                  <li>• Monitor API usage and costs regularly</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Performance Optimization</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Cache assistant ID in localStorage</li>
                  <li>• Implement connection retry logic</li>
                  <li>• Set appropriate timeout values</li>
                  <li>• Monitor voice call quality and duration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={checkSetupStatus}>
              Refresh Status
            </Button>
            <Button variant="outline" asChild>
              <a href="https://vapi.ai/dashboard" target="_blank" rel="noopener noreferrer">
                Open VAPI Dashboard <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/voice-dashboard">View Voice Sessions</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/system-status">System Health</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
