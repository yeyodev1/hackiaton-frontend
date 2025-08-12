<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDocumentStore } from '@/stores/document'
import { useWorkspaceStore } from '@/stores/workspace'
import type { Document as DocumentType } from '@/services/document.service'
import { useToast } from '@/composables/useToast'

const documentStore = useDocumentStore()
const workspaceStore = useWorkspaceStore()
const { triggerToast } = useToast()

// Estado local
const isDragOver = ref(false)
const showUploadModal = ref(false)
const showDeleteModal = ref(false)
const documentToDelete = ref<DocumentType | null>(null)
const selectedFiles = ref<File[]>([])
const uploadType = ref<DocumentType['type']>('contract')
const uploadDescription = ref('')
const searchQuery = ref('')
const selectedTypeFilter = ref<DocumentType['type'] | ''>('')
const viewMode = ref<'grid' | 'list'>('grid')
const fileInput = ref<HTMLInputElement | null>(null)

// Tipos de documento disponibles
const documentTypes = [
  { value: 'contract', label: 'Contrato', icon: '📄', color: 'blue' },
  { value: 'pliego', label: 'Pliego', icon: '📋', color: 'green' },
  { value: 'propuesta', label: 'Propuesta', icon: '💼', color: 'purple' },
  { value: 'constitution', label: 'Constitución', icon: '⚖️', color: 'orange' },
  { value: 'other', label: 'Otro', icon: '📁', color: 'gray' }
] as const

// Computed properties
const filteredDocuments = computed(() => {
  let docs = documentStore.documents

  if (selectedTypeFilter.value) {
    docs = docs.filter(doc => doc.type === selectedTypeFilter.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.originalName!.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    )
  }

  return docs
})

const hasSelectedDocuments = computed(() =>
  documentStore.selectedDocuments.length > 0
)

const canUpload = computed(() =>
  selectedFiles.value.length > 0 && uploadType.value
)

// Métodos para drag & drop
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = Array.from(e.dataTransfer?.files || [])
  handleFileSelection(files)
}

const handleFileInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFileSelection(files)
}

const handleFileSelection = (files: File[]) => {
  // Filtrar solo archivos PDF
  const pdfFiles = files.filter(file => file.type === 'application/pdf')

  if (pdfFiles.length !== files.length) {
    triggerToast('Solo se permiten archivos PDF', 'warning')
  }

  if (pdfFiles.length > 0) {
    selectedFiles.value = pdfFiles
    showUploadModal.value = true
  }
}

// Métodos de gestión de documentos
const uploadDocuments = async () => {
  if (!canUpload.value) return

  try {
    for (const file of selectedFiles.value) {
      await documentStore.uploadDocument(
        file,
        uploadType.value,
        uploadDescription.value
      )
    }

    // Resetear formulario
    selectedFiles.value = []
    uploadDescription.value = ''
    showUploadModal.value = false

    triggerToast(`Se subieron ${selectedFiles.value.length} documentos correctamente`, 'success')
  } catch (error) {
    console.error('Error uploading documents:', error)
  }
}

const confirmDelete = (document: DocumentType) => {
  documentToDelete.value = document
  showDeleteModal.value = true
}

const deleteDocument = async () => {
  if (!documentToDelete.value) return

  const success = await documentStore.deleteDocument(documentToDelete.value._id!)
  if (success) {
    showDeleteModal.value = false
    documentToDelete.value = null
  }
}

const deleteSelectedDocuments = async () => {
  await documentStore.deleteSelectedDocuments()
}

const downloadDocument = async (document: DocumentType) => {
  await documentStore.downloadDocument(document)
}

const toggleDocumentSelection = (documentId: string) => {
  documentStore.toggleDocumentSelection(documentId)
}

const selectAllDocuments = () => {
  documentStore.selectAllDocuments()
}

const clearSelection = () => {
  documentStore.clearSelection()
}

const openFileDialog = () => {
  fileInput.value?.click()
}

// Formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Formatear fecha
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Obtener configuración de tipo de documento
const getDocumentTypeConfig = (type: DocumentType['type']) => {
  return documentTypes.find(t => t.value === type) || documentTypes[4]
}

// Watchers
watch([searchQuery, selectedTypeFilter], () => {
  documentStore.setFilters({
    search: searchQuery.value || undefined,
    type: selectedTypeFilter.value || undefined
  })
})

// Lifecycle
onMounted(async () => {
  await documentStore.fetchDocuments()
})
</script>

<template>
  <div class="document-management">
    <!-- Header -->
    <div class="document-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="header-title">
            <span class="header-icon">📚</span>
            Gestión de Documentos
          </h1>
          <p class="header-subtitle">
            Administra los documentos profesionales de tu workspace
          </p>
        </div>
        
        <div class="header-stats">
          <div class="stat-card">
            <span class="stat-number">{{ documentStore.totalCount }}</span>
            <span class="stat-label">Documentos</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ documentStore.documentStats.recentUploads }}</span>
            <span class="stat-label">Esta semana</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Zona de subida -->
    <div 
      class="upload-zone"
      :class="{ 'drag-over': isDragOver }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="upload-content">
        <div class="upload-icon">📤</div>
        <h3 class="upload-title">Arrastra tus documentos aquí</h3>
        <p class="upload-subtitle">o haz clic para seleccionar archivos PDF</p>
        
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".pdf"
          class="upload-input"
          @change="handleFileInput"
        >
        
        <button 
          class="upload-button"
          @click="openFileDialog"
        >
          Seleccionar Archivos
        </button>
      </div>
    </div>

    <!-- Controles y filtros -->
    <div class="controls-section">
      <div class="search-filters">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar documentos..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        
        <select 
          v-model="selectedTypeFilter"
          class="filter-select"
        >
          <option value="">Todos los tipos</option>
          <option 
            v-for="type in documentTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.icon }} {{ type.label }}
          </option>
        </select>
      </div>
      
      <div class="view-controls">
        <div class="view-toggle">
          <button 
            class="view-button"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            ⊞
          </button>
          <button 
            class="view-button"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            ☰
          </button>
        </div>
        
        <div v-if="hasSelectedDocuments" class="selection-actions">
          <span class="selection-count">
            {{ documentStore.selectedDocuments.length }} seleccionados
          </span>
          <button 
            class="action-button danger"
            @click="deleteSelectedDocuments"
          >
            Eliminar
          </button>
          <button 
            class="action-button secondary"
            @click="clearSelection"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de documentos -->
    <div class="documents-section">
      <div v-if="documentStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando documentos...</p>
      </div>
      
      <div v-else-if="!documentStore.hasDocuments" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No hay documentos</h3>
        <p>Sube tu primer documento para comenzar</p>
      </div>
      
      <div 
        v-else
        class="documents-grid"
        :class="{ 'list-view': viewMode === 'list' }"
      >
        <div 
          v-for="document in filteredDocuments"
          :key="document._id"
          class="document-card"
          :class="{
            selected: documentStore.selectedDocuments.includes(document._id!),
            processing: document.status === 'processing'
          }"
        >
          <div class="document-header">
            <input
              type="checkbox"
              :checked="documentStore.selectedDocuments.includes(document._id!)"
              @change="toggleDocumentSelection(document._id!)"
              class="document-checkbox"
            >
            
            <div class="document-type">
              <span class="type-icon">
                {{ getDocumentTypeConfig(document.type).icon }}
              </span>
              <span class="type-label">
                {{ getDocumentTypeConfig(document.type).label }}
              </span>
            </div>
            
            <div class="document-status">
              <span 
                class="status-badge"
                :class="document.status"
              >
                {{ document.status === 'completed' ? 'Completado' :
                  document.status === 'processing' ? 'Procesando' : 'Error' }}
              </span>
            </div>
          </div>
          
          <div class="document-content">
            <h4 class="document-name">{{ document.name }}</h4>
            <p class="document-original-name">{{ document.originalName }}</p>
            
            <div v-if="document.description" class="document-description">
              {{ document.description }}
            </div>
            
            <div class="document-meta">

              <span class="meta-item">
                📅 {{ formatDate(document.uploadedAt) }}
              </span>
              <span v-if="document.metadata?.pages" class="meta-item">
                📄 {{ document.metadata.pages }} páginas
              </span>
            </div>
          </div>
          
          <div class="document-actions">
            <button 
              class="action-btn primary"
              @click="downloadDocument(document)"
              :disabled="document.status !== 'completed'"
            >
              ⬇️ Descargar
            </button>
            <a 
              :href="document.url"
              target="_blank"
              class="action-btn secondary"
              :class="{ disabled: !document.url || document.status !== 'completed' }"
              @click="!document.url || document.status !== 'completed' ? $event.preventDefault() : null"
            >
              👁️ Ver
            </a>
            <button 
              class="action-btn danger"
              @click="confirmDelete(document)"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de subida -->
    <div v-if="showUploadModal" class="modal-overlay" @click="showUploadModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Subir Documentos</h3>
          <button class="modal-close" @click="showUploadModal = false">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="selected-files">
            <h4>Archivos seleccionados ({{ selectedFiles.length }})</h4>
            <div class="file-list">
              <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="file-item"
              >
                <span class="file-icon">📄</span>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
          
          <div class="upload-form">
            <div class="form-group">
              <label for="upload-type">Tipo de documento</label>
              <select 
                id="upload-type"
                v-model="uploadType"
                class="form-select"
              >
                <option 
                  v-for="type in documentTypes" 
                  :key="type.value" 
                  :value="type.value"
                >
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="upload-description">Descripción (opcional)</label>
              <textarea
                id="upload-description"
                v-model="uploadDescription"
                placeholder="Describe el contenido del documento..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div v-if="documentStore.isUploading" class="upload-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${documentStore.uploadProgress}%` }"
              ></div>
            </div>
            <p>Subiendo... {{ documentStore.uploadProgress }}%</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn secondary"
            @click="showUploadModal = false"
            :disabled="documentStore.isUploading"
          >
            Cancelar
          </button>
          <button 
            class="btn primary"
            @click="uploadDocuments"
            :disabled="!canUpload || documentStore.isUploading"
          >
            {{ documentStore.isUploading ? 'Subiendo...' : 'Subir Documentos' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar el documento?</p>
          <div v-if="documentToDelete" class="document-info">
            <strong>{{ documentToDelete.originalName }}</strong>
            <br>
            <small>Esta acción no se puede deshacer</small>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn secondary"
            @click="showDeleteModal = false"
          >
            Cancelar
          </button>
          <button 
            class="btn danger"
            @click="deleteDocument"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';

.document-management {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
}

// Header
.document-header {
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

  .header-info {
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: $primary-dark;
      margin: 0 0 0.5rem 0;

      @media (min-width: 768px) {
        font-size: 2rem;
      }

      .header-icon {
        font-size: 1.75rem;

        @media (min-width: 768px) {
          font-size: 2.25rem;
        }
      }
    }

    .header-subtitle {
      color: $text-secondary;
      margin: 0;
      font-size: 0.875rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }
  }

  .header-stats {
    display: flex;
    gap: 1rem;

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: $primary-light;
      border-radius: 0.75rem;
      min-width: 80px;

      .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        color: $primary-dark;
      }

      .stat-label {
        font-size: 0.75rem;
        color: $text-secondary;
        text-align: center;
      }
    }
  }
}

// Zona de subida
.upload-zone {
  background: white;
  border: 2px dashed $border-color;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover,
  &.drag-over {
    border-color: $primary-main;
    background: $primary-light;
    transform: translateY(-2px);
  }

  .upload-content {
    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 0.5rem 0;
    }

    .upload-subtitle {
      color: $text-secondary;
      margin: 0 0 1.5rem 0;
    }

    .upload-input {
      display: none;
    }

    .upload-button {
      background: $primary-main;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: $primary-dark;
        transform: translateY(-1px);
      }
    }
  }
}

// Controles
.controls-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .search-filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;

    @media (min-width: 768px) {
      flex-direction: row;
      max-width: 500px;
    }

    .search-box {
      position: relative;
      flex: 1;

      .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid $border-color;
        border-radius: 0.5rem;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: $primary-main;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: $text-secondary;
      }
    }

    .filter-select {
      padding: 0.75rem;
      border: 1px solid $border-color;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      background: white;
      min-width: 150px;

      &:focus {
        outline: none;
        border-color: $primary-main;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }

  .view-controls {
    display: flex;
    align-items: center;
    gap: 1rem;

    .view-toggle {
      display: flex;
      border: 1px solid $border-color;
      border-radius: 0.5rem;
      overflow: hidden;

      .view-button {
        padding: 0.5rem 0.75rem;
        border: none;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          background: $primary-main;
          color: white;
        }

        &:hover:not(.active) {
          background: $gray-50;
        }
      }
    }

    .selection-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .selection-count {
        font-size: 0.875rem;
        color: $text-secondary;
      }

      .action-button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        &.danger {
          background: $error-red;
          color: white;

          &:hover {
            background: darken($error-red, 10%);
          }
        }

        &.secondary {
          background: $gray-100;
          color: $text-primary;

          &:hover {
            background: $gray-200;
          }
        }
      }
    }
  }
}

// Estados de carga y vacío
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid $gray-200;
    border-top: 4px solid $primary-main;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: $text-primary;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: $text-secondary;
    margin: 0;
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

// Grid de documentos
.documents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  &.list-view {
    grid-template-columns: 1fr;

    .document-card {
      display: flex;
      align-items: center;
      padding: 1rem;

      .document-header {
        flex-shrink: 0;
        margin-right: 1rem;
      }

      .document-content {
        flex: 1;
        margin-right: 1rem;
      }

      .document-actions {
        flex-shrink: 0;
        flex-direction: row;
        gap: 0.5rem;
      }
    }
  }
}

.document-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    border-color: $primary-main;
    background: $primary-light;
  }

  &.processing {
    opacity: 0.7;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 1.5s infinite;
    }
  }

  .document-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    .document-checkbox {
      margin-right: 0.75rem;
    }

    .document-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;

      .type-icon {
        font-size: 1.25rem;
      }

      .type-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: $text-secondary;
      }
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;

      &.completed {
        background: $success-green;
        color: white;
      }

      &.processing {
        background: $warning-yellow;
        color: $text-primary;
      }

      &.error {
        background: $error-red;
        color: white;
      }
    }
  }

  .document-content {
    margin-bottom: 1rem;

    .document-name {
      font-size: 1rem;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 0.25rem 0;
      line-height: 1.4;
    }

    .document-original-name {
      font-size: 0.875rem;
      color: $text-secondary;
      margin: 0 0 0.5rem 0;
    }

    .document-description {
      font-size: 0.875rem;
      color: $text-secondary;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }

    .document-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;

      .meta-item {
        font-size: 0.75rem;
        color: $text-secondary;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
    }
  }

  .document-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    @media (min-width: 640px) {
      flex-direction: row;
    }

    .action-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.primary {
        background: $primary-main;
        color: white;

        &:hover:not(:disabled) {
          background: $primary-dark;
        }
      }

      &.secondary {
        background: $gray-100;
        color: $text-primary;

        &:hover {
          background: $gray-200;
        }

        &.disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
          pointer-events: none;
          
          &:hover {
            background: #f5f5f5;
            transform: none;
          }
        }
      }

      &.danger {
        background: $error-red;
        color: white;

        &:hover {
          background: darken($error-red, 10%);
        }
      }
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

// Modales
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0;

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: $text-primary;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: $text-secondary;

      &:hover {
        color: $text-primary;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;

    .selected-files {
      margin-bottom: 1.5rem;

      h4 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
        color: $text-primary;
      }

      .file-list {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid $border-color;
        border-radius: 0.5rem;

        .file-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-bottom: 1px solid $border-color;

          &:last-child {
            border-bottom: none;
          }

          .file-icon {
            font-size: 1.25rem;
          }

          .file-name {
            flex: 1;
            font-size: 0.875rem;
            color: $text-primary;
          }

          .file-size {
            font-size: 0.75rem;
            color: $text-secondary;
          }
        }
      }
    }

    .upload-form {
      .form-group {
        margin-bottom: 1rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: $text-primary;
        }

        .form-select,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid $border-color;
          border-radius: 0.5rem;
          font-size: 0.875rem;

          &:focus {
            outline: none;
            border-color: $primary-main;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }
      }
    }

    .upload-progress {
      margin-top: 1rem;

      .progress-bar {
        width: 100%;
        height: 8px;
        background: $gray-200;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;

        .progress-fill {
          height: 100%;
          background: $primary-main;
          transition: width 0.3s ease;
        }
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: $text-secondary;
        text-align: center;
      }
    }

    .document-info {
      padding: 1rem;
      background: $gray-50;
      border-radius: 0.5rem;
      margin-top: 1rem;
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 0 1.5rem 1.5rem;

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.primary {
        background: $primary-main;
        color: white;

        &:hover:not(:disabled) {
          background: $primary-dark;
        }
      }

      &.secondary {
        background: $gray-100;
        color: $text-primary;

        &:hover {
          background: $gray-200;
        }
      }

      &.danger {
        background: $error-red;
        color: white;

        &:hover {
          background: darken($error-red, 10%);
        }
      }
    }
  }
}
</style>