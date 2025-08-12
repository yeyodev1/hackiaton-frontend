import type { Document, DocumentType, UploadDocumentResponse, GetDocumentsResponse, DeleteDocumentResponse, UpdateDocumentResponse, GetDocumentsRequest, UpdateDocumentRequest } from './document.service'

/**
 * Servicio de datos mock para desarrollo y testing
 * Simula las respuestas del backend cuando no está disponible
 */
class MockDataService {
  private mockDocuments: Document[] = [
    {
      id: 'doc_1',
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
      status: 'completed',
      hasExtractedText: true,
      metadata: { pages: 15 }
    },
    {
      id: 'doc_2',
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
      status: 'completed',
      hasExtractedText: false,
      metadata: { pages: 8 }
    },
    {
      id: 'doc_3',
      _id: 'doc_3',
      name: 'Propuesta Técnica Final',
      originalName: 'propuesta_final.pdf',
      type: 'propuesta',
      size: 3145728,
      mimeType: 'application/pdf',
      description: 'Propuesta técnica y económica final',
      uploadedAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      workspaceId: 'workspace_1',
      uploadedBy: 'user_1',
      url: '#',
      status: 'completed',
      hasExtractedText: true,
      metadata: { pages: 25 }
    }
  ]

  /**
   * Simula la subida de un documento
   */
  async uploadDocument(
    file: File,
    type: DocumentType,
    description?: string
  ): Promise<UploadDocumentResponse> {
    // Simular delay de red
    await this.delay(1000 + Math.random() * 2000)

    const mockDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      status: 'completed',
      hasExtractedText: false,
      metadata: {
        pages: type === 'contract' ? Math.floor(Math.random() * 50) + 1 : undefined
      }
    }

    this.mockDocuments.unshift(mockDocument)

    return {
      success: true,
      message: 'Documento subido correctamente (modo desarrollo)',
      document: mockDocument
    }
  }

  /**
   * Simula la obtención de documentos del workspace
   */
  async getWorkspaceDocuments(params: GetDocumentsRequest = {}): Promise<GetDocumentsResponse> {
    // Simular delay de red
    await this.delay(500 + Math.random() * 1000)

    let filteredDocuments = [...this.mockDocuments]

    // Aplicar filtros
    if (params.type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === params.type)
    }

    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.originalName?.toLowerCase().includes(searchTerm) ||
        doc.description?.toLowerCase().includes(searchTerm)
      )
    }

    // Aplicar ordenamiento
    if (params.sortBy) {
      filteredDocuments.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (params.sortBy) {
          case 'name':
            aValue = a.name
            bValue = b.name
            break
          case 'uploadedAt':
            aValue = new Date(a.uploadedAt)
            bValue = new Date(b.uploadedAt)
            break
          case 'size':
            aValue = a.size || 0
            bValue = b.size || 0
            break
          default:
            return 0
        }

        if (params.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        }
      })
    }

    // Aplicar paginación
    const page = params.page || 1
    const limit = params.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

    return {
      success: true,
      message: 'Documentos obtenidos correctamente (modo desarrollo)',
      documents: paginatedDocuments,
      totalCount: filteredDocuments.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(filteredDocuments.length / limit),
        hasNext: endIndex < filteredDocuments.length,
        hasPrev: page > 1
      }
    }
  }

  /**
   * Simula la eliminación de un documento
   */
  async deleteDocument(documentId: string): Promise<DeleteDocumentResponse> {
    // Simular delay de red
    await this.delay(500 + Math.random() * 1000)

    const index = this.mockDocuments.findIndex(doc => doc.id === documentId || doc._id === documentId)
    
    if (index === -1) {
      throw new Error('Documento no encontrado')
    }

    this.mockDocuments.splice(index, 1)

    return {
      success: true,
      message: 'Documento eliminado correctamente (modo desarrollo)'
    }
  }

  /**
   * Simula la actualización de un documento
   */
  async updateDocument(
    documentId: string,
    updates: UpdateDocumentRequest
  ): Promise<UpdateDocumentResponse> {
    // Simular delay de red
    await this.delay(500 + Math.random() * 1000)

    const document = this.mockDocuments.find(doc => doc.id === documentId || doc._id === documentId)
    
    if (!document) {
      throw new Error('Documento no encontrado')
    }

    // Aplicar actualizaciones
    if (updates.name) document.name = updates.name
    if (updates.description !== undefined) document.description = updates.description
    if (updates.type) document.type = updates.type
    document.updatedAt = new Date().toISOString()

    return {
      success: true,
      message: 'Documento actualizado correctamente (modo desarrollo)',
      document
    }
  }

  /**
   * Simula la descarga de un documento
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    // Simular delay de red
    await this.delay(1000 + Math.random() * 2000)

    const document = this.mockDocuments.find(doc => doc.id === documentId || doc._id === documentId)
    
    if (!document) {
      throw new Error('Documento no encontrado')
    }

    // Crear un blob mock
    const content = `Contenido mock del documento: ${document.name}`
    return new Blob([content], { type: document.mimeType || 'application/octet-stream' })
  }

  /**
   * Simula la obtención de una vista previa del documento
   */
  async getDocumentPreview(documentId: string): Promise<string> {
    // Simular delay de red
    await this.delay(500 + Math.random() * 1000)

    const document = this.mockDocuments.find(doc => doc.id === documentId || doc._id === documentId)
    
    if (!document) {
      throw new Error('Documento no encontrado')
    }

    // Retornar una URL de vista previa mock
    return `data:text/plain;base64,${btoa(`Vista previa del documento: ${document.name}`)}`
  }

  /**
   * Simula delay de red
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

const mockDataService = new MockDataService()
export default mockDataService