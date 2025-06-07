"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  // Page 1: Welcome & Purpose
  firstName: string
  email: string
  primaryReason: string

  // Page 2: Interests
  activities: string[]
  enjoymentRatings: Record<string, number>
  additionalInterests: string

  // Page 3: Skills
  skillStatements: string[]
  skillConfidence: Record<string, number>
  additionalSkills: string

  // Page 4: Career & Goals
  currentWork: string[]
  nextChapterPriorities: string[]
  workEnergyRatings: Record<string, number>
  futureVision: string
  burningQuestion: string

  // Page 5: Impact
  causePassion: Record<string, number>
  heartCauses: string[]
  additionalCauses: string
}

const initialFormData: FormData = {
  firstName: "",
  email: "",
  primaryReason: "",
  activities: [],
  enjoymentRatings: {},
  additionalInterests: "",
  skillStatements: [],
  skillConfidence: {},
  additionalSkills: "",
  currentWork: [],
  nextChapterPriorities: [],
  workEnergyRatings: {},
  futureVision: "",
  burningQuestion: "",
  causePassion: {},
  heartCauses: [],
  additionalCauses: "",
}

const primaryReasonOptions = [
  "I'm trying to figure out what to do with my life",
  "I want to make a career pivot",
  "I'm looking to turn my passion into income",
  "I'm happy in my career but want more meaning",
  "I'm exploring new business or creative ideas",
  "I'm building something and want to align it to my purpose",
  "I just want to understand myself better",
]

const activitiesOptions = [
  "Playing or composing music",
  "Designing and leading community events",
  "Launching new businesses and ventures",
  "Creating handmade physical goods",
  "Telling stories through video or writing",
  "Expressing creativity through visual arts",
  "Solving complex problems and puzzles",
  "Building and experimenting with new technology",
  "I just love Excel and looking at data",
  "Exploring new places and cultures",
  "Pursuing fitness and holistic wellness goals/ biohacking",
  "Investigating deep topics and theories",
  "Performing in front of live audiences",
  "Designing digital products and experiences",
  "Supporting emotional growth and healing",
  "Gardening / Growing sustainable food and living systems",
  "Immersing in nature and outdoor adventures",
  "Engaging deeply in fandom and storytelling worlds",
  "Mastering games and gaming communities",
  "Crafting stories, essays, or literary works",
  "Exploring big ideas about life and existence",
  "Practicing holistic and alternative healing/ energy healing",
  "Inventing gadgets, tools, and innovations",
  "Hosting / Creating welcoming and memorable experiences",
  "Caring for others' wellbeing and growth",
  "Collecting and preserving meaningful artifacts",
  "Seeking spiritual growth and wisdom",
  "Curating fashion, interior, or brand aesthetics",
  "Cooking or experimenting with new recipes",
  "Playing sports / competing",
  "Helping or teaching others (mentoring, coaching, tutoring)",
  "Solving puzzles, brainteasers, or strategy games",
  "Volunteering or engaging in community projects",
  "Going to live events or concerts",
  "Engrossing yourself in DIY projects or home improvements",
]

const enjoymentCategories = [
  "Organizing or leading community events",
  "Expressing yourself creatively",
  "Solving puzzles or designing systems",
  "Starting businesses or creating inventions",
  "Supporting others' growth and healing",
  "Physical challenges or adventurous activities",
  "Being in nature or building sustainable lifestyles",
  "Learning deeply and sharing knowledge",
  "Immersive worlds like gaming/fandom",
  "Mindfulness, reflection, and spiritual exploration",
  "Working with hands / DIY",
]

const skillStatements = [
  "I'm a Builder",
  "I'm a Problem Solver",
  "I'm a Strategist",
  "I'm a Creator",
  "I'm a Connector",
  "I'm a Visionary",
  "I'm a Thinker",
  "I'm a Healer",
  "I'm a Systems Person",
  "I'm a Performer",
  "I'm a Marketer",
]

const currentWorkOptions = [
  "Marketing",
  "Sales",
  "Product Management",
  "Software Engineering",
  "Design",
  "Operations",
  "Finance",
  "Human Resources",
  "Customer Success",
  "Data Science",
  "Consulting",
  "Education",
  "Healthcare",
  "Legal",
  "Non-profit",
  "Entrepreneurship",
  "Creative Arts",
  "Research",
  "Manufacturing",
  "Retail",
  "Hospitality",
  "Real Estate",
  "Agriculture",
  "Government",
  "Other",
]

const nextChapterOptions = [
  "Flexibility and work-life balance",
  "Creative expression and innovation",
  "Recognition and advancement",
  "Values alignment and purpose",
  "Financial security and growth",
  "Learning and skill development",
  "Leadership and influence",
  "Collaboration and teamwork",
  "Independence and autonomy",
  "Making a positive impact",
  "Stability and predictability",
]

const workEnergyTypes = [
  "Independent work",
  "Collaborative work",
  "Creative work",
  "Operational work",
  "Leadership",
  "Relational work",
  "Hands-on work",
  "Analytical work",
  "Performance work",
]

const causeCategories = [
  "Environmental Sustainability & Climate Action",
  "Health & Wellness",
  "Education & Skill-Building",
  "Social Justice & Equity",
  "Economic Development & Entrepreneurship",
  "Arts, Culture & Creativity",
  "Technology & Innovation",
  "Animal Welfare & Wildlife Conservation",
]

const heartCausesOptions = [
  "Mental health awareness and support",
  "Climate justice and environmental protection",
  "Youth mentorship and development",
  "AI ethics and responsible technology",
  "Economic inequality and poverty reduction",
  "Gender equality and women's rights",
  "Racial justice and civil rights",
  "LGBTQ+ rights and inclusion",
  "Refugee and immigrant support",
  "Elder care and aging with dignity",
  "Disability rights and accessibility",
  "Food security and nutrition",
  "Clean water and sanitation",
  "Quality education for all",
  "Healthcare access and affordability",
  "Criminal justice reform",
  "Arts education and cultural preservation",
  "Animal rights and welfare",
  "Wildlife conservation",
  "Sustainable agriculture",
  "Renewable energy",
  "Ocean conservation",
  "Space exploration and science",
  "Digital privacy and security",
  "Community development",
  "Homelessness prevention",
  "Addiction recovery support",
  "Veterans affairs and support",
  "Child welfare and protection",
  "Global peace and conflict resolution",
]

export function AssessmentForm() {
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const totalPages = 5
  const progress = (currentPage / totalPages) * 100

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleArrayToggle = (array: string[], value: string, maxSelections?: number) => {
    if (array.includes(value)) {
      return array.filter((item) => item !== value)
    } else {
      if (maxSelections && array.length >= maxSelections) {
        return array
      }
      return [...array, value]
    }
  }

  const handleRatingChange = (category: string, value: number, ratingType: keyof FormData) => {
    const currentRatings = formData[ratingType] as Record<string, number>
    updateFormData({
      [ratingType]: {
        ...currentRatings,
        [category]: value,
      },
    })
  }

  const canProceed = () => {
    switch (currentPage) {
      case 1:
        return formData.firstName && formData.email && formData.primaryReason
      case 2:
        return formData.activities.length > 0
      case 3:
        return formData.skillStatements.length > 0
      case 4:
        return formData.currentWork.length > 0
      case 5:
        return formData.heartCauses.length > 0
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/process-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const { id } = await response.json()
        router.push(`/processing/${id}`)
      } else {
        throw new Error("Failed to submit assessment")
      }
    } catch (error) {
      console.error("Error submitting assessment:", error)
      alert("There was an error submitting your assessment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Ikigai Journey</h1>
              <p className="text-lg text-gray-600">Let's discover your reason for being</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData({ firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <Label>Primary reason for exploring Ikigai? *</Label>
                <RadioGroup
                  value={formData.primaryReason}
                  onValueChange={(value) => updateFormData({ primaryReason: value })}
                  className="mt-2"
                >
                  {primaryReasonOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Interests</h1>
              <p className="text-lg text-gray-600">What activities resonate with you?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Which activities resonate with you most? (Pick up to 5) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {activitiesOptions.map((activity) => (
                    <div key={activity} className="flex items-center space-x-2">
                      <Checkbox
                        id={activity}
                        checked={formData.activities.includes(activity)}
                        onCheckedChange={() => {
                          const newActivities = handleArrayToggle(formData.activities, activity, 5)
                          updateFormData({ activities: newActivities })
                        }}
                      />
                      <Label htmlFor={activity} className="text-sm">
                        {activity}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.activities.length}/5</p>
              </div>

              <div>
                <Label>Rate your enjoyment of these categories (1 = Not at all, 5 = Very passionate)</Label>
                <div className="space-y-3 mt-2">
                  {enjoymentCategories.map((category) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <RadioGroup
                        value={formData.enjoymentRatings[category]?.toString() || ""}
                        onValueChange={(value) =>
                          handleRatingChange(category, Number.parseInt(value), "enjoymentRatings")
                        }
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex items-center space-x-1">
                            <RadioGroupItem value={rating.toString()} id={`${category}-${rating}`} />
                            <Label htmlFor={`${category}-${rating}`} className="text-xs">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additionalInterests">
                  Anything else you want to add about your interests? (Optional)
                </Label>
                <Textarea
                  id="additionalInterests"
                  value={formData.additionalInterests}
                  onChange={(e) => updateFormData({ additionalInterests: e.target.value })}
                  placeholder="Tell us more about your interests..."
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Skills</h1>
              <p className="text-lg text-gray-600">What are you naturally good at?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Which skill-based statements describe you best? (Pick up to 4) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {skillStatements.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skillStatements.includes(skill)}
                        onCheckedChange={() => {
                          const newSkills = handleArrayToggle(formData.skillStatements, skill, 4)
                          updateFormData({ skillStatements: newSkills })
                        }}
                      />
                      <Label htmlFor={skill} className="text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.skillStatements.length}/4</p>
              </div>

              <div>
                <Label>Rate your confidence in the following skill areas (1-5)</Label>
                <div className="space-y-3 mt-2">
                  {skillStatements.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm">{skill}</span>
                      <RadioGroup
                        value={formData.skillConfidence[skill]?.toString() || ""}
                        onValueChange={(value) => handleRatingChange(skill, Number.parseInt(value), "skillConfidence")}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex items-center space-x-1">
                            <RadioGroupItem value={rating.toString()} id={`skill-${skill}-${rating}`} />
                            <Label htmlFor={`skill-${skill}-${rating}`} className="text-xs">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additionalSkills">How else would you describe your skills? (Optional)</Label>
                <Textarea
                  id="additionalSkills"
                  value={formData.additionalSkills}
                  onChange={(e) => updateFormData({ additionalSkills: e.target.value })}
                  placeholder="Tell us more about your skills..."
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Career & Goals</h1>
              <p className="text-lg text-gray-600">What drives your professional life?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>What kind of work do you currently do (or most recently did)? (Pick 1 or 2) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {currentWorkOptions.map((work) => (
                    <div key={work} className="flex items-center space-x-2">
                      <Checkbox
                        id={work}
                        checked={formData.currentWork.includes(work)}
                        onCheckedChange={() => {
                          const newWork = handleArrayToggle(formData.currentWork, work, 2)
                          updateFormData({ currentWork: newWork })
                        }}
                      />
                      <Label htmlFor={work} className="text-sm">
                        {work}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.currentWork.length}/2</p>
              </div>

              <div>
                <Label>What's most important in your next chapter? (Pick up to 3)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {nextChapterOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.nextChapterPriorities.includes(option)}
                        onCheckedChange={() => {
                          const newPriorities = handleArrayToggle(formData.nextChapterPriorities, option, 3)
                          updateFormData({ nextChapterPriorities: newPriorities })
                        }}
                      />
                      <Label htmlFor={option} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.nextChapterPriorities.length}/3</p>
              </div>

              <div>
                <Label>What types of work energize you? (1 = drains you, 5 = energizes you)</Label>
                <div className="space-y-3 mt-2">
                  {workEnergyTypes.map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <RadioGroup
                        value={formData.workEnergyRatings[type]?.toString() || ""}
                        onValueChange={(value) => handleRatingChange(type, Number.parseInt(value), "workEnergyRatings")}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex items-center space-x-1">
                            <RadioGroupItem value={rating.toString()} id={`work-${type}-${rating}`} />
                            <Label htmlFor={`work-${type}-${rating}`} className="text-xs">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="futureVision">
                    If everything went right, what would your work life look like in 3 years? (Optional)
                  </Label>
                  <Textarea
                    id="futureVision"
                    value={formData.futureVision}
                    onChange={(e) => updateFormData({ futureVision: e.target.value })}
                    placeholder="Describe your ideal work life..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="burningQuestion">
                    What burning question or dream keeps coming back to you? (Optional)
                  </Label>
                  <Textarea
                    id="burningQuestion"
                    value={formData.burningQuestion}
                    onChange={(e) => updateFormData({ burningQuestion: e.target.value })}
                    placeholder="Share your recurring thoughts or dreams..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Impact</h1>
              <p className="text-lg text-gray-600">What causes matter to you?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Rate your passion for each of these causes (1-5)</Label>
                <div className="space-y-3 mt-2">
                  {causeCategories.map((cause) => (
                    <div key={cause} className="flex items-center justify-between">
                      <span className="text-sm">{cause}</span>
                      <RadioGroup
                        value={formData.causePassion[cause]?.toString() || ""}
                        onValueChange={(value) => handleRatingChange(cause, Number.parseInt(value), "causePassion")}
                        className="flex space-x-2"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div key={rating} className="flex items-center space-x-1">
                            <RadioGroupItem value={rating.toString()} id={`cause-${cause}-${rating}`} />
                            <Label htmlFor={`cause-${cause}-${rating}`} className="text-xs">
                              {rating}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Which causes resonate most with your heart? (Pick up to 5) *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                  {heartCausesOptions.map((cause) => (
                    <div key={cause} className="flex items-center space-x-2">
                      <Checkbox
                        id={cause}
                        checked={formData.heartCauses.includes(cause)}
                        onCheckedChange={() => {
                          const newCauses = handleArrayToggle(formData.heartCauses, cause, 5)
                          updateFormData({ heartCauses: newCauses })
                        }}
                      />
                      <Label htmlFor={cause} className="text-sm">
                        {cause}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Selected: {formData.heartCauses.length}/5</p>
              </div>

              <div>
                <Label htmlFor="additionalCauses">Any other causes you'd like to support? (Optional)</Label>
                <Textarea
                  id="additionalCauses"
                  value={formData.additionalCauses}
                  onChange={(e) => updateFormData({ additionalCauses: e.target.value })}
                  placeholder="Tell us about other causes that matter to you..."
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="text-sm text-gray-500">{Math.round(progress)}% Complete</div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>

          <CardContent className="pt-6">
            {renderPage()}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentPage === totalPages ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <span>{isSubmitting ? "Submitting..." : "Complete Assessment"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
