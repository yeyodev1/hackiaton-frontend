<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnalysisStore } from '@/stores/analysis'
import { useToast } from '@/composables/useToast'
import type { IDocumentAnalysis } from '@/types/analysis.types'

const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()
const { triggerToast } = useToast()

// Estado local
const activeTab = ref('overview')

// Función para procesar contenido Markdown/HTML
const processAnalysisContent = (content: string): string => {
  if (!content) return ''
  
  let processedContent = content
  
  // Convertir títulos Markdown a HTML
  processedContent = processedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  processedContent = processedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  processedContent = processedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  processedContent = processedContent.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  
  // Convertir texto en negrita
  processedContent = processedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Convertir texto en cursiva
  processedContent = processedContent.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // Convertir listas numeradas
  processedContent = processedContent.replace(/^(\d+\.)\s(.+)$/gm, '<li>$2</li>')
  
  // Envolver listas numeradas en <ol>
  processedContent = processedContent.replace(/((<li>.*<\/li>\s*)+)/gs, '<ol>$1</ol>')
  
  // Convertir listas con guiones
  processedContent = processedContent.replace(/^-\s(.+)$/gm, '<li>$1</li>')
  
  // Envolver listas con guiones en <ul> (solo si no están ya en <ol>)
  processedContent = processedContent.replace(/(?<!<ol>[\s\S]*)((<li>.*<\/li>\s*)+)(?![\s\S]*<\/ol>)/gs, '<ul>$1</ul>')
  
  // Convertir párrafos (líneas que no son títulos ni listas)
  const lines = processedContent.split('\n')
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return '<br>'
    if (trimmedLine.startsWith('<h') || trimmedLine.startsWith('<li') || 
        trimmedLine.startsWith('<ol') || trimmedLine.startsWith('<ul') ||
        trimmedLine.startsWith('</ol>') || trimmedLine.startsWith('</ul>')) {
      return line
    }
    if (!trimmedLine.startsWith('<') && trimmedLine.length > 0) {
      return `<p>${trimmedLine}</p>`
    }
    return line
  })
  
  processedContent = processedLines.join('\n')
  
  // Limpiar líneas vacías múltiples
  processedContent = processedContent.replace(/(<br>\s*){2,}/g, '<br>')
  
  return processedContent
}

// Computed properties
const analysisId = computed(() => route.params.id as string)
const analysis = computed(() => analysisStore.currentAnalysis)
const isLoading = computed(() => analysisStore.isLoading)

const statusConfig = computed(() => {
  if (!analysis.value) return { color: 'gray', label: 'Desconocido' }

  switch (analysis.value.status) {
    case 'completed':
      return { color: 'green', label: 'Completado' }
    case 'processing':
      return { color: 'blue', label: 'Procesando' }
    case 'failed':
      return { color: 'red', label: 'Error' }
    default:
      return { color: 'gray', label: 'Desconocido' }
  }
})

const progressPercentage = computed(() => {
  if (!analysis.value) return 0
  return analysis.value.status === 'completed' ? 100 :
    analysis.value.status === 'processing' ? 50 : 0
})

const tabsConfig = computed(() => [
  {
    id: 'overview',
    label: 'Resumen',
    icon: '📊',
    count: null
  },
  {
    id: 'legal',
    label: 'Legal',
    icon: '⚖️',
    count: null
  },
  {
    id: 'technical',
    label: 'Técnico',
    icon: '🔧',
    count: null
  },
  {
    id: 'economic',
    label: 'Económico',
    icon: '💰',
    count: null
  },
  {
    id: 'risks',
    label: 'Riesgos',
    icon: '⚠️',
    count: null
  }
])

// Métodos
const loadAnalysis = async () => {
  await analysisStore.fetchAnalysisById(analysisId.value)
}

const refreshAnalysis = async () => {
  const success = await analysisStore.refreshAnalysis(analysisId.value)
  if (success) {
    triggerToast('Análisis actualizado', 'success')
  }
}

const goBack = () => {
  router.back()
}

const downloadReport = () => {
  // TODO: Implementar descarga de reporte
  triggerToast('Función de descarga en desarrollo', 'info')
}

const shareAnalysis = () => {
  // TODO: Implementar compartir análisis
  triggerToast('Función de compartir en desarrollo', 'info')
}

// Formatear fecha
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  loadAnalysis()
})
</script>

<template>
  <div class="analysis-detail">
    <!-- Header -->
    <div class="analysis-header">
      <div class="header-content">
        <div class="header-navigation">
          <button class="back-button" @click="goBack">
            ← Volver
          </button>
          <div class="breadcrumb">
            <span>Análisis</span>
            <span class="separator">/</span>
            <span 
              class="current" 
              :title="analysis?.documentName || 'Cargando...'"
            >
              {{ analysis?.documentName || 'Cargando...' }}
            </span>
          </div>
        </div>
        
        <div class="header-actions">
          <button 
            class="action-btn secondary"
            @click="refreshAnalysis"
            :disabled="isLoading"
          >
            🔄 Actualizar
          </button>
          <button 
            class="action-btn secondary"
            @click="downloadReport"
            :disabled="!analysis || analysis.status !== 'completed'"
          >
            📥 Descargar
          </button>
          <button 
            class="action-btn primary"
            @click="shareAnalysis"
            :disabled="!analysis || analysis.status !== 'completed'"
          >
            📤 Compartir
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando análisis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!analysis" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Análisis no encontrado</h3>
      <p>El análisis solicitado no existe o no tienes permisos para verlo.</p>
      <button class="btn primary" @click="goBack">
        Volver
      </button>
    </div>

    <!-- Content -->
    <div v-else class="analysis-content">
      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-info">
          <div class="status-badge" :class="statusConfig.color">
            {{ statusConfig.label }}
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progressPercentage }}%</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-navigation">
        <button
          v-for="tab in tabsConfig"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count !== null" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="tab-panel">
          <div class="analysis-section">
            <h3>📋 Resumen Ejecutivo</h3>
            <div class="ai-analysis-content" v-html="processAnalysisContent(analysis.aiAnalysis)"></div>
          </div>

          <div class="analysis-section">
            <h3>📄 Información del Documento</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Tipo de Documento:</span>
                <span class="info-value">{{ analysis.documentType }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nombre:</span>
                <span 
                  class="info-value document-name" 
                  :title="analysis.documentName"
                >
                  {{ analysis.documentName }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha de Análisis:</span>
                <span class="info-value">{{ formatDate(analysis.analysisDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tiempo de Procesamiento:</span>
                <span class="info-value">{{ analysis.processingTime }}ms</span>
              </div>
            </div>
          </div>

          <div v-if="analysis.rucValidation" class="analysis-section">
            <h3>✅ Validación RUC</h3>
            <div class="ruc-info">
              <div class="ruc-item">
                <span class="ruc-label">RUC:</span>
                <span class="ruc-value">{{ analysis.rucValidation.ruc }}</span>
              </div>
              <div class="ruc-item">
                <span class="ruc-label">Razón Social:</span>
                <span class="ruc-value">{{ analysis.rucValidation.companyName }}</span>
              </div>
              <div class="ruc-item">
                <span class="ruc-label">Estado:</span>
                <span class="ruc-status" :class="{ valid: analysis.rucValidation.isValid }">
                  {{ analysis.rucValidation.isValid ? 'Válido' : 'Inválido' }}
                </span>
              </div>
              <div class="ruc-item">
                <span class="ruc-label">Puede Trabajar:</span>
                <span class="ruc-status" :class="{ valid: analysis.rucValidation.canPerformWork }">
                  {{ analysis.rucValidation.canPerformWork ? 'Sí' : 'No' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Legal Analysis Tab -->
        <div v-if="activeTab === 'legal'" class="tab-panel">
          <div class="analysis-section">
            <h3>⚖️ Análisis Legal</h3>
            <div class="ai-analysis-content" v-html="processAnalysisContent(analysis.aiAnalysis)"></div>
          </div>
        </div>

        <!-- Technical Analysis Tab -->
        <div v-if="activeTab === 'technical'" class="tab-panel">
          <div class="analysis-section">
            <h3>🔧 Análisis Técnico</h3>
            <div class="ai-analysis-content" v-html="processAnalysisContent(analysis.aiAnalysis)"></div>
          </div>
        </div>

        <!-- Economic Analysis Tab -->
        <div v-if="activeTab === 'economic'" class="tab-panel">
          <div class="analysis-section">
            <h3>💰 Análisis Económico</h3>
            <div class="ai-analysis-content" v-html="processAnalysisContent(analysis.aiAnalysis)"></div>
          </div>
        </div>

        <!-- Risk Assessment Tab -->
        <div v-if="activeTab === 'risks'" class="tab-panel">
          <div class="analysis-section">
            <h3>⚠️ Evaluación de Riesgos</h3>
            <div class="ai-analysis-content" v-html="processAnalysisContent(analysis.aiAnalysis)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';

.analysis-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// Header
.analysis-header {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .header-navigation {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }

    .back-button {
      background: none;
      border: none;
      color: $primary-blue;
      font-weight: 600;
      cursor: pointer;
      padding: 0.5rem 0;
      align-self: flex-start;

      &:hover {
        color: darken($primary-blue, 10%);
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: $text-secondary;
      min-width: 0; // Permite que el contenedor se contraiga
      flex: 1;

      .separator {
        color: $border-color;
        flex-shrink: 0; // Evita que el separador se contraiga
      }

      .current {
        color: $text-primary;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0; // Permite que el texto se trunque
        max-width: 300px; // Límite máximo en desktop
        
        @media (max-width: 768px) {
          max-width: 150px; // Límite más pequeño en móvil
        }
        
        @media (max-width: 480px) {
          max-width: 100px; // Límite aún más pequeño en pantallas muy pequeñas
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}

// Loading and Error States
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .loading-spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid $border-color;
    border-top: 4px solid $primary-blue;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: $text-primary;
  }

  p {
    margin: 0 0 1.5rem 0;
    color: $text-secondary;
  }
}

// Content
.analysis-content {
  .status-bar {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .status-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &.green {
          background: rgba($success-green, 0.1);
          color: $success-green;
        }

        &.blue {
          background: rgba($primary-blue, 0.1);
          color: $primary-blue;
        }

        &.red {
          background: rgba($error-red, 0.1);
          color: $error-red;
        }

        &.gray {
          background: rgba($text-secondary, 0.1);
          color: $text-secondary;
        }
      }

      .progress-bar {
        flex: 1;
        height: 0.5rem;
        background: $background-light;
        border-radius: 0.25rem;
        overflow: hidden;
        min-width: 100px;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, $primary-blue, $secondary-purple);
          transition: width 0.3s ease;
        }
      }

      .progress-text {
        font-size: 0.875rem;
        font-weight: 600;
        color: $text-secondary;
      }
    }
  }

  .tabs-navigation {
    display: flex;
    background: white;
    border-radius: 1rem;
    padding: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
    gap: 0.25rem;

    .tab-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      min-width: fit-content;

      &:hover {
        background: $background-light;
      }

      &.active {
        background: $primary-blue;
        color: white;
      }

      .tab-icon {
        font-size: 1.125rem;
      }

      .tab-label {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .tab-count {
        background: rgba(255, 255, 255, 0.2);
        color: inherit;
        padding: 0.125rem 0.375rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }
  }

  .tab-content {
    .tab-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }
}

// Analysis Sections
.analysis-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.ai-analysis-content {
  color: $text-primary;
  line-height: 1.7;
  font-size: 1rem;

  :deep(h1) {
    font-size: 2rem;
    font-weight: 800;
    color: $primary-blue;
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid $primary-blue;
    position: relative;
    
    &::before {
      content: '📋';
      margin-right: 0.5rem;
    }
  }

  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 700;
    color: $secondary-purple;
    margin: 1.75rem 0 1rem 0;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, rgba($secondary-purple, 0.1), rgba($primary-blue, 0.05));
    border-left: 4px solid $secondary-purple;
    border-radius: 0.5rem;
    
    &::before {
      content: '🔍';
      margin-right: 0.5rem;
    }
  }

  :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    color: $primary-blue;
    margin: 1.5rem 0 0.75rem 0;
    padding-left: 1rem;
    border-left: 3px solid $primary-light;
    
    &::before {
      content: '▶️';
      margin-right: 0.5rem;
      font-size: 0.875rem;
    }
  }

  :deep(h4),
  :deep(h5),
  :deep(h6) {
    font-size: 1.125rem;
    font-weight: 600;
    color: $text-primary;
    margin: 1.25rem 0 0.5rem 0;
  }

  :deep(p) {
    margin: 0 0 1.25rem 0;
    text-align: justify;
    text-indent: 1rem;
  }

  :deep(ul),
  :deep(ol) {
    margin: 1rem 0 1.5rem 0;
    padding-left: 2rem;
    background: rgba($background-light, 0.5);
    border-radius: 0.5rem;
    padding: 1rem 1rem 1rem 2.5rem;
  }

  :deep(li) {
    margin-bottom: 0.75rem;
    position: relative;
    
    &::marker {
      color: $primary-blue;
      font-weight: bold;
    }
  }

  :deep(ul li) {
    &::before {
      content: '✓';
      color: $success-green;
      font-weight: bold;
      position: absolute;
      left: -1.5rem;
    }
  }

  :deep(strong) {
    font-weight: 700;
    color: $primary-blue;
    background: rgba($primary-light, 0.2);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
  }

  :deep(em) {
    font-style: italic;
    color: $secondary-purple;
    font-weight: 500;
  }

  :deep(code) {
    background: $background-light;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875em;
    border: 1px solid $border-color;
    color: $secondary-purple;
  }

  // Estilos especiales para secciones específicas
  :deep(h2:contains('Resumen Ejecutivo')) {
    background: linear-gradient(135deg, rgba($success-green, 0.1), rgba($primary-blue, 0.05));
    border-left-color: $success-green;
    
    &::before {
      content: '📊';
    }
  }

  :deep(h2:contains('Hallazgos')) {
    background: linear-gradient(135deg, rgba($warning-orange, 0.1), rgba($primary-blue, 0.05));
    border-left-color: $warning-orange;
    
    &::before {
      content: '🔍';
    }
  }

  :deep(h2:contains('Riesgos')) {
    background: linear-gradient(135deg, rgba($error-red, 0.1), rgba($primary-blue, 0.05));
    border-left-color: $error-red;
    
    &::before {
      content: '⚠️';
    }
  }

  :deep(h2:contains('Recomendaciones')) {
    background: linear-gradient(135deg, rgba($primary-blue, 0.1), rgba($secondary-purple, 0.05));
    border-left-color: $primary-blue;
    
    &::before {
      content: '💡';
    }
  }

  :deep(h2:contains('Conclusiones')) {
    background: linear-gradient(135deg, rgba($success-green, 0.1), rgba($secondary-purple, 0.05));
    border-left-color: $success-green;
    
    &::before {
      content: '✅';
    }
  }

  // Destacar números y montos
  :deep(p:contains('USD')) {
    font-weight: 600;
    color: $success-green;
  }

  // Mejorar legibilidad en móviles
  @media (max-width: 768px) {
    font-size: 0.9rem;
    
    :deep(h1) {
      font-size: 1.75rem;
    }
    
    :deep(h2) {
      font-size: 1.375rem;
      padding: 0.5rem 0.75rem;
    }
    
    :deep(h3) {
      font-size: 1.125rem;
    }
    
    :deep(p) {
      text-indent: 0.5rem;
    }
    
    :deep(ul),
    :deep(ol) {
      padding: 0.75rem 0.75rem 0.75rem 2rem;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .info-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: $text-secondary;
    }

    .info-value {
      font-weight: 600;
      color: $text-primary;
      
      &.document-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
        display: block;
        cursor: help; // Indica que hay tooltip
      }
    }
  }
}

.ruc-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .ruc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: $background-light;
    border-radius: 0.5rem;

    .ruc-label {
      font-weight: 600;
      color: $text-secondary;
    }

    .ruc-value {
      font-weight: 600;
      color: $text-primary;
    }

    .ruc-status {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      background: rgba($error-red, 0.1);
      color: $error-red;

      &.valid {
        background: rgba($success-green, 0.1);
        color: $success-green;
      }
    }
  }
}

// Action Buttons
.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background: $primary-blue;
    color: white;

    &:hover:not(:disabled) {
      background: darken($primary-blue, 10%);
    }
  }

  &.secondary {
    background: $background-light;
    color: $text-primary;
    border: 1px solid $border-color;

    &:hover:not(:disabled) {
      background: darken($background-light, 5%);
    }
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: $primary-blue;
    color: white;

    &:hover {
      background: darken($primary-blue, 10%);
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>