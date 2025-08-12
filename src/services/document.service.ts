import APIBase from './httpBase'
import mockDataService from './mockData.service'
import environment from '@/config/environment'

// Tipos de documentos soportados
export type DocumentType = 'contract' | 'pliego' | 'propuesta' | 'constitution' | 'other'

// Estados de procesamiento del documento
export type DocumentStatus = 'processing' | 'completed' | 'error'

// Interfaz principal del documento
export interface Document {
  id: string // Backend usa 'id' en lugar de '_id'
  name: string
  type: DocumentType
  description?: string
  uploadedAt: string
  hasExtractedText?: boolean // Campo que devuelve el backend
  // Campos adicionales para compatibilidad con el frontend
  _id?: string
  originalName?: string
  size?: number
  mimeType?: string
  updatedAt?: string
  workspaceId?: string
  uploadedBy?: string
  url?: string
  thumbnailUrl?: string
  status?: DocumentStatus
  metadata?: {
    pages?: number
    duration?: number
    dimensions?: {
      width: number
      height: number
    }
  }
}

// Request interfaces
export interface UploadDocumentRequest {
  file: File
  type: DocumentType
  description?: string
}

export interface GetDocumentsRequest {
  page?: number
  limit?: number
  type?: DocumentType
  search?: string
  sortBy?: 'name' | 'uploadedAt' | 'size'
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateDocumentRequest {
  name?: string
  description?: string
  type?: DocumentType
}

// Response interfaces
export interface UploadDocumentResponse {
  success: boolean
  message: string
  document: Document
}

export interface GetDocumentsResponse {
  success: boolean
  message: string
  documents: Document[]
  // El backend no devuelve estos campos, los agregamos para compatibilidad
  totalCount?: number
  pagination?: {
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface DeleteDocumentResponse {
  success: boolean
  message: string
}

export interface UpdateDocumentResponse {
  success: boolean
  message: string
  document: Document
}

/**
 * Servicio para manejar operaciones de documentos
 * Implementa todas las operaciones CRUD para documentos del workspace
 */
class DocumentService extends APIBase {
  private readonly endpoint = 'document'

  /**
   * Verifica si el error es de red/conectividad
   */
  private isNetworkError(error: any): boolean {
    return (
      !error.response ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNREFUSED' ||
      error.message?.includes('Network Error')
    )
  }

  /**
   * Sube un nuevo documento al workspace
   */
  async uploadDocument(
    file: File,
    type: DocumentType,
    description?: string,
  ): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData()
      formData.append('document', file) // Backend espera 'document', no 'file'
      formData.append('documentType', type) // Backend espera 'documentType'
      formData.append('title', file.name.split('.')[0]) // Backend requiere 'title'
      if (description) {
        formData.append('description', description)
      }

      const response = await this.post<UploadDocumentResponse>(`${this.endpoint}/upload`, formData)

      return response.data
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error uploading document, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.uploadDocument(file, type, description)
      }

      throw new Error(error.response?.data?.message || 'Error al subir el documento')
    }
  }

  /**
   * Obtiene todos los documentos del workspace
   */
  async getWorkspaceDocuments(params: GetDocumentsRequest = {}): Promise<GetDocumentsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.type) queryParams.append('type', params.type)
      if (params.search) queryParams.append('search', params.search)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      const response = await this.get<GetDocumentsResponse>(
        `${this.endpoint}/workspace-documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
      )

      return response.data
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error fetching documents, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.getWorkspaceDocuments(params)
      }

      throw new Error(error.response?.data?.message || 'Error al obtener los documentos')
    }
  }

  /**
   * Elimina un documento
   */
  async deleteDocument(documentId: string): Promise<DeleteDocumentResponse> {
    try {
      const response = await this.delete<DeleteDocumentResponse>(`${this.endpoint}/${documentId}`)

      return response.data
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error deleting document, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.deleteDocument(documentId)
      }

      throw new Error(error.response?.data?.message || 'Error al eliminar el documento')
    }
  }

  /**
   * Actualiza un documento
   */
  async updateDocument(
    documentId: string,
    updates: UpdateDocumentRequest,
  ): Promise<UpdateDocumentResponse> {
    try {
      const response = await this.put<UpdateDocumentResponse>(
        `${this.endpoint}/${documentId}`,
        updates,
      )

      return response.data
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error updating document, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.updateDocument(documentId, updates)
      }

      throw new Error(error.response?.data?.message || 'Error al actualizar el documento')
    }
  }

  /**
   * Descarga un documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await this.get<Blob>(`${this.endpoint}/${documentId}/download`, {
        responseType: 'blob',
      })

      return response.data
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error downloading document, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.downloadDocument(documentId)
      }

      throw new Error(error.response?.data?.message || 'Error al descargar el documento')
    }
  }

  /**
   * Obtiene la URL de vista previa de un documento
   */
  async getDocumentPreview(documentId: string): Promise<string> {
    try {
      const response = await this.get<{ previewUrl: string }>(
        `${this.endpoint}/${documentId}/preview`,
      )

      return response.data.previewUrl
    } catch (error: any) {
      if (environment.enableDebugLogs) {
        console.error('Error getting document preview, falling back to mock data:', error)
      }

      // Fallback a datos mock si el backend no está disponible
      if (environment.useMockData || this.isNetworkError(error)) {
        return await mockDataService.getDocumentPreview(documentId)
      }

      throw new Error(error.response?.data?.message || 'Error al obtener la vista previa')
    }
  }
}

// Exportar instancia singleton
const documentService = new DocumentService()
export default documentService
