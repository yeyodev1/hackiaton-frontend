/**
 * Configuración de entorno para la aplicación
 * Maneja las diferencias entre desarrollo y producción
 */

export interface EnvironmentConfig {
  isDevelopment: boolean
  apiBaseUrl: string
  useMockData: boolean
  enableDebugLogs: boolean
}

// Detectar si estamos en modo desarrollo
const isDevelopment = import.meta.env.DEV

// URL base de la API
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Usar datos mock cuando no hay backend disponible
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false

// Habilitar logs de debug en desarrollo
const enableDebugLogs = isDevelopment

export const environment: EnvironmentConfig = {
  isDevelopment,
  apiBaseUrl,
  useMockData,
  enableDebugLogs
}

export default environment