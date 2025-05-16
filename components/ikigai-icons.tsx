import { Card, CardContent } from "@/components/ui/card"

interface Icon {
  name: string
  description: string
  matchReason: string
  relevantWork: string
  keyInsight: string
}

interface IkigaiIconsProps {
  icons: Icon[]
}

export default function IkigaiIcons({ icons }: IkigaiIconsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {icons.map((icon, index) => (
        <Card key={index} className="bg-[#F4F1DE] shadow-md">
          <CardContent className="p-6">
            <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-2">{icon.name}</h3>
            <p className="text-base text-[#3D405B] font-serif mb-4">{icon.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Match Reason</h4>
                <p className="text-lg text-[#3D405B] font-serif">{icon.matchReason}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Relevant Work</h4>
                <p className="text-lg text-[#3D405B] font-serif">{icon.relevantWork}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Key Insight</h4>
                <p className="text-lg text-[#3D405B] font-serif">{icon.keyInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

