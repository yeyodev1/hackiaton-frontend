import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { agentService } from '@/services/agent.service'
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  DocumentInsight,
  DocumentInsightsResponse,
  ComparisonInsight,
  ComparisonInsightsResponse,
  ComparisonInsightsRequest,
  LLMHealthResponse
} from '@/services/agent.service'

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  analysisId?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export const useAgentStore = defineStore('agent', () => {
  // Estado reactivo
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const documentInsights = ref<Map<string, DocumentInsightsResponse>>(new Map())
  const comparisonInsights = ref<ComparisonInsightsResponse[]>([])
  const llmHealth = ref<LLMHealthResponse | null>(null)
  const isLoading = ref(false)
  const isSendingMessage = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeConversations = computed(() => 
    conversations.value.filter(conv => conv.isActive)
  )

  const conversationsByAnalysis = computed(() => {
    const grouped = new Map<string, Conversation[]>()
    conversations.value.forEach(conv => {
      if (conv.analysisId) {
        if (!grouped.has(conv.analysisId)) {
          grouped.set(conv.analysisId, [])
        }
        grouped.get(conv.analysisId)!.push(conv)
      }
    })
    return grouped
  })

  const isLLMHealthy = computed(() => 
    llmHealth.value?.status === 'healthy'
  )

  // Acciones para conversaciones
  const createConversation = (title: string, analysisId?: string): Conversation => {
    const conversation: Conversation = {
      id: agentService.generateConversationId(),
      title,
      messages: [],
      analysisId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }

    conversations.value.push(conversation)
    currentConversation.value = conversation
    return conversation
  }

  const setCurrentConversation = (conversationId: string) => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      currentConversation.value = conversation
    }
  }

  const addMessageToConversation = (conversationId: string, message: ChatMessage) => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.messages.push(message)
      conversation.updatedAt = new Date()
    }
  }

  const updateConversationTitle = (conversationId: string, title: string) => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.title = title
      conversation.updatedAt = new Date()
    }
  }

  const deleteConversation = (conversationId: string) => {
    const index = conversations.value.findIndex(conv => conv.id === conversationId)
    if (index !== -1) {
      conversations.value.splice(index, 1)
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
      }
    }
  }

  const archiveConversation = (conversationId: string) => {
    const conversation = conversations.value.find(conv => conv.id === conversationId)
    if (conversation) {
      conversation.isActive = false
      conversation.updatedAt = new Date()
    }
  }

  // Acciones para chat
  const sendMessage = async (message: string, conversationId?: string): Promise<ChatMessage | null> => {
    if (!agentService.validateMessage(message)) {
      error.value = 'El mensaje debe tener entre 1 y 4000 caracteres'
      return null
    }

    try {
      isSendingMessage.value = true
      error.value = null

      // Crear mensaje del usuario
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date()
      }

      // Agregar mensaje a la conversación
      if (conversationId) {
        addMessageToConversation(conversationId, userMessage)
      }

      // Enviar al servicio
      const request = agentService.formatMessage(message, conversationId)
      const response = await agentService.chatWithAgent(request)

      // Crear mensaje de respuesta
      const assistantMessage: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp)
      }

      // Agregar respuesta a la conversación
      if (conversationId) {
        addMessageToConversation(conversationId, assistantMessage)
      }

      return assistantMessage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al enviar mensaje'
      return null
    } finally {
      isSendingMessage.value = false
    }
  }

  const sendMessageToDocument = async (
    message: string,
    analysisId: string,
    conversationId?: string
  ): Promise<ChatMessage | null> => {
    if (!agentService.validateMessage(message)) {
      error.value = 'El mensaje debe tener entre 1 y 4000 caracteres'
      return null
    }

    try {
      isSendingMessage.value = true
      error.value = null

      // Crear mensaje del usuario
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        analysisId
      }

      // Agregar mensaje a la conversación
      if (conversationId) {
        addMessageToConversation(conversationId, userMessage)
      }

      // Enviar al servicio
      const request = agentService.formatMessage(message, conversationId)
      const response = await agentService.chatWithDocument(analysisId, request)

      // Crear mensaje de respuesta
      const assistantMessage: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(response.timestamp),
        analysisId
      }

      // Agregar respuesta a la conversación
      if (conversationId) {
        addMessageToConversation(conversationId, assistantMessage)
      }

      return assistantMessage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al enviar mensaje'
      return null
    } finally {
      isSendingMessage.value = false
    }
  }

  // Acciones para insights
  const fetchDocumentInsights = async (analysisId: string): Promise<DocumentInsightsResponse | null> => {
    try {
      isLoading.value = true
      error.value = null

      const insights = await agentService.getDocumentInsights(analysisId)
      documentInsights.value.set(analysisId, insights)
      return insights
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener insights'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchComparisonInsights = async (
    workspaceId: string,
    request: ComparisonInsightsRequest
  ): Promise<ComparisonInsightsResponse | null> => {
    try {
      isLoading.value = true
      error.value = null

      const insights = await agentService.getComparisonInsights(workspaceId, request)
      comparisonInsights.value.push(insights)
      return insights
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener insights de comparación'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Acciones para health check
  const checkLLMHealth = async (): Promise<LLMHealthResponse | null> => {
    try {
      const health = await agentService.getLLMHealth()
      llmHealth.value = health
      return health
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al verificar estado del servicio'
      return null
    }
  }

  // Utilidades
  const clearError = () => {
    error.value = null
  }

  const getInsightsForAnalysis = (analysisId: string): DocumentInsightsResponse | null => {
    return documentInsights.value.get(analysisId) || null
  }

  const getConversationsForAnalysis = (analysisId: string): Conversation[] => {
    return conversationsByAnalysis.value.get(analysisId) || []
  }

  // Inicialización
  const initializeStore = async () => {
    await checkLLMHealth()
  }

  return {
    // Estado
    conversations,
    currentConversation,
    documentInsights,
    comparisonInsights,
    llmHealth,
    isLoading,
    isSendingMessage,
    error,

    // Computed
    activeConversations,
    conversationsByAnalysis,
    isLLMHealthy,

    // Acciones
    createConversation,
    setCurrentConversation,
    addMessageToConversation,
    updateConversationTitle,
    deleteConversation,
    archiveConversation,
    sendMessage,
    sendMessageToDocument,
    fetchDocumentInsights,
    fetchComparisonInsights,
    checkLLMHealth,
    clearError,
    getInsightsForAnalysis,
    getConversationsForAnalysis,
    initializeStore
  }
})