import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/auth.service'
import type {
  RegisterData,
  LoginData,
  User,
  AuthResponse,
  LoginResponse,
} from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import router from '@/router'

/**
 * Store de autenticación que maneja el estado del usuario,
 * token de acceso y todas las operaciones de autenticación
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const lastLoginTime = ref<Date | null>(null)

  // Composables
  const { triggerToast } = useToast()

  // Getters computados
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  const isEmailVerified = computed(() => {
    return user.value?.isVerified ?? false
  })

  const userInitials = computed(() => {
    if (!user.value?.name) return ''
    const names = user.value.name.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  })

  const userDisplayName = computed(() => {
    return user.value?.name || 'Usuario'
  })

  const userCompany = computed(() => {
    return user.value?.companyName || ''
  })

  const userCountry = computed(() => {
    return user.value?.country || ''
  })

  // Acciones

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  const initializeAuth = async (): Promise<void> => {
    if (isInitialized.value) return

    try {
      isLoading.value = true

      // Obtener datos del localStorage
      const storedToken = authService.getToken()
      const storedUser = authService.getCurrentUser()

      if (storedToken && storedUser) {
        // Verificar que el token siga siendo válido
        const isValidToken = await authService.verifyToken()

        if (isValidToken) {
          token.value = storedToken
          user.value = storedUser
          lastLoginTime.value = new Date()
        } else {
          // Token inválido, limpiar datos
          await logout()
        }
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error)
      await logout()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Registra un nuevo usuario
   */
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      isLoading.value = true

      const response: AuthResponse = await authService.register(userData)

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        lastLoginTime.value = new Date()

        triggerToast(
          'Cuenta creada exitosamente. Por favor revisa tu correo electrónico para verificar tu cuenta.',
          'success',
        )

        await router.push('/login')
      } else {
        throw new Error(response.message || 'Error en el registro')
      }
    } catch (error: any) {
      console.error('Error en registro:', error)
      triggerToast(error.message || 'Error al registrar usuario', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inicia sesión de usuario
   */
  const login = async (credentials: LoginData): Promise<void> => {
    try {
      isLoading.value = true

      const response: LoginResponse = await authService.login(credentials)

      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        lastLoginTime.value = new Date()

        triggerToast(`¡Bienvenido ${response.data.user.name}!`, 'success')

        // Redirigir al dashboard independientemente del estado de verificación
        // Nota: Permitimos acceso sin verificación de email
        await router.push('/dashboard')
      } else {
        throw new Error(response.message || 'Error en el login')
      }
    } catch (error: any) {
      console.error('Error en login:', error)
      triggerToast(error.message || 'Error al iniciar sesión', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true

      // Limpiar datos del servicio
      authService.logout()

      // Limpiar estado del store
      user.value = null
      token.value = null
      lastLoginTime.value = null

      triggerToast('Sesión cerrada correctamente', 'info')

      // Redirigir al login
      await router.push('/login')
    } catch (error: any) {
      console.error('Error en logout:', error)
      triggerToast('Error al cerrar sesión', 'error')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verifica el email del usuario
   */
  const verifyEmail = async (verificationToken: string): Promise<boolean> => {
    try {
      isLoading.value = true

      const response = await authService.verifyEmail(verificationToken)

      if (response.success) {
        // Actualizar el estado del usuario
        if (user.value) {
          user.value.isVerified = true
          // Actualizar en localStorage
          localStorage.setItem('user', JSON.stringify(user.value))
        }

        triggerToast('Email verificado correctamente', 'success')
        return true
      } else {
        triggerToast(response.message || 'Error al verificar email', 'error')
        return false
      }
    } catch (error: any) {
      console.error('Error verificando email:', error)
      triggerToast('Error al verificar email', 'error')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualiza los datos del usuario
   */
  const updateUserData = async (userData: Partial<User>): Promise<void> => {
    try {
      isLoading.value = true

      if (user.value) {
        // Actualizar datos localmente
        user.value = { ...user.value, ...userData }

        // Actualizar en localStorage
        localStorage.setItem('user', JSON.stringify(user.value))

        triggerToast('Datos actualizados correctamente', 'success')
      }
    } catch (error: any) {
      console.error('Error actualizando datos:', error)
      triggerToast('Error al actualizar datos', 'error')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresca el token de acceso
   */
  const refreshToken = async (): Promise<void> => {
    try {
      const isValid = await authService.verifyToken()

      if (!isValid) {
        await logout()
        throw new Error('Token expirado')
      }
    } catch (error: any) {
      console.error('Error refrescando token:', error)
      await logout()
      throw error
    }
  }

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   * Nota: Permitimos acceso sin verificación de email
   */
  const canAccessRoute = (routeName: string): boolean => {
    const publicRoutes = ['login', 'register', 'verify', 'forgot-password']

    if (!isAuthenticated.value) {
      return publicRoutes.includes(routeName)
    }

    // Permitir acceso a todas las rutas para usuarios autenticados
    // independientemente del estado de verificación de email
    return true
  }

  /**
   * Obtiene información de sesión
   */
  const getSessionInfo = () => {
    return {
      isAuthenticated: isAuthenticated.value,
      user: user.value,
      lastLoginTime: lastLoginTime.value,
      sessionDuration: lastLoginTime.value ? Date.now() - lastLoginTime.value.getTime() : 0,
    }
  }

  /**
   * Resetea el estado del store
   */
  const resetStore = (): void => {
    user.value = null
    token.value = null
    isLoading.value = false
    isInitialized.value = false
    lastLoginTime.value = null
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    isInitialized,
    lastLoginTime,

    // Getters
    isAuthenticated,
    isEmailVerified,
    userInitials,
    userDisplayName,
    userCompany,
    userCountry,

    // Acciones
    initializeAuth,
    register,
    login,
    logout,
    verifyEmail,
    updateUserData,
    refreshToken,
    canAccessRoute,
    getSessionInfo,
    resetStore,
  }
})
