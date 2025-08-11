<script setup lang="ts">
import TheHeader from '@/components/Global/TheHeader.vue'
import TheFooter from '@/components/Global/TheFooter.vue'
</script>

<template>
  <div id="app">
    <TheHeader />
    
    <main class="main-content">
      <router-view />
    </main>
    
    <TheFooter />
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: $font-secondary;
  line-height: 1.6;
  color: $primary-dark;
  background-color: $background-white;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// Estilos globales para enlaces
a {
  color: $accent-blue;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: darken($accent-blue, 15%);
  }
}

// Estilos para botones base
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;

  &:focus-visible {
    outline: 2px solid $accent-blue;
    outline-offset: 2px;
  }
}

// Utilidades responsive
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
}

// Clases de utilidad
.text-center {
  text-align: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
