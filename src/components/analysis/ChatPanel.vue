<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import type { Conversation } from '@/stores/agent'

interface Props {
  analysisId: string
  documentName?: string
  isVisible: boolean
}

const props = defineProps<Props>()

const agentStore = useAgentStore()
const messageInput = ref('')
const chatContainer = ref<HTMLElement>()
const isInitialized = ref(false)

// Estado local
const currentConversation = ref<Conversation | null>(null)

// Computed
const messages = computed(() => currentConversation.value?.messages || [])
const canSendMessage = computed(() =>
  messageInput.value.trim().length > 0 &&
  !agentStore.isSendingMessage &&
  agentStore.isLLMHealthy
)

const conversationsForAnalysis = computed(() =>
  agentStore.getConversationsForAnalysis(props.analysisId)
)

// Métodos
const initializeChat = async () => {
  if (isInitialized.value) return

  await agentStore.initializeStore()

  // Buscar conversación existente o crear una nueva
  const existingConversations = conversationsForAnalysis.value
  if (existingConversations.length > 0) {
    currentConversation.value = existingConversations[0]
    agentStore.setCurrentConversation(currentConversation.value.id)
  } else {
    const title = props.documentName
      ? `Chat sobre ${props.documentName}`
      : 'Chat sobre documento'
    currentConversation.value = agentStore.createConversation(title, props.analysisId)
  }

  isInitialized.value = true
}

const sendMessage = async () => {
  if (!canSendMessage.value || !currentConversation.value) return

  const message = messageInput.value.trim()
  messageInput.value = ''

  await agentStore.sendMessageToDocument(
    message,
    props.analysisId,
    currentConversation.value.id
  )

  // Scroll al final después de enviar
  await nextTick()
  scrollToBottom()
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const clearError = () => {
  agentStore.clearError()
}

// Watchers
watch(() => props.isVisible, async (newValue) => {
  if (newValue && !isInitialized.value) {
    await initializeChat()
  }
})

watch(() => messages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})

// Lifecycle
onMounted(async () => {
  if (props.isVisible) {
    await initializeChat()
  }
})
</script>

<template>
  <div class="chat-panel" :class="{ 'chat-panel--visible': isVisible }">
    <!-- Header -->
    <div class="chat-header">
      <div class="chat-header__info">
        <div class="chat-header__icon">
          <i class="fas fa-comments"></i>
        </div>
        <div class="chat-header__text">
          <h3>Chat con IA</h3>
          <p>Pregunta sobre este documento</p>
        </div>
      </div>
      
      <div class="chat-header__status">
        <div 
          class="status-indicator" 
          :class="{
            'status-indicator--healthy': agentStore.isLLMHealthy,
            'status-indicator--unhealthy': !agentStore.isLLMHealthy
          }"
        >
          <span class="status-dot"></span>
          <span class="status-text">
            {{ agentStore.isLLMHealthy ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div ref="chatContainer" class="chat-messages">
      <div v-if="messages.length === 0" class="chat-empty">
        <div class="chat-empty__icon">
          <i class="fas fa-comment-dots"></i>
        </div>
        <h4>¡Comienza una conversación!</h4>
        <p>Pregunta cualquier cosa sobre este documento y su análisis.</p>
      </div>

      <div v-for="message in messages" :key="message.id" class="message" :class="`message--${message.role}`">
        <div class="message__avatar">
          <div v-if="message.role === 'user'" class="avatar avatar--user">
            <i class="fas fa-user"></i>
          </div>
          <div v-else class="avatar avatar--assistant">
            <i class="fas fa-robot"></i>
          </div>
        </div>
        
        <div class="message__content">
          <div class="message__bubble">
            <div class="message__text" v-html="message.content"></div>
          </div>
          <div class="message__timestamp">
            {{ formatTimestamp(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Loading indicator -->
      <div v-if="agentStore.isSendingMessage" class="message message--assistant">
        <div class="message__avatar">
          <div class="avatar avatar--assistant">
            <i class="fas fa-robot"></i>
          </div>
        </div>
        <div class="message__content">
          <div class="message__bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="agentStore.error" class="chat-error">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{{ agentStore.error }}</span>
        <button @click="clearError" class="error-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input">
      <div class="input-container">
        <textarea
          v-model="messageInput"
          @keydown="handleKeyPress"
          placeholder="Escribe tu pregunta sobre el documento..."
          class="message-input"
          rows="1"
          :disabled="!agentStore.isLLMHealthy"
        ></textarea>
        <button 
          @click="sendMessage"
          :disabled="!canSendMessage"
          class="send-button"
          :class="{ 'send-button--active': canSendMessage }"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <div class="input-hint">
        <span v-if="!agentStore.isLLMHealthy" class="hint-error">
          Servicio no disponible
        </span>
        <span v-else class="hint-normal">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &--visible {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &__info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    
    i {
      font-size: 20px;
    }
  }

  &__text {
    h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.9;
    }
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  &--healthy {
    color: #10b981;

    .status-dot {
      background: #10b981;
    }
  }

  &--unhealthy {
    color: #ef4444;

    .status-dot {
      background: #ef4444;
    }
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;

  &__icon {
    margin-bottom: 1rem;
    opacity: 0.5;
    
    i {
      font-size: 48px;
    }
  }

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
}

.message {
  display: flex;
  gap: 0.75rem;

  &--user {
    flex-direction: row-reverse;

    .message__content {
      align-items: flex-end;
    }

    .message__bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }

  &--assistant {
    .message__bubble {
      background: #f3f4f6;
      color: #374151;
    }
  }
}

.message__avatar {
  flex-shrink: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 16px;
  }

  &--user {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &--assistant {
    background: #e5e7eb;
    color: #6b7280;
  }
}

.message__content {
  display: flex;
  flex-direction: column;
  max-width: 70%;

  @media (max-width: 768px) {
    max-width: 85%;
  }
}

.message__bubble {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  word-wrap: break-word;

  .message--user & {
    border-bottom-right-radius: 4px;
  }

  .message--assistant & {
    border-bottom-left-radius: 4px;
  }
}

.message__text {
  line-height: 1.5;

  // Estilos para contenido HTML
  :deep(p) {
    margin: 0 0 0.5rem 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  :deep(code) {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875em;
  }
}

.message__timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;

  .message--user & {
    text-align: right;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-error {
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-top: 1px solid #fecaca;

  .error-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #dc2626;
    font-size: 0.875rem;

    .error-close {
      margin-left: auto;
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      
      i {
        font-size: 14px;
      }

      &:hover {
        background: rgba(220, 38, 38, 0.1);
      }
    }
  }
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 22px;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  i {
    font-size: 20px;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &--active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
}

.input-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;

  .hint-normal {
    color: #9ca3af;
  }

  .hint-error {
    color: #dc2626;
  }
}

// Responsive
@media (max-width: 768px) {
  .chat-header {
    padding: 0.75rem 1rem;

    &__text {
      h3 {
        font-size: 1rem;
      }

      p {
        font-size: 0.8rem;
      }
    }
  }

  .chat-messages {
    padding: 0.75rem;
  }

  .chat-input {
    padding: 0.75rem;
  }

  .message__content {
    max-width: 90%;
  }
}
</style>