"use client"

import { Card, CardContent } from "@/components/ui/card"
import BuildingBlocks from "@/components/building-blocks"
import OverlapSection from "@/components/overlap-section"
import IkigaiIcons from "@/components/ikigai-icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Share2 } from "lucide-react"
import InteractiveDiagram from "./InteractiveDiagram"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share"

interface DashboardProps {
  initialData: any
  id: string
  isPaid?: boolean
}

export default function Dashboard({ initialData, id, isPaid = false }: DashboardProps) {
  // In your Dashboard component, add this near the top
  console.log("Dashboard received data:", initialData)
  console.log("Name from initialData:", initialData.name)
  const [activeTab, setActiveTab] = useState("building-blocks")
  const [copied, setCopied] = useState(false)
  // If no data is provided, show a loading state
  if (!initialData) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl  font-bold text-[#3D405B] mb-8">Loading Ikigai Assessment...</h1>
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
          <h1 className="text-4xl  font-bold text-[#3D405B] mb-8">Limited Access</h1>
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

  // Get the current URL for sharing
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareTitle = `Check out ${name}'s Ikigai Analysis`

  // Full paid content
  return (
    <div className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-between md:items-center items-start gap-2 mb-6 md:flex-row flex-col ">
            <h1 className="text-4xl font-[600] text-[#3D405B]">{name || "Anonymous User"}</h1>
            <div className="flex items-center justify-end gap-4">
              <p className="text-[#3D405B] text-base leading-[1.62]  font-[600]">
                <span className="text-[#3D405B]">{completionDate.split(" ")[0]}</span>
                <span className="text-[#3D405B]">, </span>
                <span className="text-[#E07A5F]">{completionDate.split(" ")[1]}</span>
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#E07A5F] text-white hover:bg-[#E07A5F] hover:text-white hover:opacity-80 transition-all text-[16px] font-[500]">
                    Share <Share2 className="size-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-[#F4F1DE]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#3D405B] mb-4">
                      Share Your Ikigai Analysis
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center gap-4">
                      {/* @ts-ignore */}
                      <FacebookShareButton url={shareUrl} quote={shareTitle}>
                        <FacebookIcon size={40} round />
                      </FacebookShareButton>

                      <TwitterShareButton url={shareUrl} title={shareTitle}>
                        <TwitterIcon size={40} round />
                      </TwitterShareButton>

                      <LinkedinShareButton url={shareUrl} title={shareTitle}>
                        <LinkedinIcon size={40} round />
                      </LinkedinShareButton>

                      <WhatsappShareButton url={shareUrl} title={shareTitle}>
                        <WhatsappIcon size={40} round />
                      </WhatsappShareButton>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                      />
                      <Button
                        className="bg-[#E07A5F] text-white hover:bg-[#E07A5F]/90 min-w-[80px]"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl)
                          setCopied(true)
                          // Reset the copied state after 2 seconds
                          setTimeout(() => setCopied(false), 2000)
                        }}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <p className="text-[#3D405B]">{ikigaiSummary}</p>
        </div>

        {/* Ikigai Diagram */}
        <div className="flex justify-center ">
          <div className="w-full ">
            <InteractiveDiagram />
          </div>
        </div>

        <div className="md:hidden mb-8 tabs-wrapper">
          <Select defaultValue="building-blocks" value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full bg-[#FFF] border-[#CBD5E1] border border-b-[4px] text-[#3D405B] border-b-[#E07A5F]">
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="focus:bg-[#F4F1DE] font-[400] text-[#334155] text-base" value="building-blocks">
                Your Building Blocks
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="passion"
              >
                Passion
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="mission"
              >
                Mission
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="vocation"
              >
                Vocation
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="profession"
              >
                Profession
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="ikigai"
              >
                Your Ikigai
              </SelectItem>
              <SelectItem
                className="focus:bg-[#F4F1DE] text-[#334155] font-[400] focus:text-[#334155] text-base"
                value="role-models"
              >
                Inspiration
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="building-blocks" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden md:flex w-full justify-start border-b bg-transparent pb-0  mb-8 overflow-x-auto">
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="building-blocks"
            >
              Your Building Blocks
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="passion"
            >
              Passion
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="mission"
            >
              Mission
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="vocation"
            >
              Vocation
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="profession"
            >
              Profession
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="ikigai"
            >
              Your Ikigai
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:border-b-[3px] shadow-none rounded-none  top-[1px] data-[state=active]:border-[#E07A5F] relative"
              value="role-models"
            >
              Inspiration
            </TabsTrigger>
          </TabsList>

          {/* Building Blocks */}
          <TabsContent value="building-blocks">
            <BuildingBlocks data={buildingBlocks} />
          </TabsContent>

          {/* Passion Section */}
          <TabsContent value="passion">
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
          </TabsContent>

          {/* Mission Section */}
          <TabsContent value="mission">
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
          </TabsContent>

          {/* Vocation Section */}
          <TabsContent value="vocation">
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
          </TabsContent>

          {/* Profession Section */}
          <TabsContent value="profession">
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
          </TabsContent>

          {/* Ikigai Section */}
          <TabsContent value="ikigai">
            <h2 className="text-3xl  font-bold text-[#E07A5F] mb-6 hidden">Your Ikigai</h2>
            <p className="text-[#3D405B]  mb-6">
              Your unique purpose at the intersection of passion, mission, vocation, and profession
            </p>

            <Card className="bg-[#F4F1DE] shadow-md mb-6">
              <CardContent className="p-6">
                <h3 className="text-2xl  font-bold text-[#3D405B] mb-3">Your Ikigai</h3>
                <p className="text-base leading-[1.62] text-[#3D405B] ">{ikigai.overlap}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#FFF] border border-[#E07A5F] shadow-md">
              <CardContent className="p-6">
                <h3 className="text-2xl  font-bold text-[#3D405B] mb-3">Suggestions</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {ikigai.examples.map((example: string, index: number) => (
                    <li key={index} className="text-base leading-[1.62] text-[#3D405B] ">
                      {example}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ikigai Icons */}
          <TabsContent value="role-models">
            <h2 className="text-3xl  font-bold text-[#E07A5F] mb-6 hidden">Role Models & Inspiration</h2>
            <p className="text-[#3D405B] mb-6">
              People who embody elements of your Ikigai and can serve as inspiration
            </p>

            <IkigaiIcons icons={ikigaiIcons} />
            <Card className="bg-[#F4F1DE] md:mt-10 mt-5 shadow-md">
              <CardContent className="p-6">
                <p className="text-base text-[#3D405B] ">{emergingPatterns}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#F4F1DE] md:mt-10 mt-5 shadow-md">
              <CardContent className="p-6">
                <ul className="list-disc pl-5 space-y-2">
                  {suggestedResources.map((resource: string, index: number) => (
                    <li key={index} className="text-base leading-[1.62] text-[#3D405B] ">
                      {resource}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggested Resources */}
          {/* <TabsContent value="resources">
          <h2 className="text-3xl  font-bold text-[#E07A5F] mb-6">Suggested Resources</h2>
          
        </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}
