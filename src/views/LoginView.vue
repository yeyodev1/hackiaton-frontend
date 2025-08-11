<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import type { LoginData } from '@/services/auth.service'

const router = useRouter()
const { triggerToast } = useToast()

// Estado del formulario
const formData = reactive<LoginData>({
  email: '',
  password: ''
})

// Estados de UI
const isLoading = ref(false)
const showPassword = ref(false)

// Validaciones
const validateForm = (): boolean => {
  if (!formData.email.trim()) {
    triggerToast('El email es requerido', 'error')
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    triggerToast('Formato de email inválido', 'error')
    return false
  }
  
  if (!formData.password) {
    triggerToast('La contraseña es requerida', 'error')
    return false
  }
  
  return true
}

// Manejo del envío del formulario
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await authService.login(formData)
    
    if (response.success) {
      triggerToast('¡Inicio de sesión exitoso! Redirigiendo...', 'success')
      // Redirigir al home después de un login exitoso
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (error: any) {
    triggerToast(error.message || 'Error al iniciar sesión', 'error')
  } finally {
    isLoading.value = false
  }
}

// Navegar al registro
const goToRegister = () => {
  router.push('/register')
}

// Toggle mostrar contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h1 class="login-title">Bienvenido</h1>
        <p class="login-subtitle">
          Accede a tu asistente legal inteligente
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="tu@empresa.com"
            required
          />
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input password-input"
              placeholder="Ingresa tu contraseña"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Botón de envío -->
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p class="register-link">
          ¿No tienes una cuenta?
          <button @click="goToRegister" class="link-button">
            Crear Cuenta
          </button>
        </p>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="decorative-elements">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background-white 0%, $primary-light 100%);
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.login-card {
  background: $white;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba($primary-dark, 0.12);
  padding: 3.5rem;
  width: 100%;
  max-width: 450px;
  border: 1px solid rgba($primary-light, 0.2);
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 2.5rem 2rem;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 2rem 1.5rem;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2.5rem;
  }
}

.login-title {
  font-family: $font-principal;
  font-size: 3rem;
  font-weight: 700;
  color: $primary-dark;
  margin: 0 0 1rem 0;
  line-height: 1.1;
  background: linear-gradient(135deg, $primary-dark 0%, $accent-blue 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
}

.login-subtitle {
  font-family: $font-secondary;
  font-size: 1.15rem;
  color: rgba($primary-dark, 0.7);
  margin: 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-family: $font-secondary;
  font-size: 1rem;
  font-weight: 600;
  color: $primary-dark;
  margin: 0;
}

.form-input {
  font-family: $font-secondary;
  font-size: 1.05rem;
  padding: 1.25rem 1.5rem;
  border: 2px solid rgba($primary-light, 0.4);
  border-radius: 16px;
  background: rgba($white, 0.8);
  color: $primary-dark;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: $accent-blue;
    box-shadow: 0 0 0 4px rgba($accent-blue, 0.1);
    background: $white;
  }

  &::placeholder {
    color: rgba($primary-dark, 0.5);
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 1rem;
  }
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: 3.5rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba($primary-dark, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $accent-blue;
    background: rgba($accent-blue, 0.1);
  }
}

.error-message {
  background: rgba(#dc3545, 0.1);
  color: #dc3545;
  padding: 1.25rem;
  border-radius: 12px;
  font-family: $font-secondary;
  font-size: 0.95rem;
  border-left: 4px solid #dc3545;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '⚠️';
    font-size: 1.2rem;
  }
}

.success-message {
  background: rgba(#28a745, 0.1);
  color: #28a745;
  padding: 1.25rem;
  border-radius: 12px;
  font-family: $font-secondary;
  font-size: 0.95rem;
  border-left: 4px solid #28a745;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '✅';
    font-size: 1.2rem;
  }
}

.submit-button {
  font-family: $font-secondary;
  font-size: 1.15rem;
  font-weight: 600;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, $accent-blue 0%, darken($accent-blue, 15%) 100%);
  color: $white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba($white, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba($accent-blue, 0.4);

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
    font-size: 1.05rem;
  }
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba($white, 0.3);
  border-radius: 50%;
  border-top-color: $white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-footer {
  text-align: center;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba($primary-light, 0.2);

  @media (max-width: 768px) {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
}

.register-link {
  font-family: $font-secondary;
  font-size: 1rem;
  color: rgba($primary-dark, 0.7);
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  color: $accent-blue;
  font-family: $font-secondary;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;

  &:hover {
    color: darken($accent-blue, 15%);
    background: rgba($accent-blue, 0.1);
  }
}

// Elementos decorativos
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba($accent-blue, 0.1), rgba($primary-light, 0.1));
  animation: float 6s ease-in-out infinite;

  &.shape-1 {
    width: 120px;
    height: 120px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 80px;
    height: 80px;
    top: 70%;
    right: 15%;
    animation-delay: 2s;
  }

  &.shape-3 {
    width: 60px;
    height: 60px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .floating-shape {
    display: none;
  }
}
</style>