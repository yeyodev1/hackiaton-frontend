import APIBase from './httpBase'
import type { AxiosResponse } from 'axios'

// Interfaces para tipado fuerte
interface RegisterData {
  name: string
  email: string
  password: string
  companyName: string
  country: string
}

interface LoginData {
  email: string
  password: string
}

interface User {
  id: string
  name: string
  email: string
  companyName: string
  country: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface Workspace {
  id: string
  name: string
  isFullyConfigured: boolean
  status: string
  country: {
    name: string
    code: string
  }
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    workspace?: Workspace
    token: string
  }
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

class AuthService extends APIBase {
  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.post<AuthResponse>(
        'auth/register',
        userData
      )
      
      // Guardar token en localStorage si el registro es exitoso
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('access_token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error en registro:', error)
      throw {
        success: false,
        message: error.message || 'Error al registrar usuario',
        status: error.status || 500
      }
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.post<LoginResponse>(
        'auth/login',
        credentials
      )
      
      // Guardar token en localStorage si el login es exitoso
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('access_token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))
      }
      
      return response.data
    } catch (error: any) {
      console.error('Error en login:', error)
      throw {
        success: false,
        message: error.message || 'Error al iniciar sesión',
        status: error.status || 500
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    return !!token
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
      } catch (error) {
        console.error('Error parsing user from localStorage:', error)
        return null
      }
    }
    return null
  }

  /**
   * Obtiene el token de acceso actual
   */
  getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  /**
   * Verifica el token con el servidor
   */
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.get<{ success: boolean }>('auth/verify')
      return response.data.success
    } catch (error) {
      console.error('Error verificando token:', error)
      this.logout() // Limpiar datos si el token no es válido
      return false
    }
  }
}

export default new AuthService()
export type { RegisterData, LoginData, User, AuthResponse, LoginResponse }