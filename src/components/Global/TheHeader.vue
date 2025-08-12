<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

// Header component para agente legal
const authStore = useAuthStore()
</script>

<template>
  <header v-if="!authStore.isAuthenticated" class="header">
    <div class="header__container">
      <div class="header__logo">
        <h1 class="header__title">LegalAgent</h1>
        <span class="header__subtitle">Asistente Legal Inteligente</span>
      </div>
      
      <nav class="header__nav">
        <ul class="header__nav-list">
          <li class="header__nav-item">
            <router-link to="/" class="header__nav-link">Inicio</router-link>
          </li>
          <li class="header__nav-item">
            <router-link to="/licitaciones" class="header__nav-link">Licitaciones</router-link>
          </li>
          <li class="header__nav-item">
            <router-link to="/documentos" class="header__nav-link">Documentos</router-link>
          </li>
          <li class="header__nav-item">
            <router-link to="/contacto" class="header__nav-link">Contacto</router-link>
          </li>
        </ul>
      </nav>
      
      <div class="header__actions">
        <router-link to="/login" class="header__btn header__btn--secondary">Iniciar Sesión</router-link>
        <router-link to="/register" class="header__btn header__btn--primary">Registrarse</router-link>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';
@import '@/styles/fonts.modules.scss';

.header {
  background-color: $background-white;
  border-bottom: 1px solid $primary-light;
  box-shadow: 0 2px 8px $overlay-dark;
  position: sticky;
  top: 0;
  z-index: 100;
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    
    @media (max-width: 768px) {
      padding: 0 0.5rem;
      height: 60px;
    }
  }
  
  &__logo {
    display: flex;
    flex-direction: column;
    
    @media (max-width: 768px) {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }
  }
  
  &__title {
    font-family: $font-principal;
    font-size: 1.5rem;
    font-weight: 700;
    color: $primary-dark;
    margin: 0;
    line-height: 1;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
  
  &__subtitle {
    font-family: $font-secondary;
    font-size: 0.75rem;
    color: $accent-blue;
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 0.7rem;
    }
  }
  
  &__nav {
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  &__nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 2rem;
  }
  
  &__nav-item {
    // Estilos para items de navegación
  }
  
  &__nav-link {
    font-family: $font-secondary;
    font-size: 0.9rem;
    font-weight: 500;
    color: $primary-dark;
    text-decoration: none;
    padding: 0.5rem 0;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
    
    &:hover {
      color: $accent-blue;
      border-bottom-color: $accent-blue;
    }
    
    &.router-link-active {
      color: $accent-blue;
      border-bottom-color: $accent-blue;
    }
  }
  
  &__actions {
    display: flex;
    gap: 0.75rem;
    
    @media (max-width: 768px) {
      gap: 0.5rem;
    }
  }
  
  &__btn {
    font-family: $font-secondary;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    
    @media (max-width: 768px) {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
    }
    
    &--secondary {
      background-color: transparent;
      color: $primary-dark;
      border-color: $primary-light;
      
      &:hover {
        background-color: $primary-light;
        color: $primary-dark;
      }
    }
    
    &--primary {
      background-color: $accent-blue;
      color: $white;
      border-color: $accent-blue;
      
      &:hover {
        background-color: darken($accent-blue, 10%);
        border-color: darken($accent-blue, 10%);
      }
    }
  }
}
</style>