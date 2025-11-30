import { Redis } from "@upstash/redis"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import InteractiveIkigaiDiagram from "@/components/interactive-ikigai-diagram"
import Link from "next/link"

// Initialize Redis client with the provided environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface PageProps {
  params: {
    id: string
  }
}

export default async function IkigaiPreviewPage({ params }: PageProps) {
  const { id } = params

  try {
    console.log("Fetching ikigai data for preview, ID:", id)

    // Fetch the ikigai data from Upstash Redis
    const ikigaiData = await redis.get<any>(`ikigai:${id}`)

    // If no data is found, return a 404
    if (!ikigaiData) {
      console.log("No data found for ID:", id)
      return notFound()
    }

    console.log("Data found for ID:", id)

    const payment = await redis.get<any>(`payment:${id}`)
    const isPaid = payment && payment.paid === true

    // If not paid, redirect to preview page
    // if (isPaid) {
    //   console.log("Payment not found, redirecting to preview")
    //   return redirect(`/ikigai/${id}`)
    // }

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

    // Extract the data needed for the preview
    const previewData = {
      love: parsedData.buildingBlocks.love,
      good: parsedData.buildingBlocks.good,
      world: parsedData.buildingBlocks.world,
      paid: parsedData.buildingBlocks.paid,
      passion: parsedData.passion.overlap,
      mission: parsedData.mission.overlap,
      vocation: parsedData.vocation.overlap,
      profession: parsedData.profession.overlap,
      ikigai: parsedData.ikigai.overlap,
    }

    // Update the payment link section to use UTM parameters
    const stripePaymentLink = `https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id=${id}&utm_source=ikigai&utm_medium=redirect&utm_campaign=fullreport&utm_content=${id}`
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000"
    const successUrl = `${siteUrl}/ikigai/${id}`

    return (
      <div className="min-h-screen bg-white py-8 md:py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-4xl  font-bold text-[#3D405B] mb-4">
              {parsedData.name}'s Ikigai Assessment
            </h1>
            <p className="text-[#3D405B]  mb-6 md:mb-8">
              Here's a preview of your Ikigai assessment. Unlock the full report to discover your unique purpose.
            </p>
          </div>

          {/* Ikigai Diagram - improved for mobile */}
          <div className="mb-12 md:mb-16">
            <div className="w-full mx-auto">
              <InteractiveIkigaiDiagram className="font-[Space_Grotesk]" data={previewData} />
            </div>
          </div>

          {/* Payment CTA - mobile optimized */}
          <div className="bg-[#F4F1DE] rounded-lg p-6 md:p-8 shadow-md mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl  font-bold text-[#E07A5F] mb-3 md:mb-4 text-center">
             {isPaid ? "View":" Unlock"} Your Full Ikigai Report
            </h2>
            <p className="text-base leading-[1.62] text-[#3D405B] mb-6 text-center">
              Your full report includes detailed insights, personalized suggestions, and role model inspirations to help you live a more fulfilling life aligned with your Ikigai.
            </p>

            <div className="flex justify-center">
             {isPaid ? (<>
              <Button
                asChild
                className="w-full md:w-auto bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none text-lg py-5 md:py-6 px-6 md:px-8"
              >
                  <Link href={`/ikigai/${id}`} >
                   View Full Report
                </Link>
              </Button>
             </>):(
              <>
               <Button
                asChild
                className="w-full md:w-auto bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none text-lg py-5 md:py-6 px-6 md:px-8"
              >
              
                  <a href={stripePaymentLink} target="_blank" rel="noopener noreferrer">
                  {isPaid ? "View Full Report" : "Unlock Full Report ($29)"}
                </a>
                
              </Button>
              </>
             )}
            </div>
          </div>

          {/* What's Included - keeping the 3-column layout as requested */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl  font-bold text-[#3D405B] mb-6 md:mb-8 text-center">
              What's Included in the Full Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-white hover:bg-[#F4F1DE] transition-all p-5 md:p-6 rounded-lg shadow-md">
                <h3 className="text-lg md:text-xl  font-bold text-[#E07A5F] mb-2 md:mb-3">
                  Detailed Analysis
                </h3>
                <p className="text-base leading-[1.62] text-[#3D405B]">
                  In-depth exploration of your passions, skills, values, and potential career paths aligned with your
                  Ikigai.
                </p>
              </Card>

              <Card className="bg-white hover:bg-[#F4F1DE] transition-all p-5 md:p-6 rounded-lg shadow-md">
                <h3 className="text-lg md:text-xl  font-bold text-[#E07A5F] mb-2 md:mb-3">
                  Personalized Suggestions
                </h3>
                <p className="text-base leading-[1.62]  text-[#3D405B]">
                  Actionable recommendations for projects, careers, and activities that align with your unique Ikigai.
                </p>
              </Card>

              <Card className="bg-white hover:bg-[#F4F1DE] transition-all p-5 md:p-6 rounded-lg shadow-md">
                <h3 className="text-lg md:text-xl  font-bold text-[#E07A5F] mb-2 md:mb-3">
                  Inspiration
                </h3>
                <p className="text-base leading-[1.62]  text-[#3D405B]">
                  Profiles of people who embody elements of your Ikigai, providing real-world inspiration and insights.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching ikigai data for preview:", error)
    throw error
  }
}
