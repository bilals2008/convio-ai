// SDK for external integrations
// This will be expanded later for widget SDK, API client, etc.

export interface ConvioConfig {
  apiUrl: string
  botId: string
}

export function createConvio(config: ConvioConfig) {
  return {
    // Chat methods
    async sendMessage(message: string) {
      const response = await fetch(`${config.apiUrl}/chat/${config.botId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      return response.json()
    },

    async getHistory() {
      const response = await fetch(`${config.apiUrl}/chat/${config.botId}/history`)
      return response.json()
    },
  }
}
