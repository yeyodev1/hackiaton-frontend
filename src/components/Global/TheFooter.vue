<script setup lang="ts">
// Footer component para agente legal
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__content">
        <!-- Sección principal del logo y descripción -->
        <div class="footer__brand">
          <h3 class="footer__title">LegalAgent</h3>
          <p class="footer__description">
            Asistente legal inteligente especializado en licitaciones y documentación jurídica.
            Simplificamos los procesos legales con tecnología avanzada.
          </p>
          <div class="footer__social">
            <a href="#" class="footer__social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" class="footer__social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" class="footer__social-link" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.269h.909c.904 0 1.636.732 1.636 1.636z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Enlaces rápidos -->
        <div class="footer__links">
          <div class="footer__column">
            <h4 class="footer__column-title">Servicios</h4>
            <ul class="footer__list">
              <li><a href="#" class="footer__link">Análisis de Licitaciones</a></li>
              <li><a href="#" class="footer__link">Revisión de Contratos</a></li>
              <li><a href="#" class="footer__link">Consultoría Legal</a></li>
              <li><a href="#" class="footer__link">Documentación Jurídica</a></li>
            </ul>
          </div>

          <div class="footer__column">
            <h4 class="footer__column-title">Recursos</h4>
            <ul class="footer__list">
              <li><a href="#" class="footer__link">Centro de Ayuda</a></li>
              <li><a href="#" class="footer__link">Documentación</a></li>
              <li><a href="#" class="footer__link">Casos de Estudio</a></li>
              <li><a href="#" class="footer__link">Blog Legal</a></li>
            </ul>
          </div>

          <div class="footer__column">
            <h4 class="footer__column-title">Empresa</h4>
            <ul class="footer__list">
              <li><a href="#" class="footer__link">Acerca de Nosotros</a></li>
              <li><a href="#" class="footer__link">Equipo</a></li>
              <li><a href="#" class="footer__link">Carreras</a></li>
              <li><a href="#" class="footer__link">Contacto</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Línea divisoria y copyright -->
      <div class="footer__bottom">
        <div class="footer__bottom-content">
          <p class="footer__copyright">
            © {{ new Date().getFullYear() }} LegalAgent. Todos los derechos reservados.
          </p>
          <div class="footer__legal">
            <a href="#" class="footer__legal-link">Política de Privacidad</a>
            <a href="#" class="footer__legal-link">Términos de Servicio</a>
            <a href="#" class="footer__legal-link">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@import '@/styles/colorVariables.module.scss';
@import '@/styles/fonts.modules.scss';

.footer {
  background-color: $primary-dark;
  color: $white;
  margin-top: auto;
  
  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1rem 0;
    
    @media (max-width: 768px) {
      padding: 2rem 0.5rem 0;
    }
  }
  
  &__content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    padding-bottom: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding-bottom: 1.5rem;
    }
  }
  
  &__brand {
    // Sección del logo y descripción
  }
  
  &__title {
    font-family: $font-principal;
    font-size: 1.75rem;
    font-weight: 700;
    color: $white;
    margin: 0 0 1rem 0;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  &__description {
    font-family: $font-secondary;
    font-size: 0.95rem;
    line-height: 1.6;
    color: $primary-light;
    margin: 0 0 1.5rem 0;
    max-width: 300px;
    
    @media (max-width: 768px) {
      max-width: 100%;
      font-size: 0.9rem;
    }
  }
  
  &__social {
    display: flex;
    gap: 1rem;
  }
  
  &__social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: $overlay-blue;
    color: $primary-light;
    border-radius: 50%;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: $accent-blue;
      color: $white;
      transform: translateY(-2px);
    }
  }
  
  &__links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  
  &__column {
    // Columnas de enlaces
  }
  
  &__column-title {
    font-family: $font-principal;
    font-size: 1.1rem;
    font-weight: 600;
    color: $white;
    margin: 0 0 1rem 0;
  }
  
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  &__list li {
    margin-bottom: 0.5rem;
  }
  
  &__link {
    font-family: $font-secondary;
    font-size: 0.9rem;
    color: $primary-light;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: $accent-blue;
    }
  }
  
  &__bottom {
    border-top: 1px solid rgba($primary-light, 0.2);
    padding: 1.5rem 0;
  }
  
  &__bottom-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
  
  &__copyright {
    font-family: $font-secondary;
    font-size: 0.875rem;
    color: $primary-light;
    margin: 0;
  }
  
  &__legal {
    display: flex;
    gap: 1.5rem;
    
    @media (max-width: 768px) {
      gap: 1rem;
    }
  }
  
  &__legal-link {
    font-family: $font-secondary;
    font-size: 0.875rem;
    color: $primary-light;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: $accent-blue;
    }
  }
}
</style>