# Documentación Técnica - LegalAgent Frontend

## Descripción General

LegalAgent es una aplicación frontend desarrollada en Vue 3 con TypeScript que funciona como un asistente legal inteligente especializado en licitaciones y documentación jurídica. La aplicación permite a los usuarios analizar documentos legales, gestionar workspaces y realizar comparaciones de documentos mediante inteligencia artificial.

## Tecnologías Utilizadas

### Frontend
- **Vue 3** (v3.5.13) - Framework principal
- **TypeScript** (v5.8.0) - Tipado estático
- **Vite** (v6.2.4) - Build tool y dev server
- **Vue Router** (v4.5.0) - Enrutamiento
- **Pinia** (v3.0.1) - Gestión de estado
- **SCSS/Sass** (v1.89.0) - Preprocesador CSS

### Librerías Principales
- **Axios** (v1.9.0) - Cliente HTTP
- **Chart.js** (v4.4.9) - Gráficos y visualizaciones
- **Vee-validate** (v4.15.1) - Validación de formularios
- **Yup** (v1.6.1) - Esquemas de validación
- **Date-fns** (v4.1.0) - Manipulación de fechas

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Global/         # Componentes globales (Header, Footer)
│   ├── analysis/       # Componentes específicos de análisis
│   └── shared/         # Componentes compartidos (Toast, Dialog)
├── composables/        # Composables de Vue
├── config/            # Configuración de la aplicación
├── router/            # Configuración de rutas
├── services/          # Servicios de API
├── stores/            # Stores de Pinia
├── styles/            # Archivos de estilos globales
├── types/             # Definiciones de tipos TypeScript
└── views/             # Vistas/páginas de la aplicación
```

## Variables de Entorno

### Archivo .env
```bash
VITE_BAKANO_API=http://localhost:8100/api
```

### Variables Disponibles (.env.example)
```bash
# Configuración de la API
VITE_API_BASE_URL=http://localhost:3000/api

# Configuración de desarrollo
VITE_USE_MOCK_DATA=false

# Configuración de autenticación (opcional)
# VITE_AUTH_DOMAIN=your-auth-domain.com
# VITE_CLIENT_ID=your-client-id

# Configuración de Google Drive (opcional)
# VITE_GOOGLE_DRIVE_API_KEY=your-google-drive-api-key
# VITE_GOOGLE_DRIVE_FOLDER_ID=your-folder-id
```

## Configuración

### Vite Configuration (vite.config.ts)
- **Plugins**: Vue, Vue DevTools
- **Alias**: `@` apunta a `./src`
- **SCSS**: Configuración global de variables de color y fuentes

### Environment Configuration (src/config/environment.ts)
```typescript
export interface EnvironmentConfig {
  isDevelopment: boolean
  apiBaseUrl: string
  useMockData: boolean
  enableDebugLogs: boolean
}
```

## Rutas de la Aplicación

### Rutas Públicas
- `/` - Página principal (HomeView)
- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/verify/:token` - Verificación de email
- `/verify-email` - Página de verificación

### Rutas Protegidas (requieren autenticación)
- `/workspace-setup` - Configuración de workspace
- `/dashboard` - Panel principal
- `/documents` - Gestión de documentos
- `/analysis/:id` - Detalle de análisis
- `/comparison/:id` - Vista de comparación

### Guards de Navegación
- **requiresAuth**: Verifica autenticación del usuario
- **requiresWorkspaceSetup**: Verifica configuración completa del workspace

## Stores (Gestión de Estado)

### AuthStore (src/stores/auth.ts)
**Propósito**: Maneja autenticación y estado del usuario

**Estado**:
- `user: User | null` - Información del usuario
- `token: string | null` - Token de acceso
- `isLoading: boolean` - Estado de carga
- `isInitialized: boolean` - Estado de inicialización
- `lastLoginTime: Date | null` - Última vez que se inició sesión

**Getters Computados**:
- `isAuthenticated` - Verifica si el usuario está autenticado
- `isEmailVerified` - Verifica si el email está verificado
- `userInitials` - Iniciales del usuario
- `userDisplayName` - Nombre para mostrar

**Acciones Principales**:
- `register(userData: RegisterData)` - Registro de usuario
- `login(credentials: LoginData)` - Inicio de sesión
- `logout()` - Cerrar sesión
- `verifyEmail(token: string)` - Verificar email
- `initializeAuth()` - Inicializar autenticación

### WorkspaceStore (src/stores/workspace.ts)
**Propósito**: Maneja el workspace del usuario y su configuración

**Estado**:
- `workspace: Workspace | null` - Información del workspace
- `availableCountries: Country[]` - Países disponibles
- `isLoading: boolean` - Estado de carga
- `setupProgress: number` - Progreso de configuración
- `nextStep: string | undefined` - Siguiente paso en configuración

**Getters Computados**:
- `hasWorkspace` - Verifica si tiene workspace
- `isWorkspaceConfigured` - Verifica configuración completa
- `workspaceName` - Nombre del workspace
- `selectedCountry` - País seleccionado

### AnalysisStore (src/stores/analysis.ts)
**Propósito**: Maneja análisis de documentos y comparaciones

**Estado**:
- `analyses: IDocumentAnalysis[]` - Lista de análisis
- `currentAnalysis: IDocumentAnalysis | null` - Análisis actual
- `isLoading: boolean` - Estado de carga general
- `isAnalyzing: boolean` - Estado de análisis en progreso
- `isComparing: boolean` - Estado de comparación en progreso
- `pagination` - Información de paginación
- `lastComparison` - Última comparación realizada
- `insights` - Insights del documento
- `technicalAnalysis` - Análisis técnico

## Servicios de API

### HTTPBase (src/services/httpBase.ts)
**Propósito**: Clase base para todos los servicios HTTP

**Configuración**:
- URL base: `VITE_BAKANO_API` (http://localhost:8100/api)
- Headers automáticos: Content-Type, Authorization
- Manejo automático de tokens de localStorage

**Métodos**:
- `get<T>(endpoint, headers?)` - Peticiones GET
- `post<T>(endpoint, data, headers?)` - Peticiones POST
- `put<T>(endpoint, data)` - Peticiones PUT
- `patch<T>(endpoint, data)` - Peticiones PATCH
- `delete<T>(endpoint)` - Peticiones DELETE
- `uploadFile<T>(endpoint, file)` - Subida de archivos

### AuthService (src/services/auth.service.ts)
**Propósito**: Maneja operaciones de autenticación

**Interfaces**:
```typescript
interface RegisterData {
  name: string
  email: string
  password: string
  companyName: string
  country: string
}

interface LoginData {
  email: string
  password: string
}

interface User {
  id: string
  name: string
  email: string
  companyName: string
  country: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}
```

**Métodos**:
- `register(userData: RegisterData): Promise<AuthResponse>`
- `login(credentials: LoginData): Promise<LoginResponse>`
- `logout(): void`
- `verifyEmail(token: string): Promise<{success: boolean; message?: string}>`
- `verifyToken(): Promise<boolean>`

### AnalysisService (src/services/analysis.service.ts)
**Propósito**: Maneja análisis y comparación de documentos

**Interfaces Principales**:
```typescript
interface AnalyzeDocumentRequest {
  workspaceId: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  file: File
}

interface CompareDocumentsRequest {
  workspaceId: string
  documentIds: string[]
}
```

**Métodos**:
- `analyzeDocument(request: AnalyzeDocumentRequest): Promise<AnalysisResponse>`
- `analyzeDocumentByUrl(request: AnalyzeDocumentByUrlRequest): Promise<AnalysisResponse>`
- `getWorkspaceAnalyses(request: WorkspaceAnalysesRequest): Promise<PaginatedResponse<IDocumentAnalysis>>`
- `getAnalysisById(analysisId: string): Promise<{success: boolean; analysis: IDocumentAnalysis}>`
- `compareDocuments(request: CompareDocumentsRequest): Promise<ComparisonResponse>`
- `uploadAndCompare(request: UploadAndCompareRequest): Promise<ComparisonResponse>`
- `getDocumentInsights(request: DocumentInsightsRequest): Promise<InsightsResponse>`
- `getTechnicalAnalysis(request: TechnicalAnalysisRequest): Promise<TechnicalAnalysisResponse>`

### WorkspaceService (src/services/workspace.service.ts)
**Propósito**: Maneja operaciones del workspace

### DocumentService (src/services/document.service.ts)
**Propósito**: Maneja gestión de documentos

### MockDataService (src/services/mockData.service.ts)
**Propósito**: Proporciona datos de prueba cuando el backend no está disponible

## Tipos TypeScript

### Analysis Types (src/types/analysis.types.ts)

```typescript
interface IDocumentAnalysis {
  id: string
  documentId: string
  documentName: string
  documentType: 'pliego' | 'propuesta' | 'contrato'
  status: 'processing' | 'completed' | 'failed'
  aiAnalysis: string
  analysisDate: Date
  processingTime: number
  rucValidation?: IRucValidation
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

interface IRucValidation {
  ruc: string
  companyName: string
  isValid: boolean
  canPerformWork: boolean
  validationDate: Date
}
```

## Composables

### useToast (src/composables/useToast.ts)
**Propósito**: Maneja notificaciones toast globales

**Tipos**:
- `success` - Notificación de éxito
- `error` - Notificación de error
- `info` - Notificación informativa
- `warning` - Notificación de advertencia

**Uso**:
```typescript
const { triggerToast } = useToast()
triggerToast('Mensaje de éxito', 'success', 3000)
```

### useConfirmationDialog (src/composables/useConfirmationDialog.ts)
**Propósito**: Maneja diálogos de confirmación globales

**Características**:
- Confirmación con texto requerido
- Selección de opciones
- Promesas para manejo asíncrono

**Uso**:
```typescript
const { reveal } = useConfirmationDialog()
const confirmed = await reveal({
  title: 'Confirmar acción',
  message: '¿Estás seguro?',
  confirmationText: 'CONFIRMAR'
})
```

## Componentes Principales

### Componentes Globales
- **TheHeader.vue**: Header principal de la aplicación
- **TheFooter.vue**: Footer principal de la aplicación

### Componentes Compartidos
- **ToastNotification.vue**: Componente de notificaciones
- **ConfirmationDialog.vue**: Componente de diálogos de confirmación

### Componentes de Análisis
- **ChatPanel.vue**: Panel de chat para interacción con IA

## Vistas Principales

### HomeView.vue
**Propósito**: Página principal de la aplicación
**Características**:
- Hero section con información del producto
- Grid de características principales
- Llamadas a la acción

### LoginView.vue
**Propósito**: Vista de inicio de sesión
**Características**:
- Formulario de login con validación
- Manejo de errores
- Integración con AuthStore

### DocumentManagementView.vue
**Propósito**: Gestión de documentos del workspace
**Características**:
- Subida de archivos drag & drop
- Filtros por tipo de documento
- Vista en grid/lista
- Análisis de documentos
- Comparación de documentos

### AnalysisDetailView.vue
**Propósito**: Vista detallada de un análisis

### ComparisonView.vue
**Propósito**: Vista de comparación entre documentos

### WorkspaceSetupView.vue
**Propósito**: Configuración inicial del workspace

### RegisterView.vue
**Propósito**: Registro de nuevos usuarios

### VerifyView.vue
**Propósito**: Verificación de email

## Estilos y Diseño

### Variables de Color (src/styles/colorVariables.module.scss)
```scss
// Colores principales
$primary-dark: #50514f;      // Gris oscuro profesional
$primary-light: #cbd4c2;     // Verde gris claro
$background-white: #fffcff;  // Blanco puro
$accent-blue: #247ba0;       // Azul corporativo
$secondary-beige: #c3b299;   // Beige cálido

// Colores de estado
$success-green: #10b981;     // Verde para éxito
$warning-yellow: #f59e0b;    // Amarillo para advertencias
$error-red: #ef4444;         // Rojo para errores
```

### Fuentes (src/styles/fonts.modules.scss)
```scss
$font-principal: 'Roboto Slab', serif;  // Para títulos y encabezados
$font-secondary: 'Open Sans', sans-serif; // Para texto general
```

## Scripts de Desarrollo

### Comandos Disponibles
```bash
# Desarrollo
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm preview      # Preview del build
pnpm type-check   # Verificación de tipos
pnpm format       # Formateo de código
```

### Configuración del Servidor de Desarrollo
- **Puerto**: 5174 (configurado automáticamente por Vite)
- **URL**: http://localhost:5174
- **Hot Reload**: Habilitado
- **Vue DevTools**: Habilitado en desarrollo

## Arquitectura y Patrones

### Patrón de Composición
- Uso de Composition API de Vue 3
- Composables para lógica reutilizable
- Stores reactivos con Pinia

### Gestión de Estado
- **Pinia** para estado global
- **Reactive refs** para estado local
- **Computed properties** para valores derivados

### Comunicación con API
- **Axios** para peticiones HTTP
- **Interceptors** para manejo automático de tokens
- **Error handling** centralizado

### Validación
- **Vee-validate** para validación de formularios
- **Yup** para esquemas de validación
- Validación en tiempo real

## Seguridad

### Autenticación
- JWT tokens almacenados en localStorage
- Headers de autorización automáticos
- Verificación de tokens en guards de navegación

### Validación
- Validación client-side con Yup
- Sanitización de inputs
- Manejo seguro de archivos

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- pnpm (recomendado) o npm

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd hackiaton-frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con las configuraciones apropiadas

# Ejecutar en modo desarrollo
pnpm dev
```

### Configuración de IDE
- **VSCode** recomendado
- **Extensiones**: Volar (Vue), TypeScript, Prettier
- **Configuración**: .vscode/extensions.json incluido

## Notas de Desarrollo

### Convenciones de Código
- **TypeScript**: Tipado estricto habilitado
- **Prettier**: Formateo automático configurado
- **Vue 3**: Composition API preferida
- **SCSS**: Uso de variables globales

### Estructura de Archivos
- Componentes en PascalCase
- Archivos de servicio en camelCase
- Stores en camelCase
- Tipos en interfaces con prefijo 'I'

### Manejo de Errores
- Try-catch en servicios
- Toast notifications para errores de usuario
- Console.log para debugging (solo en desarrollo)

---

*Documentación generada automáticamente basada en el análisis del código fuente del proyecto.*