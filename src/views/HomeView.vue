<script setup lang="ts">
// Vista principal del agente legal
</script>

<template>
  <div class="home">
    <section class="hero">
      <div class="hero__container">
        <div class="hero__content">
          <h1 class="hero__title">
            Bienvenido a <span class="hero__highlight">LegalAgent</span>
          </h1>
          <p class="hero__subtitle">
            Tu asistente legal inteligente especializado en licitaciones y documentación jurídica
          </p>
          <p class="hero__description">
            Esto es el HomeView - Página principal del sistema de agente legal
          </p>
          
          <div class="hero__actions">
            <button class="hero__btn hero__btn--primary">
              Comenzar Ahora
            </button>
            <button class="hero__btn hero__btn--secondary">
              Ver Demo
            </button>
          </div>
        </div>
        
        <div class="hero__visual">
          <div class="hero__card">
            <div class="hero__card-icon">⚖️</div>
            <h3 class="hero__card-title">Análisis Legal</h3>
            <p class="hero__card-text">Procesamiento inteligente de documentos legales</p>
          </div>
        </div>
      </div>
    </section>
    
    <section class="features">
      <div class="features__container">
        <h2 class="features__title">Características Principales</h2>
        
        <div class="features__grid">
          <div class="feature-card">
            <div class="feature-card__icon">📋</div>
            <h3 class="feature-card__title">Gestión de Licitaciones</h3>
            <p class="feature-card__description">
              Análisis automático y seguimiento de procesos de licitación
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card__icon">📄</div>
            <h3 class="feature-card__title">Revisión de Documentos</h3>
            <p class="feature-card__description">
              Verificación inteligente de contratos y documentación legal
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card__icon">🤖</div>
            <h3 class="feature-card__title">IA Especializada</h3>
            <p class="feature-card__description">
              Asistente con conocimiento específico en derecho y licitaciones
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';
@import '@/styles/fonts.modules.scss';

.home {
  min-height: calc(100vh - 140px); // Ajuste para header y footer
}

.hero {
  background: linear-gradient(135deg, $background-white 0%, $primary-light 100%);
  padding: 4rem 0;
  
  @media (max-width: 768px) {
    padding: 2rem 0;
  }
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 2rem;
      text-align: center;
    }
  }
  
  &__content {
    // Contenido principal del hero
  }
  
  &__title {
    font-family: $font-principal;
    font-size: 3rem;
    font-weight: 700;
    color: $primary-dark;
    margin: 0 0 1rem 0;
    line-height: 1.2;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  &__highlight {
    color: $accent-blue;
  }
  
  &__subtitle {
    font-family: $font-secondary;
    font-size: 1.25rem;
    font-weight: 500;
    color: $primary-dark;
    margin: 0 0 1rem 0;
    line-height: 1.4;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  &__description {
    font-family: $font-secondary;
    font-size: 1rem;
    color: darken($primary-light, 30%);
    margin: 0 0 2rem 0;
    line-height: 1.6;
    font-style: italic;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
  }
  
  &__actions {
    display: flex;
    gap: 1rem;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
    }
  }
  
  &__btn {
    font-family: $font-secondary;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.875rem 2rem;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    
    @media (max-width: 768px) {
      width: 100%;
      max-width: 250px;
    }
    
    &--primary {
      background-color: $accent-blue;
      color: $white;
      border-color: $accent-blue;
      
      &:hover {
        background-color: darken($accent-blue, 10%);
        border-color: darken($accent-blue, 10%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba($accent-blue, 0.3);
      }
    }
    
    &--secondary {
      background-color: transparent;
      color: $primary-dark;
      border-color: $primary-dark;
      
      &:hover {
        background-color: $primary-dark;
        color: $white;
        transform: translateY(-2px);
      }
    }
  }
  
  &__visual {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  &__card {
    background-color: $white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba($primary-dark, 0.1);
    text-align: center;
    max-width: 300px;
    
    @media (max-width: 768px) {
      max-width: 250px;
      padding: 1.5rem;
    }
  }
  
  &__card-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  &__card-title {
    font-family: $font-principal;
    font-size: 1.25rem;
    font-weight: 600;
    color: $primary-dark;
    margin: 0 0 0.5rem 0;
  }
  
  &__card-text {
    font-family: $font-secondary;
    font-size: 0.9rem;
    color: darken($primary-light, 30%);
    margin: 0;
    line-height: 1.5;
  }
}

.features {
  padding: 4rem 0;
  background-color: $white;
  
  @media (max-width: 768px) {
    padding: 3rem 0;
  }
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  &__title {
    font-family: $font-principal;
    font-size: 2.5rem;
    font-weight: 700;
    color: $primary-dark;
    text-align: center;
    margin: 0 0 3rem 0;
    
    @media (max-width: 768px) {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
}

.feature-card {
  background-color: $background-white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid $primary-light;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba($primary-dark, 0.1);
    border-color: $accent-blue;
  }
  
  &__icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  &__title {
    font-family: $font-principal;
    font-size: 1.25rem;
    font-weight: 600;
    color: $primary-dark;
    margin: 0 0 1rem 0;
  }
  
  &__description {
    font-family: $font-secondary;
    font-size: 0.95rem;
    color: darken($primary-light, 30%);
    margin: 0;
    line-height: 1.6;
  }
}
</style>