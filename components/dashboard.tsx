import { Card, CardContent } from "@/components/ui/card"
import IkigaiDiagram from "@/components/ikigai-diagram"
import BuildingBlocks from "@/components/building-blocks"
import OverlapSection from "@/components/overlap-section"
import IkigaiIcons from "@/components/ikigai-icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardProps {
  initialData: any
  id: string
  isPaid?: boolean
}

export default function Dashboard({ initialData, id, isPaid = false }: DashboardProps) {
  // In your Dashboard component, add this near the top
  console.log("Dashboard received data:", initialData)
  console.log("Name from initialData:", initialData.name)

  // If no data is provided, show a loading state
  if (!initialData) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-[#3D405B] mb-8">Loading Ikigai Assessment...</h1>
        </div>
      </div>
    )
  }

  const {
    name,
    completionDate,
    ikigaiSummary,
    buildingBlocks,
    passion,
    mission,
    vocation,
    profession,
    ikigai,
    ikigaiIcons,
    emergingPatterns,
    suggestedResources,
  } = initialData

  // If not paid, redirect to preview page (this should be handled at the page level)
  // This is just a fallback
  if (!isPaid) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-serif font-bold text-[#3D405B] mb-8">Limited Access</h1>
          <p className="text-xl mb-8">Please purchase the full report to access all content.</p>
          <Button asChild className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none">
            <a
              href={`https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id=${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Unlock Full Report ($29)
            </a>
          </Button>
        </div>
      </div>
    )
  }

  // Full paid content
  return (
    <div className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-serif font-bold text-[#3D405B]">{name || "Anonymous User"}</h1>
            <Button asChild variant="outline" className="border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F]/10">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
          <p className="text-lg text-[#3D405B] font-serif mb-2">{completionDate}</p>
          <p className="text-xl text-[#3D405B] font-serif">{ikigaiSummary}</p>
        </div>

        {/* Ikigai Diagram */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-xl">
            <IkigaiDiagram className="w-full" />
          </div>
        </div>

        {/* Building Blocks */}
        <div className="mb-16">
          <BuildingBlocks data={buildingBlocks} />
        </div>

        {/* Passion Section */}
        <div className="mb-16">
          <OverlapSection
            title="Passion"
            subtitle="What you love and what you're good at"
            overlap={passion.overlap}
            examples={passion.examples}
            area1="What You Love"
            area2="What You Are Good At"
            color1="bg-red-200"
            color2="bg-yellow-200"
            headerColor="#E07A5F"
          />
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <OverlapSection
            title="Mission"
            subtitle="What you love and what the world needs"
            overlap={mission.overlap}
            examples={mission.examples}
            area1="What You Love"
            area2="What The World Needs"
            color1="bg-red-200"
            color2="bg-green-200"
            headerColor="#E07A5F"
          />
        </div>

        {/* Vocation Section */}
        <div className="mb-16">
          <OverlapSection
            title="Vocation"
            subtitle="What the world needs and what you can be paid for"
            overlap={vocation.overlap}
            examples={vocation.examples}
            area1="What The World Needs"
            area2="What You Can Be Paid For"
            color1="bg-green-200"
            color2="bg-blue-200"
            headerColor="#E07A5F"
          />
        </div>

        {/* Profession Section */}
        <div className="mb-16">
          <OverlapSection
            title="Profession"
            subtitle="What you're good at and what you can be paid for"
            overlap={profession.overlap}
            examples={profession.examples}
            area1="What You Are Good At"
            area2="What You Can Be Paid For"
            color1="bg-yellow-200"
            color2="bg-blue-200"
            headerColor="#E07A5F"
          />
        </div>

        {/* Ikigai Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#E07A5F] mb-6">Your Ikigai</h2>
          <p className="text-lg text-[#3D405B] font-serif mb-6">
            Your unique purpose at the intersection of passion, mission, vocation, and profession
          </p>

          <Card className="bg-[#F4F1DE] shadow-md mb-6">
            <CardContent className="p-6">
              <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-3">Your Ikigai</h3>
              <p className="text-lg text-[#3D405B] font-serif">{ikigai.overlap}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F4F1DE] shadow-md">
            <CardContent className="p-6">
              <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-3">Suggestions</h3>
              <ul className="list-disc pl-5 space-y-2">
                {ikigai.examples.map((example: string, index: number) => (
                  <li key={index} className="text-lg text-[#3D405B] font-serif">
                    {example}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Ikigai Icons */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#E07A5F] mb-6">Role Models & Inspiration</h2>
          <p className="text-lg text-[#3D405B] font-serif mb-6">
            People who embody elements of your Ikigai and can serve as inspiration
          </p>

          <IkigaiIcons icons={ikigaiIcons} />
        </div>

        {/* Emerging Patterns */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#E07A5F] mb-6">Emerging Patterns</h2>
          <Card className="bg-[#F4F1DE] shadow-md">
            <CardContent className="p-6">
              <p className="text-lg text-[#3D405B] font-serif">{emergingPatterns}</p>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-[#E07A5F] mb-6">Suggested Resources</h2>
          <Card className="bg-[#F4F1DE] shadow-md">
            <CardContent className="p-6">
              <ul className="list-disc pl-5 space-y-2">
                {suggestedResources.map((resource: string, index: number) => (
                  <li key={index} className="text-lg text-[#3D405B] font-serif">
                    {resource}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
