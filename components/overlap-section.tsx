import { Card, CardContent } from "@/components/ui/card"
import PassionDiagramLarge from "./passion-diagram-large"
import MissionDiagram from "./mission-diagram"
import VocationDiagram from "./vocation-diagram"
import ProfessionDiagram from "./profession-diagram"

interface OverlapSectionProps {
  title: string
  subtitle: string
  overlap: string
  examples: string[]
  area1: string
  area2: string
  color1: string
  color2: string
  headerColor?: string
}

export default function OverlapSection({
  title,
  subtitle,
  overlap,
  examples,
  area1,
  area2,
  color1,
  color2,
  headerColor = "#3D405B", // Default color if not provided
}: OverlapSectionProps) {
  return (
    <div className="mt-8">
      {" "}
      {/* Added more top margin for spacing */}
      <h2 className={`text-3xl font-serif font-bold text-[${headerColor}] mb-2`}>{title}</h2>
      <p className="text-lg text-[#3D405B] font-serif mb-6">{subtitle}</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-[#F4F1DE] shadow-md">
          <CardContent className="p-6">
            <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-3">Overlap</h3>
            <p className="text-lg text-[#3D405B] font-serif">{overlap}</p>
          </CardContent>
        </Card>

        {/* Diagram container - on white background */}
        <div className="flex items-center justify-center p-4">
          <div className="w-full h-[300px] flex items-center justify-center">
            {title === "Passion" && <PassionDiagramLarge />}
            {title === "Mission" && <MissionDiagram />}
            {title === "Vocation" && <VocationDiagram />}
            {title === "Profession" && <ProfessionDiagram />}
            {title !== "Passion" && title !== "Mission" && title !== "Vocation" && title !== "Profession" && (
              <div className="relative w-48 h-48">
                <div className={`absolute w-32 h-32 rounded-full top-0 left-0 ${color1} opacity-60`}></div>
                <div className={`absolute w-32 h-32 rounded-full bottom-0 right-0 ${color2} opacity-60`}></div>
                <div className="absolute top-0 left-0 text-base font-bold text-[#3D405B]">{area1}</div>
                <div className="absolute bottom-0 right-0 text-base font-bold text-[#3D405B]">{area2}</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-serif font-bold text-[#E07A5F]">
                  {title}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Card className="bg-[#F4F1DE] shadow-md">
        <CardContent className="p-6">
          <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-3">Examples</h3>
          <ul className="list-disc pl-5 space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="text-lg text-[#3D405B] font-serif">
                {example}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

