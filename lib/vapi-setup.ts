import { VAPIService } from "./vapi-service"

export class VAPISetup {
  private vapiService: VAPIService

  constructor(apiKey: string) {
    this.vapiService = new VAPIService(apiKey)
  }

  async setupIkigaiAssistant(): Promise<string> {
    try {
      // Check if assistant already exists
      const existingAssistants = await this.vapiService.listAssistants()
      const ikigaiAssistant = existingAssistants.find((assistant) => assistant.name === "Ikigai Discovery Coach")

      if (ikigaiAssistant) {
        console.log("Ikigai assistant already exists:", ikigaiAssistant.id)
        return ikigaiAssistant.id
      }

      // Create new assistant
      const assistantId = await this.vapiService.createAssistant()
      console.log("Created new Ikigai assistant:", assistantId)
      return assistantId
    } catch (error) {
      console.error("Error setting up VAPI assistant:", error)
      throw error
    }
  }

  async testVAPIConnection(): Promise<boolean> {
    try {
      await this.vapiService.listAssistants()
      return true
    } catch (error) {
      console.error("VAPI connection test failed:", error)
      return false
    }
  }

  async cleanupOldAssistants(): Promise<void> {
    try {
      const assistants = await this.vapiService.listAssistants()
      const ikigaiAssistants = assistants.filter((assistant) => assistant.name.includes("Ikigai"))

      // Keep only the most recent one
      if (ikigaiAssistants.length > 1) {
        const sortedAssistants = ikigaiAssistants.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )

        for (let i = 1; i < sortedAssistants.length; i++) {
          await this.vapiService.deleteAssistant(sortedAssistants[i].id)
          console.log("Deleted old assistant:", sortedAssistants[i].id)
        }
      }
    } catch (error) {
      console.error("Error cleaning up old assistants:", error)
    }
  }
}
