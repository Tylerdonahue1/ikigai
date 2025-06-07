"use client"

interface VocationDiagramProps {
  className?: string
}

export default function VocationDiagram({ className }: VocationDiagramProps) {
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
        src="/images/vocation.svg"
        alt="Vocation diagram showing the overlap between What The World Needs and What You Can Get Paid For"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "400px",
        }}
      />
    </div>
  )
}
