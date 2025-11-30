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
        <Card key={index} className="bg-[#FFF] shadow-lg border border-[#E2E8F0] transition-all hover:border-[#E07A5F] hover:bg-[#F4F1DE]">
          <CardContent className="p-6">
            <h3 className="text-2xl  font-bold text-[#3D405B] mb-2">{icon.name}</h3>
            <p className="text-base text-[#3D405B]  mb-4">{icon.description}</p>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Match Reason</h4>
                <p className="text-base leading-[1.62] text-[#3D405B] ">{icon.matchReason}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Relevant Work</h4>
                <p className="text-base leading-[1.62] text-[#3D405B] ">{icon.relevantWork}</p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#3D405B]">Key Insight</h4>
                <p className="text-base leading-[1.62] text-[#3D405B]">{icon.keyInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
