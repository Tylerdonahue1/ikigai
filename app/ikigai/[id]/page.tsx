import { Redis } from "@upstash/redis"
import { notFound, redirect } from "next/navigation"
import Dashboard from "@/components/dashboard"

// Initialize Redis client with the provided environment variables
const redis = new Redis({
  url: process.env.STORAGE_URL!, // Or your new URL variable name
  token: process.env.STORAGE_TOKEN!, // Or your new TOKEN variable name
})

interface PageProps {
  params: {
    id: string
  }
}

export default async function IkigaiPage({ params }: PageProps) {
  const { id } = params

  try {
    console.log("Fetching ikigai data for ID:", id)

    // Check if payment has been made
    const payment = await redis.get<any>(`payment:${id}`)
    const isPaid = !!payment && payment.paid === true

    // If not paid, redirect to preview page
    if (!isPaid) {
      console.log("Payment not found, redirecting to preview")
      return redirect(`/ikigai/${id}/preview`)
    }

    // Fetch the ikigai data from Upstash Redis
    const ikigaiData = await redis.get<any>(`ikigai:${id}`)

    // If no data is found, return a 404
    if (!ikigaiData) {
      console.log("No data found for ID:", id)
      return notFound()
    }

    console.log("Data found for ID:", id)

    // Handle the data based on its type
    let parsedData
    if (typeof ikigaiData === "string") {
      try {
        parsedData = JSON.parse(ikigaiData)
      } catch (error) {
        console.error("Error parsing JSON:", error)
        throw new Error("Failed to parse data")
      }
    } else {
      // If it's already an object, use it directly
      parsedData = ikigaiData
    }

    return <Dashboard initialData={parsedData} id={id} isPaid={isPaid} />
  } catch (error) {
    console.error("Error fetching ikigai data:", error)
    throw error
  }
}
