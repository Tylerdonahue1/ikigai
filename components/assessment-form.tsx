"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  // Page 1: Welcome & Basic Info
  firstName: string
  email: string
  primaryReason: string

  // Page 2-6: Interests
  activities: string[]
  enjoymentRatings: Record<string, number>
  additionalInterests: string

  // Page 7-9: Skills
  skillStatements: string[]
  skillConfidence: Record<string, number>
  additionalSkills: string

  // Page 10-15: Career & Goals
  currentWork: string[]
  nextChapterPriorities: string[]
  workEnergyRatings: Record<string, number>
  futureVision: string
  burningQuestion: string

  // Page 16-18: Impact
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

// Question definitions for Typeform-style layout
const questions = [
  // Welcome & Basic Info (grouped on first page)
  {
    id: "welcome",
    type: "welcome",
    question: "Welcome to Your Ikigai Journey",
    subtitle: "Let's discover your reason for being",
    fields: [
      {
        id: "firstName",
        type: "text",
        label: "What's your first name?",
        placeholder: "Enter your first name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "What's your email address?",
        placeholder: "Enter your email",
        required: true,
      },
      {
        id: "primaryReason",
        type: "radio",
        label: "What's your primary reason for exploring Ikigai?",
        options: [
          "I'm trying to figure out what to do with my life",
          "I want to make a career pivot",
          "I'm looking to turn my passion into income",
          "I'm happy in my career but want more meaning",
          "I'm exploring new business or creative ideas",
          "I'm building something and want to align it to my purpose",
          "I just want to understand myself better",
        ],
        required: true,
      },
    ],
  },

  // Activities Selection
  {
    id: "activities",
    type: "checkbox",
    question: "Which activities resonate with you most?",
    subtitle: "Select up to 5 activities that you find engaging",
    maxSelections: 5,
    options: [
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
    ],
    required: true,
  },

  // Enjoyment Ratings
  {
    id: "enjoymentRatings",
    type: "rating",
    question: "How much do you enjoy these types of activities?",
    subtitle: "Rate each category from 1 (not at all) to 5 (very passionate)",
    categories: [
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
    ],
  },

  // Additional Interests
  {
    id: "additionalInterests",
    type: "textarea",
    question: "Anything else you want to add about your interests?",
    subtitle: "Feel free to share any other activities or interests that matter to you",
    placeholder: "Tell us more about your interests...",
    required: false,
  },

  // Skills Selection
  {
    id: "skillStatements",
    type: "checkbox",
    question: "Which skill-based statements describe you best?",
    subtitle: "Select up to 4 that resonate most with you",
    maxSelections: 4,
    options: [
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
    ],
    required: true,
  },

  // Skill Confidence
  {
    id: "skillConfidence",
    type: "rating",
    question: "How confident are you in these skill areas?",
    subtitle: "Rate your confidence from 1 (beginner) to 5 (expert)",
    categories: [
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
    ],
  },

  // Additional Skills
  {
    id: "additionalSkills",
    type: "textarea",
    question: "How else would you describe your skills?",
    subtitle: "Share any other abilities, talents, or strengths you have",
    placeholder: "Tell us more about your skills...",
    required: false,
  },

  // Current Work
  {
    id: "currentWork",
    type: "checkbox",
    question: "What kind of work do you currently do?",
    subtitle: "Select 1 or 2 that best describe your current or most recent work",
    maxSelections: 2,
    options: [
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
    ],
    required: true,
  },

  // Next Chapter Priorities
  {
    id: "nextChapterPriorities",
    type: "checkbox",
    question: "What's most important in your next chapter?",
    subtitle: "Select up to 3 priorities for your future",
    maxSelections: 3,
    options: [
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
    ],
  },

  // Work Energy Ratings
  {
    id: "workEnergyRatings",
    type: "rating",
    question: "What types of work energize you?",
    subtitle: "Rate each type from 1 (drains you) to 5 (energizes you)",
    categories: [
      "Independent work",
      "Collaborative work",
      "Creative work",
      "Operational work",
      "Leadership",
      "Relational work",
      "Hands-on work",
      "Analytical work",
      "Performance work",
    ],
  },

  // Future Vision
  {
    id: "futureVision",
    type: "textarea",
    question: "If everything went right, what would your work life look like in 3 years?",
    subtitle: "Paint a picture of your ideal future",
    placeholder: "Describe your ideal work life...",
    required: false,
  },

  // Burning Question
  {
    id: "burningQuestion",
    type: "textarea",
    question: "What burning question or dream keeps coming back to you?",
    subtitle: "Share that persistent thought or aspiration",
    placeholder: "Share your recurring thoughts or dreams...",
    required: false,
  },

  // Cause Passion Ratings
  {
    id: "causePassion",
    type: "rating",
    question: "How passionate are you about these causes?",
    subtitle: "Rate your passion from 1 (not interested) to 5 (deeply passionate)",
    categories: [
      "Environmental Sustainability & Climate Action",
      "Health & Wellness",
      "Education & Skill-Building",
      "Social Justice & Equity",
      "Economic Development & Entrepreneurship",
      "Arts, Culture & Creativity",
      "Technology & Innovation",
      "Animal Welfare & Wildlife Conservation",
    ],
  },

  // Heart Causes
  {
    id: "heartCauses",
    type: "checkbox",
    question: "Which causes resonate most with your heart?",
    subtitle: "Select up to 5 causes you care deeply about",
    maxSelections: 5,
    options: [
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
    ],
    required: true,
  },

  // Additional Causes
  {
    id: "additionalCauses",
    type: "textarea",
    question: "Any other causes you'd like to support?",
    subtitle: "Share any other causes or issues that matter to you",
    placeholder: "Tell us about other causes that matter to you...",
    required: false,
  },
]

export function AssessmentForm() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const totalQuestions = questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100
  const currentQuestion = questions[currentQuestionIndex]

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
    const question = currentQuestion

    if (question.type === "welcome") {
      // Check all required fields in the welcome page
      return (
        question.fields?.every((field) => {
          if (!field.required) return true

          if (field.type === "text" || field.type === "email") {
            return !!formData[field.id as keyof FormData]
          } else if (field.type === "radio") {
            return !!formData[field.id as keyof FormData]
          }

          return true
        }) || false
      )
    }

    if (!question.required) return true

    switch (question.type) {
      case "text":
      case "email":
        return !!formData[question.id as keyof FormData]
      case "radio":
        return !!formData[question.id as keyof FormData]
      case "checkbox":
        const arrayValue = formData[question.id as keyof FormData] as string[]
        return arrayValue && arrayValue.length > 0
      case "textarea":
        return !question.required || !!formData[question.id as keyof FormData]
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      window.scrollTo(0, 0)
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

  const renderQuestion = () => {
    const question = currentQuestion

    switch (question.type) {
      case "welcome":
        return (
          <div className="space-y-12">
            {question.fields?.map((field) => (
              <div key={field.id} className="space-y-4">
                <Label htmlFor={field.id} className="text-2xl font-medium">
                  {field.label}
                </Label>

                {field.type === "text" || field.type === "email" ? (
                  <Input
                    id={field.id}
                    type={field.type}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={(e) => updateFormData({ [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="text-xl p-5 border-2 rounded-xl"
                    required={field.required}
                  />
                ) : field.type === "radio" ? (
                  <RadioGroup
                    value={formData[field.id as keyof FormData] as string}
                    onValueChange={(value) => updateFormData({ [field.id]: value })}
                    className="space-y-3"
                  >
                    {field.options?.map((option, index) => (
                      <div
                        key={option}
                        className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem value={option} id={`${field.id}-${index}`} className="mt-1 scale-125" />
                        <Label
                          htmlFor={`${field.id}-${index}`}
                          className="text-lg leading-relaxed cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : null}
              </div>
            ))}
          </div>
        )

      case "text":
      case "email":
        return (
          <div className="space-y-8">
            <Input
              type={question.type}
              value={formData[question.id as keyof FormData] as string}
              onChange={(e) => updateFormData({ [question.id]: e.target.value })}
              placeholder={question.placeholder}
              className="text-2xl p-6 border-2 rounded-xl"
              autoFocus
            />
          </div>
        )

      case "radio":
        return (
          <RadioGroup
            value={formData[question.id as keyof FormData] as string}
            onValueChange={(value) => updateFormData({ [question.id]: value })}
            className="space-y-4"
          >
            {question.options?.map((option, index) => (
              <div
                key={option}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RadioGroupItem value={option} id={`${question.id}-${index}`} className="mt-1 scale-125" />
                <Label htmlFor={`${question.id}-${index}`} className="text-xl leading-relaxed cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const currentArray = formData[question.id as keyof FormData] as string[]
        return (
          <div className="space-y-4">
            {question.maxSelections && (
              <div className="text-lg text-gray-600 mb-6">
                Selected: {currentArray.length}/{question.maxSelections}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {question.options?.map((option, index) => (
                <div
                  key={option}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={currentArray.includes(option)}
                    onCheckedChange={() => {
                      const newArray = handleArrayToggle(currentArray, option, question.maxSelections)
                      updateFormData({ [question.id]: newArray })
                    }}
                    className="mt-1 scale-125"
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="text-xl leading-relaxed cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )

      case "rating":
        return (
          <div className="space-y-6">
            {question.categories?.map((category) => (
              <div key={category} className="p-6 bg-gray-50 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <span className="text-xl font-medium flex-1">{category}</span>
                  <RadioGroup
                    value={
                      (formData[question.id as keyof FormData] as Record<string, number>)[category]?.toString() || ""
                    }
                    onValueChange={(value) =>
                      handleRatingChange(category, Number.parseInt(value), question.id as keyof FormData)
                    }
                    className="flex space-x-4"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex flex-col items-center space-y-2">
                        <RadioGroupItem
                          value={rating.toString()}
                          id={`${question.id}-${category}-${rating}`}
                          className="scale-125"
                        />
                        <Label
                          htmlFor={`${question.id}-${category}-${rating}`}
                          className="text-lg font-medium cursor-pointer"
                        >
                          {rating}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-8">
            <Textarea
              value={formData[question.id as keyof FormData] as string}
              onChange={(e) => updateFormData({ [question.id]: e.target.value })}
              placeholder={question.placeholder}
              className="text-xl p-6 border-2 rounded-xl min-h-[200px] resize-none"
              autoFocus
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Progress value={progress} className="w-full h-2 rounded-none" />
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <div className="text-sm text-gray-500">{Math.round(progress)}% Complete</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Question Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {currentQuestion.question}
            </h1>
            {currentQuestion.subtitle && (
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">{currentQuestion.subtitle}</p>
            )}
          </div>

          {/* Question Content */}
          <div className="mb-12">{renderQuestion()}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 text-lg px-6 py-3"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>

            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl flex items-center space-x-2"
              >
                <span>{isSubmitting ? "Submitting..." : "Complete Assessment"}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Question Counter */}
          <div className="mt-8 text-center">
            <div className="inline-flex space-x-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i <= currentQuestionIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
