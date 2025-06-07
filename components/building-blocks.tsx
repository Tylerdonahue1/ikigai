import { Card, CardContent } from "@/components/ui/card"

interface BuildingBlocksProps {
  data: {
    love: string
    good: string
    paid: string
    world: string
  }
}

export default function BuildingBlocks({ data }: BuildingBlocksProps) {
  const blocks = [
    { title: "What You Love", content: data.love, bgColor: "bg-[#F4F1DE]" },
    { title: "What You Are Good At", content: data.good, bgColor: "bg-[#F4F1DE]" },
    { title: "What You Can Get Paid For", content: data.paid, bgColor: "bg-[#F4F1DE]" },
    { title: "What The World Needs", content: data.world, bgColor: "bg-[#F4F1DE]" },
  ]

  return (
    <div>
      <h2 className="text-3xl font-serif font-bold text-[#E07A5F] mb-6">Your Building Blocks</h2>
      <p className="text-lg text-[#3D405B] font-serif mb-6">
        The building blocks of your Ikigai based on your responses
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blocks.map((block, index) => (
          <Card key={index} className={`${block.bgColor} shadow-md`}>
            <CardContent className="p-6">
              <h3 className="text-2xl font-serif font-bold text-[#3D405B] mb-3">{block.title}</h3>
              <p className="text-lg text-[#3D405B] font-serif">{block.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
