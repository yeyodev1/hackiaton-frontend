<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnalysisStore } from '@/stores/analysis'
import { useDocumentStore } from '@/stores/document'
import { useWorkspaceStore } from '@/stores/workspace'
import { useToast } from '@/composables/useToast'
import type { IDocumentAnalysis } from '@/types/analysis.types'

const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()
const documentStore = useDocumentStore()
const workspaceStore = useWorkspaceStore()
const { triggerToast } = useToast()

// Estado local
const activeSection = ref('overview')
const isCreatingComparison = ref(false)
const selectedDocuments = ref<string[]>([])
const comparisonTitle = ref('')

// Computed properties
const comparisonId = computed(() => route.params.id as string)
const comparison = computed(() => analysisStore.lastComparison)
const isLoading = computed(() => analysisStore.isLoading)
const isComparing = computed(() => analysisStore.isComparing)
const availableDocuments = computed(() => documentStore.documents)

const sectionTabs = computed(() => [
  {
    id: 'overview',
    label: 'Resumen',
    icon: '📊',
    count: null
  },
  {
    id: 'differences',
    label: 'Diferencias',
    icon: '🔍',
    count: null
  },
  {
    id: 'similarities',
    label: 'Similitudes',
    icon: '🤝',
    count: null
  },
  {
    id: 'recommendations',
    label: 'Recomendaciones',
    icon: '💡',
    count: null
  }
])

// Métodos
const loadComparison = async () => {
  if (comparisonId.value && comparisonId.value !== 'new') {
    // TODO: Implementar carga de comparación específica
    triggerToast('Carga de comparación específica en desarrollo', 'info')
  }
}

const loadAvailableDocuments = async () => {
  await documentStore.fetchDocuments()
}

const toggleDocumentSelection = (documentId: string) => {
  const index = selectedDocuments.value.indexOf(documentId)
  if (index > -1) {
    selectedDocuments.value.splice(index, 1)
  } else {
    if (selectedDocuments.value.length < 5) {
      selectedDocuments.value.push(documentId)
    } else {
      triggerToast('Máximo 5 documentos para comparar', 'warning')
    }
  }
}

const createComparison = async () => {
  if (selectedDocuments.value.length < 2) {
    triggerToast('Selecciona al menos 2 documentos para comparar', 'warning')
    return
  }

  isCreatingComparison.value = true
  
  try {
    const success = await analysisStore.compareDocuments({
      workspaceId: workspaceStore.workspace?._id || '',
      documentIds: selectedDocuments.value
    })

    if (success) {
      triggerToast('Comparación creada exitosamente', 'success')
      // Cambiar a la vista de resultados
      activeSection.value = 'overview'
    }
  } catch (error) {
    triggerToast('Error al crear la comparación', 'error')
  } finally {
    isCreatingComparison.value = false
  }
}

const goBack = () => {
  router.back()
}

const downloadComparison = () => {
  // TODO: Implementar descarga de comparación
  triggerToast('Función de descarga en desarrollo', 'info')
}

const shareComparison = () => {
  // TODO: Implementar compartir comparación
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

// Formatear tamaño de archivo
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadComparison()
  loadAvailableDocuments()
})
</script>

<template>
  <div class="comparison-view">
    <!-- Header -->
    <div class="comparison-header">
      <div class="header-content">
        <div class="header-navigation">
          <button class="back-button" @click="goBack">
            ← Volver
          </button>
          <div class="breadcrumb">
            <span>Comparaciones</span>
            <span class="separator">/</span>
            <span class="current">
              {{ comparisonId === 'new' ? 'Nueva Comparación' : 'Comparación' }}
            </span>
          </div>
        </div>
        
        <div v-if="comparison" class="header-actions">
          <button 
            class="action-btn secondary"
            @click="downloadComparison"
          >
            📥 Descargar
          </button>
          <button 
            class="action-btn primary"
            @click="shareComparison"
          >
            📤 Compartir
          </button>
        </div>
      </div>
    </div>

    <!-- Nueva Comparación -->
    <div v-if="comparisonId === 'new' || !comparison" class="new-comparison">
      <div class="comparison-form">
        <h2>🔍 Nueva Comparación de Documentos</h2>
        <p class="form-description">
          Selecciona entre 2 y 5 documentos para realizar una comparación detallada.
        </p>

        <!-- Título de la comparación -->
        <div class="form-group">
          <label for="comparison-title">Título de la comparación (opcional)</label>
          <input
            id="comparison-title"
            v-model="comparisonTitle"
            type="text"
            placeholder="Ej: Comparación de propuestas técnicas Q1 2024"
            class="form-input"
          >
        </div>

        <!-- Selección de documentos -->
        <div class="form-group">
          <label>Documentos disponibles</label>
          <div class="documents-grid">
            <div
              v-for="document in availableDocuments"
              :key="document.id"
              class="document-card"
              :class="{ selected: selectedDocuments.includes(document.id) }"
              @click="toggleDocumentSelection(document.id)"
            >
              <div class="document-checkbox">
                <input
                  type="checkbox"
                  :checked="selectedDocuments.includes(document.id)"
                  @click.stop
                >
              </div>
              <div class="document-info">
                <div class="document-header">
                  <span class="document-type">{{ document.type }}</span>
                  <span class="document-status" :class="document.status">
                    {{ document.status === 'completed' ? 'Procesado' : 'Pendiente' }}
                  </span>
                </div>
                <h4 class="document-name">{{ document.name }}</h4>
                <div class="document-meta">
                  <span class="meta-item">
                    📅 {{ formatDate(document.uploadedAt) }}
                  </span>
                  <span class="meta-item">
                    📄 {{ document.metadata?.pages || 0 }} páginas
                  </span>
                  <span class="meta-item">
                    💾 {{ formatFileSize(document.size) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de selección -->
        <div v-if="selectedDocuments.length > 0" class="selection-summary">
          <h4>📋 Documentos seleccionados ({{ selectedDocuments.length }})</h4>
          <div class="selected-documents">
            <div
              v-for="docId in selectedDocuments"
              :key="docId"
              class="selected-document"
            >
              <span class="doc-name">
                {{ availableDocuments.find(d => d.id === docId)?.name }}
              </span>
              <button
                class="remove-btn"
                @click="toggleDocumentSelection(docId)"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de comparar -->
        <div class="form-actions">
          <button
            class="btn primary large"
            :disabled="selectedDocuments.length < 2 || isCreatingComparison"
            @click="createComparison"
          >
            <span v-if="isCreatingComparison" class="loading-spinner"></span>
            {{ isCreatingComparison ? 'Comparando...' : '🔍 Iniciar Comparación' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados de Comparación -->
    <div v-else-if="comparison" class="comparison-results">
      <!-- Navigation Tabs -->
      <div class="tabs-navigation">
        <button
          v-for="tab in sectionTabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeSection === tab.id }"
          @click="activeSection = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count !== null" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeSection === 'overview'" class="tab-panel">
          <div class="comparison-section">
            <h3>📊 Resumen de la Comparación</h3>
            <div class="comparison-overview">
              <div class="overview-stats">
                <div class="stat-card">
                  <div class="stat-icon">📄</div>
                  <div class="stat-info">
                    <span class="stat-value">{{ selectedDocuments.length }}</span>
                    <span class="stat-label">Documentos</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🔍</div>
                  <div class="stat-info">
                    <span class="stat-value">-</span>
                    <span class="stat-label">Diferencias</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🤝</div>
                  <div class="stat-info">
                    <span class="stat-value">-</span>
                    <span class="stat-label">Similitudes</span>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">💡</div>
                  <div class="stat-info">
                    <span class="stat-value">-</span>
                    <span class="stat-label">Recomendaciones</span>
                  </div>
                </div>
              </div>
              
              <div class="comparison-summary">
                <h4>📋 Resumen Ejecutivo</h4>
                <p>La comparación se ha completado exitosamente. Los resultados están disponibles en las pestañas correspondientes.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Differences Tab -->
        <div v-if="activeSection === 'differences'" class="tab-panel">
          <div class="comparison-section">
            <h3>🔍 Diferencias Identificadas</h3>
            <div class="differences-content">
              <p class="placeholder-text">
                Las diferencias entre los documentos se mostrarán aquí una vez que el análisis esté completo.
              </p>
            </div>
          </div>
        </div>

        <!-- Similarities Tab -->
        <div v-if="activeSection === 'similarities'" class="tab-panel">
          <div class="comparison-section">
            <h3>🤝 Similitudes Encontradas</h3>
            <div class="similarities-content">
              <p class="placeholder-text">
                Las similitudes entre los documentos se mostrarán aquí una vez que el análisis esté completo.
              </p>
            </div>
          </div>
        </div>

        <!-- Recommendations Tab -->
        <div v-if="activeSection === 'recommendations'" class="tab-panel">
          <div class="comparison-section">
            <h3>💡 Recomendaciones</h3>
            <div class="recommendations-content">
              <p class="placeholder-text">
                Las recomendaciones basadas en la comparación se mostrarán aquí una vez que el análisis esté completo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando comparación...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';

.comparison-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// Header
.comparison-header {
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

      .separator {
        color: $border-color;
      }

      .current {
        color: $text-primary;
        font-weight: 600;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}

// Nueva Comparación
.new-comparison {
  .comparison-form {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: $text-primary;
    }

    .form-description {
      margin: 0 0 2rem 0;
      color: $text-secondary;
      font-size: 1.125rem;
    }

    .form-group {
      margin-bottom: 2rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: $text-primary;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid $border-color;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: $primary-blue;
        }
      }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;

      .document-card {
        border: 2px solid $border-color;
        border-radius: 0.75rem;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;

        &:hover {
          border-color: $primary-blue;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border-color: $primary-blue;
          background: rgba($primary-blue, 0.05);
        }

        .document-checkbox {
          margin-bottom: 0.75rem;

          input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            accent-color: $primary-blue;
          }
        }

        .document-info {
          .document-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            .document-type {
              background: rgba($primary-blue, 0.1);
              color: $primary-blue;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
            }

            .document-status {
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;

              &.processed {
                background: rgba($success-green, 0.1);
                color: $success-green;
              }

              &.pending {
                background: rgba($warning-orange, 0.1);
                color: $warning-orange;
              }
            }
          }

          .document-name {
            margin: 0 0 0.75rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: $text-primary;
            line-height: 1.3;
          }

          .document-meta {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .meta-item {
              font-size: 0.875rem;
              color: $text-secondary;
            }
          }
        }
      }
    }

    .selection-summary {
      background: $background-light;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;

      h4 {
        margin: 0 0 1rem 0;
        color: $text-primary;
      }

      .selected-documents {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .selected-document {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid $border-color;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;

          .doc-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: $text-primary;
          }

          .remove-btn {
            background: none;
            border: none;
            color: $text-secondary;
            cursor: pointer;
            padding: 0;
            font-size: 0.875rem;

            &:hover {
              color: $error-red;
            }
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;
    }
  }
}

// Resultados de Comparación
.comparison-results {
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

// Secciones de Comparación
.comparison-section {
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

  .comparison-overview {
    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;

      .stat-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: $background-light;
        border-radius: 0.75rem;
        padding: 1.5rem;

        .stat-icon {
          font-size: 2rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: $text-primary;
          }

          .stat-label {
            font-size: 0.875rem;
            color: $text-secondary;
            font-weight: 500;
          }
        }
      }
    }

    .comparison-summary {
      h4 {
        margin: 0 0 0.75rem 0;
        color: $text-primary;
      }

      p {
        margin: 0;
        color: $text-secondary;
        line-height: 1.6;
      }
    }
  }

  .placeholder-text {
    text-align: center;
    color: $text-secondary;
    font-style: italic;
    padding: 2rem;
    background: $background-light;
    border-radius: 0.5rem;
    margin: 0;
  }
}

// Loading State
.loading-state {
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

  p {
    margin: 0;
    color: $text-secondary;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;

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

  &.large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>