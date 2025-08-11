import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'

// Interfaces para Country
export interface Country {
  name: string
  code: string
  key: string
}

// Interfaces para Workspace Member
export interface WorkspaceMember {
  userId: string
  role: 'owner' | 'admin' | 'analyst' | 'viewer'
}

// Interfaces para Workspace Usage
export interface WorkspaceUsage {
  documentCount: number
  analysisCount: number
}

// Interfaces para Workspace Notifications
export interface WorkspaceNotifications {
  webhookUrl?: string
}

// Interfaces para Workspace Document
export interface WorkspaceDocument {
  id: string
  name: string
  originalName: string
  type: 'contract' | 'pliego' | 'propuesta'
  url: string
  description: string
  extractedText: string
  uploadedAt: Date
  uploadedBy: string
}

// Interfaces para Legal Documents
export interface LegalDocuments {
  constitution?: string
  procurementLaw?: string
  procurementRegulation?: string
  laborCode?: string
  authority?: string
  companyDocument?: {
    name: string
    url: string
    uploadedAt: Date
  }
}

// Interfaces para Analysis Config
export interface AnalysisConfig {
  riskThresholds: {
    legal: number
    technical: number
    financial: number
  }
  scoringWeights: {
    compliance: number
    risk: number
    completeness: number
  }
}

// Interfaces para NLP Settings
export interface NLPSettings {
  language: 'es' | 'en'
  extractionRules: string[]
}

// Interfaces para Workspace Settings
export interface WorkspaceSettings {
  country: {
    name: string
    code: string
  }
  documents?: WorkspaceDocument[]
  legalDocuments: LegalDocuments
  analysisConfig: AnalysisConfig
  nlpSettings: NLPSettings
}

// Interface principal del Workspace
export interface Workspace {
  _id: string
  name: string
  companyId: string
  ownerId: string
  status: 'active' | 'paused' | 'archived'
  isFullyConfigured: boolean
  members: WorkspaceMember[]
  settings: WorkspaceSettings
  usage: WorkspaceUsage
  notifications: WorkspaceNotifications
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

// Interfaces para las respuestas de la API
export interface GetWorkspaceResponse {
  success: boolean
  message: string
  workspace: Workspace
  availableCountries: Country[]
}

export interface UpdateCountryResponse {
  success: boolean
  message: string
  workspace: Workspace
  legalDocumentPaths?: {
    constitution: string
    procurementLaw: string
    procurementRegulation: string
  } | null
}

export interface UploadDocumentResponse {
  success: boolean
  message: string
  document: {
    name: string
    url: string
  }
  workspace: Workspace
}

export interface CompleteSetupResponse {
  success: boolean
  message: string
  workspace: Workspace
}

// Interfaces para requests
export interface UpdateCountryRequest {
  country: string
}

export interface UploadDocumentRequest {
  file: File
  documentType?: string
}

/**
 * Servicio para manejar todas las operaciones relacionadas con workspaces
 * Implementa las funcionalidades de gestión de workspace, configuración de país,
 * subida de documentos y completado de setup
 */
class WorkspaceService extends APIBase {
  private readonly baseEndpoint = 'workspace'

  /**
   * Obtiene el workspace del usuario autenticado
   * @returns Promise con los datos del workspace y países disponibles
   */
  async getUserWorkspace(): Promise<GetWorkspaceResponse> {
    try {
      const response: AxiosResponse<GetWorkspaceResponse> = await this.get(`${this.baseEndpoint}/my-workspace`)
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al obtener el workspace',
      }
    }
  }

  /**
   * Actualiza el país del workspace
   * @param country - Código del país seleccionado
   * @returns Promise con el workspace actualizado
   */
  async updateWorkspaceCountry(country: string): Promise<UpdateCountryResponse> {
    try {
      const requestData: UpdateCountryRequest = { country }

      const response: AxiosResponse<UpdateCountryResponse> = await this.put(
        `${this.baseEndpoint}/country`,
        requestData,
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al actualizar el país del workspace',
      }
    }
  }

  /**
   * Sube un documento de la empresa al workspace
   * @param file - Archivo a subir
   * @param documentType - Tipo de documento (opcional)
   * @returns Promise con la información del documento subido
   */
  async uploadCompanyDocument(file: File, documentType?: string): Promise<UploadDocumentResponse> {
    try {
      const response: AxiosResponse<UploadDocumentResponse> = await this.uploadFile(
        `${this.baseEndpoint}/upload-document`,
        file,
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al subir el documento',
      }
    }
  }

  /**
   * Completa la configuración del workspace
   * @returns Promise con el workspace completamente configurado
   */
  async completeWorkspaceSetup(): Promise<CompleteSetupResponse> {
    try {
      const response: AxiosResponse<CompleteSetupResponse> = await this.put(
        `${this.baseEndpoint}/complete-setup`,
        {},
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al completar la configuración del workspace',
      }
    }
  }

  /**
   * Actualiza la configuración del workspace
   * @param settings - Configuración parcial a actualizar
   * @returns Promise con el workspace actualizado
   */
  async updateWorkspaceSettings(
    settings: Partial<WorkspaceSettings>,
  ): Promise<UpdateCountryResponse> {
    try {
      const response: AxiosResponse<UpdateCountryResponse> = await this.patch(
        `${this.baseEndpoint}/settings`,
        { settings },
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al actualizar la configuración del workspace',
      }
    }
  }

  /**
   * Actualiza los datos básicos del workspace
   * @param data - Datos del workspace a actualizar
   * @returns Promise con el workspace actualizado
   */
  async updateWorkspaceData(
    data: Partial<Pick<Workspace, 'name' | 'status'>>,
  ): Promise<UpdateCountryResponse> {
    try {
      const response: AxiosResponse<UpdateCountryResponse> = await this.patch(
        `${this.baseEndpoint}`,
        data,
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al actualizar los datos del workspace',
      }
    }
  }

  /**
   * Obtiene los países disponibles para configuración
   * @returns Promise con la lista de países disponibles
   */
  async getAvailableCountries(): Promise<Country[]> {
    try {
      const response: AxiosResponse<{ countries: Country[] }> = await this.get(
        `${this.baseEndpoint}/countries`,
      )
      return response.data.countries
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al obtener los países disponibles',
      }
    }
  }

  /**
   * Obtiene el progreso de configuración del workspace
   * @returns Promise con el porcentaje de progreso
   */
  async getSetupProgress(): Promise<{ progress: number; nextStep?: string }> {
    try {
      const response: AxiosResponse<{ progress: number; nextStep?: string }> = await this.get(
        `${this.baseEndpoint}/setup-progress`,
      )
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al obtener el progreso de configuración',
      }
    }
  }

  /**
   * Valida si el workspace está listo para ser usado
   * @returns Promise con el estado de validación
   */
  async validateWorkspaceSetup(): Promise<{
    isValid: boolean
    missingSteps: string[]
    canProceed: boolean
  }> {
    try {
      const response: AxiosResponse<{
        isValid: boolean
        missingSteps: string[]
        canProceed: boolean
      }> = await this.get(`${this.baseEndpoint}/validate-setup`)
      return response.data
    } catch (error: any) {
      throw {
        status: error.status || 500,
        message: error.message || 'Error al validar la configuración del workspace',
      }
    }
  }
}

// Exportar instancia singleton del servicio
const workspaceService = new WorkspaceService()
export default workspaceService
