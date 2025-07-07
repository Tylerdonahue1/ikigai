export class VoiceManager {
  private recognition: any | null = null
  private synthesis: SpeechSynthesis | null = null
  private isListening = false
  private isSpeaking = false

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  private initializeSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = "en-US"
      this.recognition.maxAlternatives = 1
    }
  }

  private initializeSpeechSynthesis() {
    if ("speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  async startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported"))
        return
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        this.isListening = false
        resolve(transcript)
      }

      this.recognition.onerror = (event) => {
        this.isListening = false
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      this.recognition.onend = () => {
        this.isListening = false
      }

      this.isListening = true
      this.recognition.start()
    })
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  async speak(
    text: string,
    options: {
      rate?: number
      pitch?: number
      volume?: number
      voice?: string
    } = {},
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 0.9
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 0.8

      // Set voice if specified
      if (options.voice) {
        const voices = this.synthesis.getVoices()
        const selectedVoice = voices.find((voice) => voice.name.includes(options.voice!))
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true
      }

      utterance.onend = () => {
        this.isSpeaking = false
        resolve()
      }

      utterance.onerror = (event) => {
        this.isSpeaking = false
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.synthesis.speak(utterance)
    })
  }

  stopSpeaking() {
    if (this.synthesis && this.isSpeaking) {
      this.synthesis.cancel()
      this.isSpeaking = false
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis?.getVoices() || []
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking
  }
}
