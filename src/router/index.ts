import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import VerifyView from '../views/VerifyView.vue'
import WorkspaceSetupView from '../views/WorkspaceSetupView.vue'
import DocumentManagementView from '../views/DocumentManagementView.vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/verify/:token',
      name: 'verify',
      component: VerifyView,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyView,
    },
    {
      path: '/workspace-setup',
      name: 'workspace-setup',
      component: WorkspaceSetupView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/HomeView.vue'), // Temporal, usar HomeView como dashboard
      meta: { requiresAuth: true, requiresWorkspaceSetup: true }
    },
    {
      path: '/documents',
      name: 'documents',
      component: DocumentManagementView,
      meta: { requiresAuth: true, requiresWorkspaceSetup: true }
    },
    // {
    //   path: '/documents/:id',
    //   name: 'document-detail',
    //   component: () => import('../views/DocumentDetailView.vue'),
    //   meta: { requiresAuth: true, requiresWorkspaceSetup: true }
    // },
  ],
})

// Guard de navegación para verificar autenticación y configuración del workspace
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()

  // Inicializar auth si no está inicializado
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Rutas que no requieren autenticación
  const publicRoutes = ['home', 'login', 'register', 'verify', 'verify-email']
  const isPublicRoute = publicRoutes.includes(to.name as string)

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login' })
  }

  // Si el usuario está autenticado
  if (authStore.isAuthenticated) {
    // Inicializar workspace si no está inicializado
    if (!workspaceStore.isInitialized) {
      try {
        await workspaceStore.initializeWorkspace()
      } catch (error) {
        console.error('Error inicializando workspace:', error)
        // Si hay error al cargar workspace, continuar a workspace-setup
      }
    }

    // Si la ruta requiere workspace configurado y no lo está
    if (to.meta.requiresWorkspaceSetup && !workspaceStore.isWorkspaceConfigured) {
      // Permitir acceso a documents si al menos se ha seleccionado un país
      const hasCountrySelected = workspaceStore.selectedCountry?.code
      
      if (to.name === 'documents' && hasCountrySelected) {
        // Permitir acceso a documents si hay país seleccionado
        return next()
      }
      
      // Si no está en workspace-setup, redirigir allí
      if (to.name !== 'workspace-setup') {
        return next({ name: 'workspace-setup' })
      }
    }

    // Si está en una ruta pública pero ya está autenticado
    if (isPublicRoute) {
      // Si el workspace está configurado, ir a la gestión de documentos
      if (workspaceStore.isWorkspaceConfigured) {
        return next({ name: 'documents' })
      } else {
        // Si no está configurado, ir a workspace-setup
        return next({ name: 'workspace-setup' })
      }
    }
  }

  // Continuar con la navegación normal
  next()
})

export default router
