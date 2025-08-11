<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import type { RegisterData } from '@/services/auth.service'

const router = useRouter()
const { triggerToast } = useToast()

// Estado del formulario
const formData = reactive<RegisterData>({
  name: '',
  email: '',
  password: '',
  companyName: '',
  country: ''
})

// Estados de UI
const isLoading = ref(false)

// Lista de países para el select
const countries = [
  'Ecuador', 'Perú', 'Colombia', 'México', 'Argentina', 'Bolivia', 'Brasil',
  'Chile', 'Costa Rica', 'Cuba', 'El Salvador', 'Guatemala', 'Honduras',
  'Nicaragua', 'Panamá', 'Paraguay', 'República Dominicana', 'Uruguay',
  'Venezuela', 'España', 'Estados Unidos', 'Canadá'
]

// Validaciones
const validateForm = (): boolean => {
  if (!formData.name.trim()) {
    triggerToast('El nombre es requerido', 'error')
    return false
  }
  
  if (!formData.email.trim()) {
    triggerToast('El email es requerido', 'error')
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    triggerToast('Formato de email inválido', 'error')
    return false
  }
  
  if (formData.password.length < 6) {
    triggerToast('La contraseña debe tener al menos 6 caracteres', 'error')
    return false
  }
  
  if (!formData.companyName.trim()) {
    triggerToast('El nombre de la empresa es requerido', 'error')
    return false
  }
  
  if (!formData.country) {
    triggerToast('Selecciona un país', 'error')
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
    const response = await authService.register(formData)
    
    if (response.success) {
      triggerToast('¡Cuenta creada exitosamente! Redirigiendo...', 'success')
      // Redirigir al home después de un registro exitoso
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error: any) {
    triggerToast(error.message || 'Error al registrar usuario', 'error')
  } finally {
    isLoading.value = false
  }
}

// Navegar al login
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Header -->
      <div class="register-header">
        <h1 class="register-title">Crear Cuenta</h1>
        <p class="register-subtitle">
          Únete a la nueva era de la asistencia legal inteligente
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="register-form">
        <!-- Nombre -->
        <div class="form-group">
          <label for="name" class="form-label">Nombre Completo</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

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
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-input"
            placeholder="Mínimo 6 caracteres"
            required
          />
        </div>

        <!-- Empresa -->
        <div class="form-group">
          <label for="company" class="form-label">Nombre de la Empresa</label>
          <input
            id="company"
            v-model="formData.companyName"
            type="text"
            class="form-input"
            placeholder="Nombre de tu empresa o despacho"
            required
          />
        </div>

        <!-- País -->
        <div class="form-group">
          <label for="country" class="form-label">País</label>
          <select
            id="country"
            v-model="formData.country"
            class="form-select"
            required
          >
            <option value="" disabled>Selecciona tu país</option>
            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>

        <!-- Botón de envío -->
        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>
      </form>

      <!-- Footer -->
      <div class="register-footer">
        <p class="login-link">
          ¿Ya tienes una cuenta?
          <button @click="goToLogin" class="link-button">
            Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background-white 0%, $primary-light 100%);
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.register-card {
  background: $white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba($primary-dark, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba($primary-light, 0.3);

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
}

.register-title {
  font-family: $font-principal;
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-dark;
  margin: 0 0 1rem 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
}

.register-subtitle {
  font-family: $font-secondary;
  font-size: 1.1rem;
  color: rgba($primary-dark, 0.7);
  margin: 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1.25rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: $font-secondary;
  font-size: 0.95rem;
  font-weight: 600;
  color: $primary-dark;
  margin: 0;
}

.form-input,
.form-select {
  font-family: $font-secondary;
  font-size: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid rgba($primary-light, 0.5);
  border-radius: 12px;
  background: $white;
  color: $primary-dark;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: $accent-blue;
    box-shadow: 0 0 0 3px rgba($accent-blue, 0.1);
  }

  &::placeholder {
    color: rgba($primary-dark, 0.5);
  }

  @media (max-width: 768px) {
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }
}

.form-select {
  cursor: pointer;
  
  option {
    padding: 0.5rem;
  }
}

.error-message {
  background: rgba(#dc3545, 0.1);
  color: #dc3545;
  padding: 1rem;
  border-radius: 8px;
  font-family: $font-secondary;
  font-size: 0.9rem;
  border-left: 4px solid #dc3545;
}

.success-message {
  background: rgba(#28a745, 0.1);
  color: #28a745;
  padding: 1rem;
  border-radius: 8px;
  font-family: $font-secondary;
  font-size: 0.9rem;
  border-left: 4px solid #28a745;
}

.submit-button {
  font-family: $font-secondary;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, $accent-blue 0%, darken($accent-blue, 10%) 100%);
  color: $white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba($accent-blue, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
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

.register-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba($primary-light, 0.3);

  @media (max-width: 768px) {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }
}

.login-link {
  font-family: $font-secondary;
  font-size: 0.95rem;
  color: rgba($primary-dark, 0.7);
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  color: $accent-blue;
  font-family: $font-secondary;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: darken($accent-blue, 15%);
  }
}
</style>