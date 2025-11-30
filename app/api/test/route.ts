import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working!",
    env: {
      url: process.env.KV_REST_API_URL ? "Set" : "Not set",
      token: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
      site: process.env.SITE_URL || "Not set",
    },
  })
}
