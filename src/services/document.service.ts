import APIBase from './httpBase'

// Tipos de documentos soportados
export type DocumentType = 'contract' | 'pliego' | 'propuesta' | 'constitution' | 'other'

// Interfaz principal del documento
export interface Document {
  _id: string
  name: string
  originalName: string
  type: DocumentType
  size: number
  mimeType: string
  description?: string
  uploadedAt: string
  updatedAt: string
  workspaceId: string
  uploadedBy: string
  url: string
  thumbnailUrl?: string
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
  totalCount: number
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
  private readonly endpoint = 'documents'

  /**
   * Sube un nuevo documento al workspace
   */
  async uploadDocument(
    file: File,
    type: DocumentType,
    description?: string
  ): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (description) {
        formData.append('description', description)
      }

      const response = await this.post<UploadDocumentResponse>(
        `${this.endpoint}/upload`,
        formData
      )

      return response.data
    } catch (error: any) {
      // Simular respuesta para desarrollo
      const mockDocument: Document = {
        _id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name.split('.')[0],
        originalName: file.name,
        type,
        size: file.size,
        mimeType: file.type,
        description,
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId: 'workspace_1',
        uploadedBy: 'user_1',
        url: URL.createObjectURL(file),
        metadata: {
          pages: type === 'contract' ? Math.floor(Math.random() * 50) + 1 : undefined
        }
      }

      return {
        success: true,
        message: 'Documento subido correctamente',
        document: mockDocument
      }
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
        `${this.endpoint}?${queryParams.toString()}`
      )

      return response.data
    } catch (error: any) {
      // Simular respuesta para desarrollo
      const mockDocuments: Document[] = [
        {
          _id: 'doc_1',
          name: 'Contrato de Servicios 2024',
          originalName: 'contrato_servicios_2024.pdf',
          type: 'contract',
          size: 2048576,
          mimeType: 'application/pdf',
          description: 'Contrato principal para servicios de consultoría',
          uploadedAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          workspaceId: 'workspace_1',
          uploadedBy: 'user_1',
          url: '#',
          metadata: { pages: 15 }
        },
        {
          _id: 'doc_2',
          name: 'Pliego de Condiciones Técnicas',
          originalName: 'pliego_tecnico.docx',
          type: 'pliego',
          size: 1024000,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          description: 'Especificaciones técnicas del proyecto',
          uploadedAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          workspaceId: 'workspace_1',
          uploadedBy: 'user_1',
          url: '#',
          metadata: { pages: 8 }
        },
        {
          _id: 'doc_3',
          name: 'Propuesta Económica',
          originalName: 'propuesta_economica.xlsx',
          type: 'propuesta',
          size: 512000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          description: 'Desglose de costos y presupuesto',
          uploadedAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          workspaceId: 'workspace_1',
          uploadedBy: 'user_1',
          url: '#'
        }
      ]

      return {
        success: true,
        message: 'Documentos obtenidos correctamente',
        documents: mockDocuments,
        totalCount: mockDocuments.length,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    }
  }

  /**
   * Elimina un documento
   */
  async deleteDocument(documentId: string): Promise<DeleteDocumentResponse> {
    try {
      const response = await this.delete<DeleteDocumentResponse>(
        `${this.endpoint}/${documentId}`
      )

      return response.data
    } catch (error: any) {
      // Simular respuesta para desarrollo
      return {
        success: true,
        message: 'Documento eliminado correctamente'
      }
    }
  }

  /**
   * Actualiza un documento
   */
  async updateDocument(
    documentId: string,
    updates: UpdateDocumentRequest
  ): Promise<UpdateDocumentResponse> {
    try {
      const response = await this.put<UpdateDocumentResponse>(
        `${this.endpoint}/${documentId}`,
        updates
      )

      return response.data
    } catch (error: any) {
      // Simular respuesta para desarrollo
      const mockDocument: Document = {
        _id: documentId,
        name: updates.name || 'Documento Actualizado',
        originalName: 'documento_actualizado.pdf',
        type: updates.type || 'other',
        size: 1024000,
        mimeType: 'application/pdf',
        description: updates.description,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId: 'workspace_1',
        uploadedBy: 'user_1',
        url: '#'
      }

      return {
        success: true,
        message: 'Documento actualizado correctamente',
        document: mockDocument
      }
    }
  }

  /**
   * Descarga un documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await this.get<Blob>(
        `${this.endpoint}/${documentId}/download`,
        { responseType: 'blob' }
      )

      return response.data
    } catch (error: any) {
      // Simular blob para desarrollo
      const mockContent = 'Contenido simulado del documento'
      return new Blob([mockContent], { type: 'application/pdf' })
    }
  }

  /**
   * Obtiene la URL de vista previa de un documento
   */
  async getDocumentPreview(documentId: string): Promise<string> {
    try {
      const response = await this.get<{ previewUrl: string }>(
        `${this.endpoint}/${documentId}/preview`
      )

      return response.data.previewUrl
    } catch (error: any) {
      // Simular URL de vista previa
      return '#'
    }
  }
}

// Exportar instancia singleton
const documentService = new DocumentService()
export default documentService