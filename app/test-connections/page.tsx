"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestConnectionsPage() {
  const [tests, setTests] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const runTest = async (testName: string, endpoint: string) => {
    setLoading((prev) => ({ ...prev, [testName]: true }))
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setTests((prev) => ({ ...prev, [testName]: data }))
    } catch (error) {
      setTests((prev) => ({
        ...prev,
        [testName]: { success: false, error: String(error) },
      }))
    }
    setLoading((prev) => ({ ...prev, [testName]: false }))
  }

  const TestCard = ({ title, testKey, endpoint, description }: any) => {
    const test = tests[testKey]
    const isLoading = loading[testKey]

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {test && (
              <div className="flex items-center">
                {test.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <Button
            onClick={() => runTest(testKey, endpoint)}
            disabled={isLoading}
            className="mb-4"
            variant={test?.success ? "default" : "outline"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              `Run ${title} Test`
            )}
          </Button>

          {test && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto">{JSON.stringify(test, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Connection Tests</h1>

        <TestCard
          title="Redis Configuration"
          testKey="redis-config"
          endpoint="/api/fix-redis-config"
          description="Check your Redis environment variables and get setup instructions"
        />

        <TestCard
          title="Simple Redis Test"
          testKey="simple-redis"
          endpoint="/api/simple-redis-test"
          description="Test Redis connection with basic REST API calls"
        />

        <TestCard
          title="Full Redis Debug"
          testKey="redis-debug"
          endpoint="/api/debug-redis"
          description="Comprehensive Redis connection testing with both @upstash/redis and @vercel/kv"
        />

        <TestCard
          title="Claude AI Test"
          testKey="claude-test"
          endpoint="/api/test-claude"
          description="Test Claude AI integration and API key"
        />

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Quick Setup Guide</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to your Upstash Console (console.upstash.com)</li>
            <li>Select your Redis database</li>
            <li>Copy the "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"</li>
            <li>Add them to Vercel as KV_REST_API_URL and KV_REST_API_TOKEN</li>
            <li>Redeploy your application</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
