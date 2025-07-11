import { VAPIService } from "./vapi-service"
import { VAPIAssistantBuilder } from "./vapi-assistant-config"

export class VAPISetup {
  private vapiService: VAPIService

  constructor(apiKey: string) {
    this.vapiService = new VAPIService(apiKey)
  }

  async setupIkigaiAssistant(): Promise<string> {
    try {
      console.log("Setting up Ikigai assistant...")

      // Check if assistant already exists
      const existingAssistants = await this.vapiService.listAssistants()
      const ikigaiAssistant = existingAssistants.find(
        (assistant) =>
          assistant.name?.toLowerCase().includes("ikigai") || assistant.name?.toLowerCase().includes("iki"),
      )

      if (ikigaiAssistant) {
        console.log("Ikigai assistant already exists:", ikigaiAssistant.id)
        return ikigaiAssistant.id
      }

      // Create new assistant with proper VAPI configuration
      const assistantConfig = VAPIAssistantBuilder.createIkigaiAssistant()
      const assistantId = await this.vapiService.createAssistant(assistantConfig)

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
      const ikigaiAssistants = assistants.filter(
        (assistant) =>
          assistant.name?.toLowerCase().includes("ikigai") || assistant.name?.toLowerCase().includes("iki"),
      )

      // Keep only the most recent one
      if (ikigaiAssistants.length > 1) {
        const sortedAssistants = ikigaiAssistants.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
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
