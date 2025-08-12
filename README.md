# LegalAgent Frontend

Aplicación frontend para LegalAgent, un asistente legal inteligente especializado en licitaciones y documentación jurídica. Desarrollado con Vue 3, TypeScript y Vite.

## 🚀 Características Principales

- **Análisis de Documentos**: Procesamiento inteligente de pliegos, propuestas y contratos
- **Comparación de Documentos**: Análisis comparativo con IA para toma de decisiones
- **Gestión de Workspaces**: Configuración por países y equipos de trabajo
- **Validación RUC**: Verificación automática de empresas
- **Dashboard Interactivo**: Visualización de análisis y métricas

## 🛠️ Stack Tecnológico

- **Vue 3** (Composition API) - Framework frontend
- **TypeScript** - Tipado estático
- **Vite** - Build tool y servidor de desarrollo
- **Pinia** - Gestión de estado
- **Vue Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **SCSS** - Preprocesador CSS
- **Chart.js** - Visualización de datos

## 📋 Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- Backend API ejecutándose en `http://localhost:8100/api`

## ⚙️ Configuración del Proyecto

### 1. Instalación de Dependencias

```sh
pnpm install
```

### 2. Configuración de Variables de Entorno

```sh
cp .env.example .env
```

Edita el archivo `.env` con la configuración apropiada:

```env
VITE_BAKANO_API=http://localhost:8100/api
VITE_USE_MOCK_DATA=false
```

### 3. Desarrollo

```sh
pnpm dev
```

La aplicación estará disponible en `http://localhost:5174`

### 4. Build de Producción

```sh
pnpm build
```

### 5. Preview del Build

```sh
pnpm preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Global/         # Header, Footer
│   ├── analysis/       # Componentes de análisis
│   └── shared/         # Toast, Dialog
├── composables/        # Lógica reutilizable
├── router/            # Configuración de rutas
├── services/          # Servicios de API
├── stores/            # Gestión de estado (Pinia)
├── styles/            # Estilos globales SCSS
├── types/             # Tipos TypeScript
└── views/             # Páginas de la aplicación
```

## 🔧 Scripts Disponibles

```sh
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm preview      # Preview del build
pnpm type-check   # Verificación de tipos
pnpm format       # Formateo de código
```

## 🎯 Configuración de IDE

### VSCode (Recomendado)

Extensiones requeridas:
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Soporte para Vue 3
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

**Importante**: Deshabilita Vetur si lo tienes instalado.

## 📚 Documentación

Para documentación técnica completa, consulta:
- [DOCUMENTACION.md](./DOCUMENTACION.md) - Documentación técnica detallada
- [Vite Configuration Reference](https://vite.dev/config/) - Configuración de Vite

## 🔐 Autenticación

La aplicación utiliza JWT tokens para autenticación. Las rutas protegidas requieren:
1. Usuario autenticado
2. Workspace configurado (para ciertas rutas)

## 🌍 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_BAKANO_API` | URL del backend API | `http://localhost:8100/api` |
| `VITE_USE_MOCK_DATA` | Usar datos mock | `false` |

## 🚦 Estados de la Aplicación

- **Desarrollo**: `pnpm dev` - Hot reload habilitado
- **Producción**: `pnpm build` - Optimizado y minificado
- **Preview**: `pnpm preview` - Servidor de preview del build

---

**Desarrollado para el Hackathon Legal Tech 2024**
