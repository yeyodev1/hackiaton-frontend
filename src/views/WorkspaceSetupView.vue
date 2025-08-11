<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

// Stores y composables
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()
const router = useRouter()
const { triggerToast } = useToast()

// Estado reactivo
const selectedCountry = ref('')
const isSubmitting = ref(false)
const showUserMenu = ref(false)

// Países disponibles con información específica
const availableCountries = ref([
  {
    code: 'EC',
    name: 'Ecuador',
    key: 'ecuador',
    available: true,
    description: 'Leyes y regulaciones de Ecuador completamente configuradas'
  },
  {
    code: 'CO',
    name: 'Colombia',
    key: 'colombia',
    available: false,
    description: 'Próximamente disponible'
  },
  {
    code: 'MX',
    name: 'México',
    key: 'mexico',
    available: false,
    description: 'Próximamente disponible'
  }
])

// Getters computados
const workspaceName = computed(() => {
  return workspaceStore.workspaceName || 'Mi Workspace'
})

const userDisplayName = computed(() => {
  return authStore.userDisplayName
})

const userInitials = computed(() => {
  return authStore.userInitials
})

const isEcuadorSelected = computed(() => {
  return selectedCountry.value === 'EC'
})

const canProceed = computed(() => {
  return selectedCountry.value === 'EC'
})

// Métodos
const handleCountrySelect = (countryCode: string, available: boolean) => {
  if (!available) {
    if (countryCode === 'CO') {
      triggerToast('Colombia estará disponible próximamente. Por ahora, este MVP funciona solo con Ecuador.', 'info')
    } else if (countryCode === 'MX') {
      triggerToast('México estará disponible próximamente. Colocaremos más leyes para considerar que este MVP funciona solo con Ecuador.', 'info')
    }
    return
  }
  
  selectedCountry.value = countryCode
}

const handleSubmit = async () => {
  if (!canProceed.value) {
    triggerToast('Por favor selecciona Ecuador para continuar', 'warning')
    return
  }

  try {
    isSubmitting.value = true
    await workspaceStore.updateWorkspaceCountry(selectedCountry.value)
    triggerToast('País configurado correctamente. Usaremos las leyes de Ecuador para el análisis.', 'success')
    
    // Redirigir al dashboard o siguiente paso
    await router.push('/dashboard')
  } catch (error: any) {
    console.error('Error configurando país:', error)
    triggerToast('Error al configurar el país', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Error en logout:', error)
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Cerrar menú al hacer click fuera
const closeUserMenu = () => {
  showUserMenu.value = false
}

// Lifecycle
onMounted(async () => {
  try {
    await workspaceStore.initializeWorkspace()
    
    // Si ya tiene país configurado, pre-seleccionarlo
    if (workspaceStore.selectedCountry?.code) {
      selectedCountry.value = workspaceStore.selectedCountry.code
    }
  } catch (error) {
    console.error('Error inicializando workspace:', error)
  }
})
</script>

<template>
  <div class="workspace-setup">
    <!-- Header -->
    <header class="workspace-setup__header">
      <div class="workspace-setup__header-content">
        <!-- Nombre del workspace -->
        <div class="workspace-setup__workspace-info">
          <h1 class="workspace-setup__workspace-name">
            {{ workspaceName }}
          </h1>
          <span class="workspace-setup__workspace-subtitle">Configuración de Workspace</span>
        </div>

        <!-- Configuración y usuario -->
        <div class="workspace-setup__user-section">
          <div class="workspace-setup__user-menu" @click="toggleUserMenu">
            <div class="workspace-setup__user-avatar">
              {{ userInitials }}
            </div>
            <span class="workspace-setup__user-name">{{ userDisplayName }}</span>
            <svg class="workspace-setup__dropdown-icon" :class="{ 'workspace-setup__dropdown-icon--open': showUserMenu }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Dropdown menu -->
          <div v-if="showUserMenu" class="workspace-setup__dropdown" @click="closeUserMenu">
            <div class="workspace-setup__dropdown-content">
              <button class="workspace-setup__dropdown-item" @click="handleLogout">
                <svg class="workspace-setup__dropdown-icon-item" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="workspace-setup__main">
      <div class="workspace-setup__container">
        <div class="workspace-setup__content">
          <!-- Título y descripción -->
          <div class="workspace-setup__intro">
            <h2 class="workspace-setup__title">
              Configuración de País
            </h2>
            <p class="workspace-setup__description">
              Selecciona el país para configurar las leyes y regulaciones que utilizaremos en el análisis de documentos legales.
            </p>
          </div>

          <!-- Formulario de selección de país -->
          <div class="workspace-setup__form">
            <div class="workspace-setup__countries">
              <div 
                v-for="country in availableCountries" 
                :key="country.code"
                class="workspace-setup__country-card"
                :class="{
                  'workspace-setup__country-card--selected': selectedCountry === country.code,
                  'workspace-setup__country-card--available': country.available,
                  'workspace-setup__country-card--disabled': !country.available
                }"
                @click="handleCountrySelect(country.code, country.available)"
              >
                <div class="workspace-setup__country-header">
                  <h3 class="workspace-setup__country-name">{{ country.name }}</h3>
                  <div class="workspace-setup__country-status">
                    <span 
                      v-if="country.available" 
                      class="workspace-setup__status-badge workspace-setup__status-badge--available"
                    >
                      Disponible
                    </span>
                    <span 
                      v-else 
                      class="workspace-setup__status-badge workspace-setup__status-badge--coming-soon"
                    >
                      Próximamente
                    </span>
                  </div>
                </div>
                
                <p class="workspace-setup__country-description">
                  {{ country.description }}
                </p>

                <!-- Indicador de selección -->
                <div v-if="selectedCountry === country.code" class="workspace-setup__selected-indicator">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Información adicional para Ecuador -->
            <div v-if="isEcuadorSelected" class="workspace-setup__ecuador-info">
              <div class="workspace-setup__info-card">
                <div class="workspace-setup__info-icon">⚖️</div>
                <div class="workspace-setup__info-content">
                  <h4 class="workspace-setup__info-title">Leyes de Ecuador Configuradas</h4>
                  <p class="workspace-setup__info-text">
                    Utilizaremos la Constitución, Ley de Contratación Pública, Código de Trabajo y regulaciones específicas de Ecuador para el análisis.
                  </p>
                </div>
              </div>
            </div>

            <!-- Botón de continuar -->
            <div class="workspace-setup__actions">
              <button 
                class="workspace-setup__submit-btn"
                :class="{ 'workspace-setup__submit-btn--disabled': !canProceed }"
                :disabled="!canProceed || isSubmitting"
                @click="handleSubmit"
              >
                <span v-if="isSubmitting" class="workspace-setup__loading">
                  <svg class="workspace-setup__spinner" viewBox="0 0 24 24">
                    <circle class="workspace-setup__spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Configurando...
                </span>
                <span v-else>
                  Continuar con Ecuador
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';
@import '@/styles/fonts.modules.scss';

.workspace-setup {
  min-height: 100vh;
  background: linear-gradient(135deg, $background-white 0%, $primary-light 100%);

  &__header {
    background-color: $white;
    border-bottom: 1px solid $primary-light;
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 4px rgba($primary-dark, 0.1);
  }

  &__header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      padding: 0 0.75rem;
    }
  }

  &__workspace-info {
    display: flex;
    flex-direction: column;
  }

  &__workspace-name {
    font-family: $font-principal;
    font-size: 1.5rem;
    font-weight: 700;
    color: $primary-dark;
    margin: 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }

  &__workspace-subtitle {
    font-family: $font-secondary;
    font-size: 0.875rem;
    color: darken($primary-light, 30%);
    margin-top: 0.25rem;
  }

  &__user-section {
    position: relative;
  }

  &__user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      background-color: $background-white;
      border-color: $primary-light;
    }

    @media (max-width: 768px) {
      padding: 0.5rem;
      gap: 0.5rem;
    }
  }

  &__user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: linear-gradient(135deg, $accent-blue, darken($accent-blue, 20%));
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: $font-principal;
    font-weight: 600;
    font-size: 0.875rem;

    @media (max-width: 768px) {
      width: 2rem;
      height: 2rem;
      font-size: 0.75rem;
    }
  }

  &__user-name {
    font-family: $font-secondary;
    font-weight: 500;
    color: $primary-dark;
    font-size: 0.9rem;

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__dropdown-icon {
    width: 1rem;
    height: 1rem;
    color: darken($primary-light, 30%);
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background-color: $white;
    border: 1px solid $primary-light;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba($primary-dark, 0.15);
    z-index: 1000;
    min-width: 180px;
  }

  &__dropdown-content {
    padding: 0.5rem;
  }

  &__dropdown-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: none;
    background: none;
    color: $primary-dark;
    font-family: $font-secondary;
    font-size: 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: $background-white;
      color: $accent-blue;
    }
  }

  &__dropdown-icon-item {
    width: 1rem;
    height: 1rem;
  }

  &__main {
    padding: 3rem 0;

    @media (max-width: 768px) {
      padding: 2rem 0;
    }
  }

  &__container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;

    @media (max-width: 768px) {
      padding: 0 0.75rem;
    }
  }

  &__content {
    background-color: $white;
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 8px 32px rgba($primary-dark, 0.1);

    @media (max-width: 768px) {
      padding: 1.5rem;
      border-radius: 8px;
    }
  }

  &__intro {
    text-align: center;
    margin-bottom: 2.5rem;

    @media (max-width: 768px) {
      margin-bottom: 2rem;
    }
  }

  &__title {
    font-family: $font-principal;
    font-size: 2rem;
    font-weight: 700;
    color: $primary-dark;
    margin: 0 0 1rem 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  &__description {
    font-family: $font-secondary;
    font-size: 1rem;
    color: darken($primary-light, 30%);
    line-height: 1.6;
    margin: 0;
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }

  &__form {
    // Contenedor del formulario
  }

  &__countries {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      gap: 0.75rem;
    }
  }

  &__country-card {
    position: relative;
    padding: 1.5rem;
    border: 2px solid $primary-light;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: $white;

    &--available {
      &:hover {
        border-color: $accent-blue;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba($accent-blue, 0.2);
      }
    }

    &--selected {
      border-color: $accent-blue;
      background-color: lighten($accent-blue, 45%);
      box-shadow: 0 4px 12px rgba($accent-blue, 0.2);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: $background-white;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  &__country-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  &__country-name {
    font-family: $font-principal;
    font-size: 1.25rem;
    font-weight: 600;
    color: $primary-dark;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  &__country-status {
    // Contenedor del badge de estado
  }

  &__status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-family: $font-secondary;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &--available {
      background-color: lighten($success-green, 40%);
      color: darken($success-green, 20%);
    }

    &--coming-soon {
      background-color: lighten($warning-yellow, 30%);
      color: darken($warning-yellow, 30%);
    }
  }

  &__country-description {
    font-family: $font-secondary;
    font-size: 0.9rem;
    color: darken($primary-light, 30%);
    line-height: 1.5;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
  }

  &__selected-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 1.5rem;
    height: 1.5rem;
    background-color: $accent-blue;
    color: $white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 768px) {
      top: 0.75rem;
      right: 0.75rem;
      width: 1.25rem;
      height: 1.25rem;

      svg {
        width: 0.875rem;
        height: 0.875rem;
      }
    }
  }

  &__ecuador-info {
    margin-bottom: 2rem;
  }

  &__info-card {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, lighten($accent-blue, 45%), lighten($accent-blue, 40%));
    border: 1px solid lighten($accent-blue, 30%);
    border-radius: 8px;

    @media (max-width: 768px) {
      padding: 1rem;
      gap: 0.75rem;
    }
  }

  &__info-icon {
    font-size: 2rem;
    flex-shrink: 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  &__info-content {
    flex: 1;
  }

  &__info-title {
    font-family: $font-principal;
    font-size: 1rem;
    font-weight: 600;
    color: $primary-dark;
    margin: 0 0 0.5rem 0;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }

  &__info-text {
    font-family: $font-secondary;
    font-size: 0.875rem;
    color: darken($primary-light, 30%);
    line-height: 1.5;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }

  &__actions {
    display: flex;
    justify-content: center;
  }

  &__submit-btn {
    font-family: $font-secondary;
    font-size: 1rem;
    font-weight: 600;
    padding: 1rem 2rem;
    background-color: $accent-blue;
    color: $white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 200px;
    justify-content: center;

    &:hover:not(:disabled) {
      background-color: darken($accent-blue, 10%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($accent-blue, 0.3);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    @media (max-width: 768px) {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 0.9rem;
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 1rem;
    height: 1rem;
    animation: spin 1s linear infinite;
  }

  &__spinner-circle {
    stroke-linecap: round;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>