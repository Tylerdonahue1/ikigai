import Link from "next/link";
import { Button } from "@/components/ui/button";
import InteractiveDiagram from "@/components/InteractiveDiagram"

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex mb-6 justify-between gap-4 md:flex-row flex-col md:items-center items-start">
          <h1 className="md:text-6xl text-4xl  font-bold text-[#3D405B] ">
            Tyler Donahue
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[#3D405B]">

              <span className="text-[#3D405B]">
                2025-03-20
              </span>
              <span className="text-[#3D405B]">, </span>
              <span className="text-[#E07A5F]">
                2:32:33
              </span>
            </p>
            <Button
              asChild
              className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none text-lg"
            >
              <Link href={`${process.env.FRONTEND_URL}`}>Build your ikigai</Link>
            </Button>
          </div>
        </div>

        <p className="text-[18px] mb-8 text-[#3D405B]">
          This document presents the results of your Ikigai assessment, guiding
          you toward the discovery of your unique purpose in life. Ikigai, a
          Japanese concept meaning "a reason for being," is found at the
          intersection of what you love, what you are good at, what you can be
          paid for, and what the world needs. This report will explore each of
          these areas and their overlaps, ultimately helping you to identify
          your Ikigai and live a more fulfilling life.
        </p>

        <div>
         <InteractiveDiagram  />
        </div>
      </div>
    </main>
  );
}
