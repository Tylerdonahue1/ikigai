import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import InteractiveIkigaiDiagram from "@/components/interactive-ikigai-diagram"

export default function PreviewDemoPage() {
  // Mock data for the preview
  const mockData = {
    name: "Tyler Donahue",
    love: "Creating digital content (videos/art), programming, playing music, travel/adventure, comics/anime, and challenging physical and mental puzzles.",
    good: "Exceptional coding and programming skills, data analysis, problem-solving, chess and DIY troubleshooting. Tyler can code for hours when solving problems, and has strong analytical abilities.",
    world:
      "Opportunities in programming for environmental sustainability initiatives, combating misinformation, reduction of plastic pollution, and affordable housing.",
    paid: "Software engineering, technical problem solving, data analysis, content creation (comic writing), and potentially educational programming content.",
    passion:
      "Tyler's passion lies at the intersection of his creative interests in comics/anime and his exceptional programming abilities.",
    mission:
      "Tyler's mission combines his love for creative media and technology with his desire to address environmental and educational challenges.",
    profession:
      "Tyler's professional sweet spot leverages his exceptional coding, data analysis, and problem-solving abilities.",
    vocation:
      "Tyler's vocation combines his concern for educational opportunity, environmental sustainability, and his marketable technical skills.",
    ikigai:
      "Software engineering, technical problem solving, data analysis, content creation (comic writing), and potentially educational programming content.",
  }

  // Add a mock ID and success_url to the demo page for consistency
  const mockId = "demo123"
  const stripePaymentLink = `https://buy.stripe.com/6oE5nc17a6M2f5K4gg?client_reference_id=${mockId}&utm_source=ikigai&utm_medium=redirect&utm_campaign=fullreport&utm_content=${mockId}`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000"
  const successUrl = `${siteUrl}/ikigai/${mockId}`

  return (
    <div className="min-h-screen bg-white py-8 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3D405B] mb-4">
            {mockData.name}'s Ikigai Assessment
          </h1>
          <p className="text-lg md:text-xl text-[#3D405B] font-serif mb-6 md:mb-8">
            Here's a preview of your Ikigai assessment. Unlock the full report to discover your unique purpose.
          </p>
        </div>

        {/* Ikigai Diagram - improved for mobile */}
        <div className="mb-12 md:mb-16">
          <div className="w-full mx-auto">
            <InteractiveIkigaiDiagram data={mockData} />
          </div>
        </div>

        {/* Payment CTA - mobile optimized */}
        <div className="bg-[#F4F1DE] rounded-lg p-6 md:p-8 shadow-md mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#E07A5F] mb-3 md:mb-4 text-center">
            Unlock Your Full Ikigai Report
          </h2>
          <p className="text-base md:text-lg text-[#3D405B] font-serif mb-6 text-center">
            Your full report includes detailed insights, personalized suggestions, and role model inspirations to help
            you live a more fulfilling life aligned with your Ikigai.
          </p>

          <div className="flex justify-center">
            <Button
              asChild
              className="w-full md:w-auto bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none text-lg py-5 md:py-6 px-6 md:px-8"
            >
              <a href={stripePaymentLink} target="_blank" rel="noopener noreferrer">
                Unlock Full Report ($29)
              </a>
            </Button>
          </div>
        </div>

        {/* What's Included Section - keeping the 3-column layout as requested */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3D405B] mb-6 md:mb-8 text-center">
            What's Included in the Full Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-white p-5 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-serif font-bold text-[#E07A5F] mb-2 md:mb-3">Detailed Analysis</h3>
              <p className="text-sm md:text-base text-[#3D405B]">
                In-depth exploration of your passions, skills, values, and potential career paths aligned with your
                Ikigai.
              </p>
            </Card>

            <Card className="bg-white p-5 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-serif font-bold text-[#E07A5F] mb-2 md:mb-3">
                Personalized Suggestions
              </h3>
              <p className="text-sm md:text-base text-[#3D405B]">
                Actionable recommendations for projects, careers, and activities that align with your unique Ikigai.
              </p>
            </Card>

            <Card className="bg-white p-5 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-serif font-bold text-[#E07A5F] mb-2 md:mb-3">
                Role Model Inspirations
              </h3>
              <p className="text-sm md:text-base text-[#3D405B]">
                Profiles of people who embody elements of your Ikigai, providing real-world inspiration and insights.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
