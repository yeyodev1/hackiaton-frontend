import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import VerifyView from '../views/VerifyView.vue'
import WorkspaceSetupView from '../views/WorkspaceSetupView.vue'

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
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/HomeView.vue'), // Temporal, usar HomeView como dashboard
    },
  ],
})

export default router
