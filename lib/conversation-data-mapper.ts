import type { ConversationState } from "@/types/conversation"

export class ConversationDataMapper {
  static mapToFormData(conversationState: ConversationState): any {
    const { collectedData } = conversationState

    return {
      // Basic info
      firstName: collectedData.firstName || "",
      email: collectedData.email || "",
      primaryReason: collectedData.primaryReason || "",

      // Activities and interests
      activities: this.parseArrayResponse(collectedData.activities),
      enjoymentRatings: this.parseRatingResponses(collectedData.enjoymentRatings),
      additionalInterests: collectedData.additionalInterests || "",

      // Skills
      skillStatements: this.parseArrayResponse(collectedData.skillStatements),
      skillConfidence: this.parseRatingResponses(collectedData.skillConfidence),
      additionalSkills: collectedData.additionalSkills || "",

      // Career and goals
      currentWork: this.parseArrayResponse(collectedData.currentWork),
      nextChapterPriorities: this.parseArrayResponse(collectedData.nextChapterPriorities),
      workEnergyRatings: this.parseRatingResponses(collectedData.workEnergyRatings),
      futureVision: collectedData.futureVision || "",
      burningQuestion: collectedData.burningQuestion || "",

      // Impact and causes
      causePassion: this.parseRatingResponses(collectedData.causePassion),
      heartCauses: this.parseArrayResponse(collectedData.heartCauses),
      additionalCauses: collectedData.additionalCauses || "",
    }
  }

  private static parseArrayResponse(response: any): string[] {
    if (Array.isArray(response)) return response
    if (typeof response === "string") {
      // Parse comma-separated values or natural language lists
      return response
        .split(/[,;]|\sand\s|\sor\s/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
    return []
  }

  private static parseRatingResponses(response: any): Record<string, number> {
    if (typeof response === "object" && response !== null) {
      return response
    }

    // Parse natural language ratings
    const ratings: Record<string, number> = {}
    if (typeof response === "string") {
      // Extract ratings from natural language
      // This would need more sophisticated parsing
      const ratingMatches = response.match(/(\w+):\s*(\d+)/g)
      if (ratingMatches) {
        ratingMatches.forEach((match) => {
          const [, category, rating] = match.match(/(\w+):\s*(\d+)/) || []
          if (category && rating) {
            ratings[category] = Number.parseInt(rating)
          }
        })
      }
    }

    return ratings
  }
}
