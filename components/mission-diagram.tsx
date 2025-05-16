"use client"

interface MissionDiagramProps {
  className?: string
}

export default function MissionDiagram({ className }: MissionDiagramProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="/images/mission.svg"
        alt="Mission diagram showing the overlap between What You Love and What The World Needs"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "400px",
        }}
      />
    </div>
  )
}

