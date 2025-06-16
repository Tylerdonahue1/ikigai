import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test with a simple fetch to Upstash REST API
    const url = process.env.STORAGE_URL
    const token = process.env.STORAGE_TOKEN

    if (!url || !token) {
      return NextResponse.json({
        success: false,
        error: "Missing Redis credentials",
        missing: {
          url: !url,
          token: !token,
        },
        help: "Visit /api/fix-redis-config for setup instructions",
      })
    }

    // Simple REST API test
    const testKey = `simple-test-${Date.now()}`
    const testValue = "Hello Redis!"

    // SET operation
    const setResponse = await fetch(`${url}/set/${testKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testValue),
    })

    if (!setResponse.ok) {
      throw new Error(`SET failed: ${setResponse.status} ${setResponse.statusText}`)
    }

    // GET operation
    const getResponse = await fetch(`${url}/get/${testKey}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!getResponse.ok) {
      throw new Error(`GET failed: ${getResponse.status} ${getResponse.statusText}`)
    }

    const result = await getResponse.json()

    // DELETE operation
    await fetch(`${url}/del/${testKey}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Redis connection successful!",
      testResult: result,
      credentials: {
        url: url.substring(0, 30) + "...",
        tokenLength: token.length,
      },
    })
  } catch (error) {
    console.error("Simple Redis test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        help: "Visit /api/fix-redis-config for setup instructions",
      },
      { status: 500 },
    )
  }
}
