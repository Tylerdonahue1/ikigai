"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { IKIGAI_ASSISTANT_ID } from "@/lib/vapi-web-client"

export default function TestVAPIWebPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [vapiInstance, setVapiInstance] = useState<any>(null)

  const addTestResult = (name: string, success: boolean, message: string, details?: any) => {
    setTestResults((prev) => [
      ...prev,
      {
        name,
        success,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const runTests = async () => {
    setIsLoading(true)
    setTestResults([])

    try {
      // Test 1: Check environment variables
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
      if (publicKey) {
        addTestResult("Environment Variables", true, `VAPI public key found: ${publicKey.substring(0, 10)}...`)
      } else {
        addTestResult("Environment Variables", false, "NEXT_PUBLIC_VAPI_PUBLIC_KEY not found")
        return
      }

      // Test 2: Import VAPI Web SDK
      try {
        const { default: Vapi } = await import("@vapi-ai/web")
        addTestResult("VAPI Web SDK Import", true, "Successfully imported @vapi-ai/web")

        // Test 3: Initialize VAPI instance
        try {
          const vapi = new Vapi(publicKey)
          setVapiInstance(vapi)
          addTestResult("VAPI Initialization", true, "VAPI instance created successfully")

          // Test 4: Check assistant ID
          addTestResult("Assistant Configuration", true, `Using assistant ID: ${IKIGAI_ASSISTANT_ID}`)

          // Test 5: Test start method signature
          try {
            // This should fail but we can catch the error to see the expected format
            await vapi.start("test-assistant-id")
          } catch (error: any) {
            if (error.message.includes("assistant")) {
              addTestResult("Start Method Test", false, `Start method error (expected): ${error.message}`, error)
            } else {
              addTestResult("Start Method Test", true, "Start method accepts assistant ID parameter")
            }
          }
        } catch (error: any) {
          addTestResult("VAPI Initialization", false, `Failed to create VAPI instance: ${error.message}`)
        }
      } catch (error: any) {
        addTestResult("VAPI Web SDK Import", false, `Failed to import @vapi-ai/web: ${error.message}`)
      }
    } catch (error: any) {
      addTestResult("General Error", false, `Unexpected error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testStartCall = async () => {
    if (!vapiInstance) {
      addTestResult("Start Call Test", false, "No VAPI instance available")
      return
    }

    try {
      setIsLoading(true)

      // Try different start call formats to see which one works
      const formats = [
        { name: "Direct ID", call: () => vapiInstance.start(IKIGAI_ASSISTANT_ID) },
        { name: "ID with config", call: () => vapiInstance.start(IKIGAI_ASSISTANT_ID, {}) },
        { name: "Config object", call: () => vapiInstance.start({ assistantId: IKIGAI_ASSISTANT_ID }) },
        { name: "Assistant object", call: () => vapiInstance.start({ assistant: { id: IKIGAI_ASSISTANT_ID } }) },
      ]

      for (const format of formats) {
        try {
          await format.call()
          addTestResult(`Start Call - ${format.name}`, true, "Call started successfully")
          // If successful, stop the call
          try {
            await vapiInstance.stop()
          } catch (e) {
            // Ignore stop errors
          }
          break
        } catch (error: any) {
          addTestResult(
            `Start Call - ${format.name}`,
            false,
            `Failed: ${error.message || error.error?.message || "Unknown error"}`,
            error,
          )
        }
      }
    } catch (error: any) {
      addTestResult("Start Call Test", false, `Unexpected error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>VAPI Web SDK Test Suite</CardTitle>
            <p className="text-gray-600">Test the VAPI Web SDK configuration and identify the correct call format</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={runTests} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Run Basic Tests
              </Button>
              <Button onClick={testStartCall} disabled={isLoading || !vapiInstance} variant="outline">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Test Start Call Formats
              </Button>
            </div>

            {/* Test Results */}
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <Alert key={index} variant={result.success ? "default" : "destructive"}>
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={result.success ? "default" : "destructive"}>{result.name}</Badge>
                    </div>
                    <AlertDescription className="mt-2">
                      <p>{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">Details</summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>

            {/* Configuration Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Current Configuration</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>Assistant ID:</strong> {IKIGAI_ASSISTANT_ID}
                </p>
                <p>
                  <strong>Public Key:</strong>{" "}
                  {process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
                    ? `${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY.substring(0, 10)}...`
                    : "Not configured"}
                </p>
                <p>
                  <strong>SDK Version:</strong> @vapi-ai/web ^2.0.4
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
