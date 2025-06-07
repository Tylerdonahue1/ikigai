"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, Play } from "lucide-react"

export default function SystemStatusPage() {
  const [healthData, setHealthData] = useState<any>(null)
  const [fullTestData, setFullTestData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/system-health")
      const data = await response.json()
      setHealthData(data)
    } catch (error) {
      console.error("Health check failed:", error)
    }
    setLoading(false)
  }

  const runFullTest = async () => {
    setTestLoading(true)
    try {
      const response = await fetch("/api/test-full-flow", { method: "POST" })
      const data = await response.json()
      setFullTestData(data)
    } catch (error) {
      console.error("Full test failed:", error)
    }
    setTestLoading(false)
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const StatusIcon = ({ working }: { working: boolean }) => {
    if (working) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🚀 Ikigai System Status</h1>
          <p className="text-lg text-gray-600">Real-time system health and functionality testing</p>
        </div>

        {/* Overall Status */}
        {healthData && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall System Status</span>
                <div className="flex items-center space-x-2">
                  {healthData.overall ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">OPERATIONAL</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="w-6 h-6 mr-2" />
                      <span className="font-bold">ISSUES DETECTED</span>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">Last checked: {healthData.timestamp}</p>
              <div className="text-2xl font-bold">{healthData.status}</div>
            </CardContent>
          </Card>
        )}

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={checkHealth}
            disabled={loading}
            className="h-16 text-lg"
            variant={healthData?.overall ? "default" : "outline"}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Checking System Health...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Run Health Check
              </>
            )}
          </Button>

          <Button onClick={runFullTest} disabled={testLoading} className="h-16 text-lg bg-blue-600 hover:bg-blue-700">
            {testLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Running Full Test...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Test Complete Flow
              </>
            )}
          </Button>
        </div>

        {/* Individual Services */}
        {healthData?.services && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(healthData.services).map(([service, data]: [string, any]) => (
              <Card key={service}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{service.replace(/([A-Z])/g, " $1")}</span>
                    <StatusIcon working={data.working} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium mb-2">{data.status}</div>
                  {data.error && <div className="text-red-600 text-xs mb-2">{data.error}</div>}
                  {data.missing && data.missing.length > 0 && (
                    <div className="text-orange-600 text-xs">Missing: {data.missing.join(", ")}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full Test Results */}
        {fullTestData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>Complete System Test Results</span>
                {fullTestData.success ? (
                  <CheckCircle className="w-6 h-6 ml-2 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 ml-2 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-lg font-bold mb-2">{fullTestData.message}</div>
                {fullTestData.success && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Test ID: {fullTestData.testId}</p>
                    <div className="flex space-x-4">
                      <Button asChild size="sm" variant="outline">
                        <a href={fullTestData.previewUrl} target="_blank" rel="noopener noreferrer">
                          View Preview
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <a href={fullTestData.fullUrl} target="_blank" rel="noopener noreferrer">
                          View Full Report
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {fullTestData.steps && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {Object.entries(fullTestData.steps).map(([step, status]) => (
                    <div key={step} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium">{step.replace(/^\d+_/, "").replace(/_/g, " ")}</div>
                      <div>{status}</div>
                    </div>
                  ))}
                </div>
              )}

              {fullTestData.error && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-800 font-medium">Error Details:</div>
                  <div className="text-red-600 text-sm">{fullTestData.error}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* System Ready Indicator */}
        {healthData?.overall && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">System is Live and Ready!</h2>
              <p className="text-green-700 mb-4">
                Your Ikigai assessment platform is fully operational. Users can now complete assessments and receive
                AI-generated personalized reports.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/">Start Assessment</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
