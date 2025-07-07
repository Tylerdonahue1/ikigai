"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, ExternalLink, Key, Settings, Mic, Phone, Code, Shield, Loader2 } from "lucide-react"

export default function VAPISetupGuide() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<any>(null)

  const testConnection = async () => {
    setConnectionStatus("testing")
    try {
      const response = await fetch("/api/vapi/test-connection")
      const data = await response.json()
      setConnectionDetails(data)
      setConnectionStatus(data.success ? "success" : "error")
    } catch (error) {
      setConnectionStatus("error")
      setConnectionDetails({ error: "Failed to test connection" })
    }
  }

  const createAssistant = async () => {
    try {
      const response = await fetch("/api/vapi/create-assistant", {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        alert(`Assistant created successfully! ID: ${data.assistantId}`)
      } else {
        alert(`Failed to create assistant: ${data.error}`)
      }
    } catch (error) {
      alert("Error creating assistant")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">VAPI Integration Setup Guide</h1>
        <p className="text-lg text-gray-600">
          Complete guide to setting up voice conversations with VAPI for your Ikigai assessment
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="w-6 h-6" />
                <span>What is VAPI?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                VAPI (Voice API) is a platform that enables voice-powered AI conversations. In your Ikigai application,
                it powers the voice survey feature where users can speak naturally with Iki, the AI assistant.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <Phone className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-semibold">Voice Calls</h3>
                  <p className="text-sm text-gray-600">Real-time voice conversations with AI</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Settings className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-semibold">AI Assistants</h3>
                  <p className="text-sm text-gray-600">Customizable AI personalities and behaviors</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Code className="w-8 h-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold">Function Calls</h3>
                  <p className="text-sm text-gray-600">AI can execute custom functions during conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">User starts voice survey</h4>
                    <p className="text-sm text-gray-600">Frontend creates web call via your API</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">VAPI handles voice processing</h4>
                    <p className="text-sm text-gray-600">Speech-to-text, AI processing, text-to-speech</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">AI captures survey data</h4>
                    <p className="text-sm text-gray-600">Function calls save responses to your database</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-6 h-6" />
                <span>API Key Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> Always use server-side API keys (VAPI_API_KEY) for production. Never
                  expose API keys in client-side code.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Correct Setup (Server-side)</h4>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <code className="text-sm">VAPI_API_KEY=sk-your-private-key-here</code>
                    <p className="text-xs text-green-600 mt-1">Private key (sk-) used in server-side API routes only</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-red-600 mb-2">❌ Incorrect Setup (Client-side)</h4>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <code className="text-sm line-through">NEXT_PUBLIC_VAPI_API_KEY=sk-your-key</code>
                    <p className="text-xs text-red-600 mt-1">Never expose private keys to the client</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Environment Variable Setup:</h4>
                <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
                  <li>Get your private API key from VAPI dashboard</li>
                  <li>Add VAPI_API_KEY to your environment variables</li>
                  <li>Remove any NEXT_PUBLIC_VAPI_API_KEY variables</li>
                  <li>Redeploy your application</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Create VAPI Account</h4>
                    <p className="text-sm text-gray-600 mb-2">Sign up at dashboard.vapi.ai</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://dashboard.vapi.ai" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open VAPI Dashboard
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Get API Key</h4>
                    <p className="text-sm text-gray-600">
                      Navigate to API Keys section and create a new private key (starts with sk-)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Configure Environment</h4>
                    <p className="text-sm text-gray-600">Add VAPI_API_KEY to your deployment environment</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Test Connection</h4>
                    <p className="text-sm text-gray-600 mb-2">Verify your setup works correctly</p>
                    <Button onClick={testConnection} disabled={connectionStatus === "testing"} size="sm">
                      {connectionStatus === "testing" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Create Assistant</h4>
                    <p className="text-sm text-gray-600 mb-2">Set up the Ikigai AI assistant</p>
                    <Button onClick={createAssistant} variant="outline" size="sm">
                      Create Ikigai Assistant
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-6 h-6" />
                <span>Security Best Practices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> API keys should never be exposed to client-side code. Always use
                  server-side routes for VAPI operations.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Secure Implementation</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>API keys stored as server-side environment variables</li>
                    <li>All VAPI calls made through /api/vapi/* routes</li>
                    <li>Client components only make HTTP requests to your API</li>
                    <li>No direct VAPI SDK usage in client components</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-600 mb-2">❌ Security Risks to Avoid</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Using NEXT_PUBLIC_ prefixed API keys</li>
                    <li>Direct VAPI SDK calls from client components</li>
                    <li>Hardcoding API keys in source code</li>
                    <li>Exposing API keys in browser developer tools</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2">Current Implementation:</h4>
                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                  <li>VAPIServer class handles all API communication</li>
                  <li>Client components use fetch() to call your API routes</li>
                  <li>API keys never leave your server environment</li>
                  <li>Proper error handling for authentication issues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>VAPI Connection Status</span>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      connectionStatus === "success"
                        ? "default"
                        : connectionStatus === "error"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {connectionStatus === "idle"
                      ? "Not Tested"
                      : connectionStatus === "testing"
                        ? "Testing..."
                        : connectionStatus === "success"
                          ? "Connected"
                          : "Failed"}
                  </Badge>
                  <Button onClick={testConnection} disabled={connectionStatus === "testing"} size="sm">
                    {connectionStatus === "testing" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Now"}
                  </Button>
                </div>
              </div>

              {connectionDetails && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <h4 className="font-semibold mb-2">Connection Details:</h4>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(connectionDetails, null, 2)}
                  </pre>
                </div>
              )}

              {connectionStatus === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ VAPI connection successful! Your voice survey feature is ready to use.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ Connection failed. Check your API key configuration and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-red-600 mb-2">❌ "Invalid Key" Error</h4>
                <div className="bg-red-50 p-3 rounded border border-red-200 mb-2">
                  <code className="text-sm">VAPI API error: 401 - Invalid Key</code>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Cause:</strong> Wrong API key type or invalid key
                  </p>
                  <p>
                    <strong>Solution:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Verify you're using a private key (starts with sk-)</li>
                    <li>Check the key is active in your VAPI dashboard</li>
                    <li>Ensure no extra spaces or characters in the key</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2">❌ "Environment Variable Not Found"</h4>
                <div className="bg-red-50 p-3 rounded border border-red-200 mb-2">
                  <code className="text-sm">VAPI_API_KEY environment variable is required</code>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Cause:</strong> API key not configured in deployment
                  </p>
                  <p>
                    <strong>Solution:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Add VAPI_API_KEY to your environment variables</li>
                    <li>Redeploy your application</li>
                    <li>Verify the key is available in your deployment logs</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-orange-600 mb-2">⚠️ Assistant Creation Fails</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Possible Causes:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Insufficient API key permissions</li>
                    <li>Account limits reached</li>
                    <li>Invalid assistant configuration</li>
                  </ul>
                  <p>
                    <strong>Solution:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Check your VAPI dashboard for account status</li>
                    <li>Verify API key has assistant creation permissions</li>
                    <li>Review server logs for detailed error messages</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-blue-600 mb-2">💡 Getting Help</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>If you're still experiencing issues:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Check the browser console for client-side errors</li>
                    <li>Review server logs for detailed error messages</li>
                    <li>Test the connection using the testing tab above</li>
                    <li>Verify your VAPI dashboard shows the correct API key</li>
                  </ul>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://docs.vapi.ai" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        VAPI Documentation
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
