<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { triggerToast } = useToast()

const isLoading = ref(true)
const verificationStatus = ref<'pending' | 'success' | 'error'>('pending')
const message = ref('')

const verifyEmail = async (token: string) => {
  try {
    isLoading.value = true
    const response = await authService.verifyEmail(token)
    
    if (response.success) {
      verificationStatus.value = 'success'
      message.value = 'Email verificado exitosamente'
      triggerToast('Email verificado correctamente. Serás redirigido al login.', 'success')
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      verificationStatus.value = 'error'
      message.value = 'Error al verificar el email'
      triggerToast('Error al verificar el email. El token puede haber expirado.', 'error')
    }
  } catch (error) {
    verificationStatus.value = 'error'
    message.value = 'Error de conexión'
    triggerToast('Error de conexión. Por favor, intenta nuevamente.', 'error')
    console.error('Error verifying email:', error)
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  const token = route.params.token as string
  if (token) {
    verifyEmail(token)
  } else {
    verificationStatus.value = 'error'
    message.value = 'Token de verificación no encontrado'
    isLoading.value = false
    triggerToast('Token de verificación no válido', 'error')
  }
})
</script>

<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="verify-header">
        <h1>Verificación de Email</h1>
      </div>
      
      <div class="verify-content">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Verificando tu email...</p>
        </div>
        
        <!-- Success State -->
        <div v-else-if="verificationStatus === 'success'" class="success-state">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>¡Email Verificado!</h2>
          <p>{{ message }}</p>
          <p class="redirect-message">Serás redirigido al login en unos segundos...</p>
          <button @click="goToLogin" class="btn-primary">
            Ir al Login Ahora
          </button>
        </div>
        
        <!-- Error State -->
        <div v-else class="error-state">
          <div class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2>Error de Verificación</h2>
          <p>{{ message }}</p>
          <div class="error-actions">
            <button @click="goToLogin" class="btn-secondary">
              Ir al Login
            </button>
            <button @click="goToRegister" class="btn-primary">
              Registrarse Nuevamente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';

.verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-light 0%, $background-white 100%);
  padding: 1rem;
}

.verify-card {
  background: $white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.verify-header {
  margin-bottom: 2rem;
  
  h1 {
    color: $primary-dark;
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }
}

.verify-content {
  .loading-state {
    padding: 2rem 0;
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid $primary-light;
      border-top: 4px solid $accent-blue;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    p {
      color: $text-light;
      font-size: 1.1rem;
      margin: 0;
    }
  }
  
  .success-state {
    padding: 1rem 0;
    
    .success-icon {
      color: $accent-blue;
      margin-bottom: 1rem;
    }
    
    h2 {
      color: $primary-dark;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
    
    p {
      color: $text-light;
      font-size: 1rem;
      margin: 0 0 1rem;
      
      &.redirect-message {
        font-size: 0.9rem;
        font-style: italic;
        color: lighten($text-light, 10%);
      }
    }
  }
  
  .error-state {
    padding: 1rem 0;
    
    .error-icon {
      color: $primary-dark;
      margin-bottom: 1rem;
    }
    
    h2 {
      color: $primary-dark;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
    
    p {
      color: $text-light;
      font-size: 1rem;
      margin: 0 0 2rem;
    }
    
    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

.btn-primary {
  background: linear-gradient(135deg, $accent-blue 0%, darken($accent-blue, 10%) 100%);
  color: $white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}

.btn-secondary {
  background: transparent;
  color: $primary-dark;
  border: 2px solid $primary-light;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background: $primary-light;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>