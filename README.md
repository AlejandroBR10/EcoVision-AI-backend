# 🌱 EcoVision AI Backend

Backend de la plataforma **EcoVision AI**, una solución inteligente para el análisis y clasificación automática de residuos utilizando visión artificial. Este proyecto combina Azure Cloud Services con inteligencia artificial para ayudar a los usuarios a identificar correctamente qué contenedor de reciclaje usar para cada tipo de residuo.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Funcionamiento](#flujo-de-funcionamiento)
- [Endpoints de la API](#endpoints-de-la-api)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Servicios Azure Utilizados](#servicios-azure-utilizados)
- [Base de Conocimiento de Residuos](#base-de-conocimiento-de-residuos)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura de Respuestas](#estructura-de-respuestas)
- [Manejo de Errores](#manejo-de-errores)
- [Desarrollo y Testing](#desarrollo-y-testing)

---

## 📖 Descripción del Proyecto

**EcoVision AI Backend** es un servidor Node.js/Express escrito en TypeScript que proporciona APIs REST para analizar imágenes de residuos y clasificarlos automáticamente.

### Propósito Principal

El sistema permite a los usuarios:

1. Capturar una foto de un residuo
2. Enviarla al backend para análisis
3. Recibir información detallada sobre:
   - Tipo de residuo identificado
   - Material de composición
   - Categoría (Reciclable, Orgánico, Peligroso, etc.)
   - Color de contenedor recomendado
   - Tiempo de degradación
   - Recomendaciones de reciclaje

---

## ✨ Características

- ✅ **Análisis de Imágenes Inteligente**: Utiliza Azure Computer Vision API para detectar objetos en fotos
- ✅ **Clasificación Automática**: Clasifica residuos usando una base de datos de conocimiento local
- ✅ **Almacenamiento en Cloud**: Guarda imágenes en Azure Blob Storage para análisis futuro
- ✅ **API REST Full**: Endpoints bien documentados y fáciles de usar
- ✅ **Manejo de CORS**: Soporta solicitudes desde múltiples orígenes
- ✅ **Validación de Archivos**: Solo acepta imágenes válidas (máximo 10MB)
- ✅ **Health Check**: Endpoint para verificar estado del servidor
- ✅ **Manejo de Errores Robusto**: Respuestas claras ante diferentes tipos de errores
- ✅ **Configuración Flexible**: Variables de entorno para diferentes ambientes

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior): [Descargar](https://nodejs.org/)
- **npm** o **yarn**: Gestor de paquetes (incluido con Node.js)
- **TypeScript**: Para compilar TypeScript a JavaScript
- **Credenciales de Azure**:
  - Clave y endpoint de Azure Computer Vision
  - Cadena de conexión de Azure Storage Account
  - Nombre de la cuenta de almacenamiento
  - Base URL pública del contenedor de almacenamiento

---

## 🚀 Instalación y Configuración

### Paso 1: Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd ecovisionAI-backend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Crear archivo `.env`

En la raíz del proyecto, crea un archivo `.env` con las siguientes variables:

```env
# Puerto en el que correrá el servidor
PORT=4000

# Credenciales de Azure Computer Vision API
AZURE_VISION_KEY=tu_clave_vision_aqui
AZURE_VISION_ENDPOINT=https://tu-región.api.cognitive.microsoft.com

# Credenciales de Azure Storage (Blob Storage)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=tu_cuenta_almacenamiento
AZURE_STORAGE_ACCOUNT_KEY=tu_clave_almacenamiento
AZURE_STORAGE_CONTAINER_NAME=uploads
AZURE_STORAGE_BASE_URL=https://tu-cuenta.blob.core.windows.net/uploads
```

### Paso 4: Compilar y ejecutar

```bash
# Compilar TypeScript a JavaScript
npm run build

# Ejecutar el servidor
npm start
```

El servidor estará disponible en `http://localhost:4000`

---

## 📁 Estructura del Proyecto

```
ecovisionAI-backend/
├── src/
│   ├── index.ts                    # Punto de entrada principal
│   ├── testAzure.ts               # Script para probar conectividad con Azure
│   ├── config/
│   │   └── azure.config.ts        # Configuración centralizada de Azure
│   ├── data/
│   │   └── knowledge.ts           # Base de conocimiento sobre residuos
│   ├── routes/
│   │   └── analyze.routes.ts      # Definición de rutas de la API
│   └── services/
│       ├── blob.service.ts        # Servicio de gestión de Azure Blob Storage
│       └── vision.service.ts      # Servicio de Azure Computer Vision API
├── dist/                          # Código compilado (generado por npm run build)
├── package.json                   # Configuración del proyecto y dependencias
├── tsconfig.json                  # Configuración de TypeScript
└── README.md                      # Este archivo
```

### Descripción de Carpetas

#### `src/config/`

Contiene la configuración centralizada del proyecto. El archivo `azure.config.ts` exporta un objeto con todas las credenciales de Azure necesarias, obtenidas de las variables de entorno.

#### `src/data/`

Almacena la base de conocimiento. El archivo `knowledge.ts` contiene un diccionario con información sobre diferentes tipos de residuos y una función para clasificarlos basada en tags detectados por Azure Vision.

#### `src/routes/`

Define todos los endpoints de la API REST. Actualmente contiene:

- `POST /analyze`: Endpoint principal para analizar imágenes

#### `src/services/`

Contiene la lógica de integración con Azure:

- **blob.service.ts**: Maneja la subida, descarga y gestión de archivos en Azure Blob Storage
- **vision.service.ts**: Interfaz con Azure Computer Vision API para analizar imágenes

---

## 🔄 Flujo de Funcionamiento

El sistema funciona en 5 pasos principales:

```
1. CLIENTE ENVÍA IMAGEN
   └─> POST /analyze con archivo de imagen

2. VALIDACIÓN
   └─> Verificar que sea una imagen válida (< 10MB)

3. SUBIR A AZURE BLOB STORAGE
   └─> Guardar imagen en la nube
   └─> Obtener URL pública del archivo

4. ANALIZAR CON AZURE VISION
   └─> Enviar URL de imagen a Azure Computer Vision
   └─> Recibir tags/etiquetas detectadas (con confianza > 70%)

5. CLASIFICACIÓN LOCAL
   └─> Buscar tags en base de conocimiento local
   └─> Retornar información de reciclaje al cliente

6. RESPUESTA AL CLIENTE
   └─> JSON con detalles del residuo y cómo reciclarlo
```

### Diagrama Detallado

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE / FRONTEND                           │
│              (Captura foto del residuo)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─ POST /analyze
                         │  multipart/form-data: {image: File}
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVIDOR EXPRESS                              │
│                (EcoVision Backend - Node.js)                    │
├─────────────────────────────────────────────────────────────────┤
│ 1. Recibe solicitud con imagen                                 │
│    └─ Multer extrae archivo del buffer                         │
│                                                                  │
│ 2. Genera nombre único para el archivo                         │
│    └─ Formato: TIMESTAMP-RANDOM.jpg                           │
│                                                                  │
│ 3. Sube a Azure Blob Storage                                   │
│    └─ Retorna URL pública accesible                            │
└────────┬────────────────────────────────────────┬──────────────┘
         │                                        │
         ▼                                        ▼
   ┌───────────────────┐             ┌──────────────────────┐
   │ Azure Blob        │             │ Azure Computer       │
   │ Storage           │             │ Vision API           │
   │                   │             │                      │
   │ Almacena imagen   │             │ Analiza imagen:      │
   │ URL pública:      │             │ └─ Detecta objetos   │
   │ https://...       │             │ └─ Retorna tags      │
   └───────────────────┘             └──────────────────────┘
         ▲                                        │
         └────────────────────────────┬───────────┘
                                      │
                                      ▼
         ┌────────────────────────────────────────┐
         │ Procesar Tags detectados               │
         │ └─ Filtrar por confianza > 70%        │
         │ └─ Extraer nombres de objetos         │
         └────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────────────────────┐
         │ Clasificación Local                    │
         │ └─ Buscar tag en wasteKnowledge       │
         │ └─ Obtener detalles del residuo      │
         │ └─ Asignar tipo de contenedor         │
         └────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────────────────────┐
         │ Preparar respuesta JSON                │
         │ └─ Incluir URL de imagen              │
         │ └─ Clasificación                      │
         │ └─ Recomendaciones                    │
         └────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RESPUESTA AL CLIENTE                            │
│              (JSON con análisis completo)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Endpoints de la API

### 1. Health Check - Verificar estado del servidor

**Endpoint:**

```http
GET /health
```

**Descripción:** Verifica que el servidor está activo y funcionando correctamente.

**Respuesta Exitosa (200 OK):**

```json
{
  "status": "ok",
  "message": "EcoVision backend corriendo",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

---

### 2. Analizar Imagen - Clasificar residuo

**Endpoint:**

```http
POST /analyze
```

**Content-Type:** `multipart/form-data`

**Parámetros:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| `image` | File | Sí | Archivo de imagen (JPG, PNG, etc.) Máximo 10MB |

**Ejemplo con cURL:**

```bash
curl -X POST http://localhost:4000/analyze \
  -F "image=@/ruta/a/la/imagen.jpg"
```

**Ejemplo con JavaScript (Fetch API):**

```javascript
const formData = new FormData();
formData.append("image", fileInput.files[0]);

fetch("http://localhost:4000/analyze", {
  method: "POST",
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log("Análisis:", data))
  .catch((error) => console.error("Error:", error));
```

**Respuesta Exitosa (200 OK):**

```json
{
  "object": "Botella de plastico",
  "material": "PET #1",
  "category": "Reciclable",
  "container": "Azul",
  "containerColor": "blue",
  "degradation": "450 anos",
  "recommendation": "Lavar antes de reciclar y retirar la tapa.",
  "confidence": 90,
  "imageUrl": "https://tu-cuenta.blob.core.windows.net/uploads/1705314645123-abc123.jpg",
  "fileName": "1705314645123-abc123.jpg",
  "analysisDate": "2024-01-15T10:30:45.123Z"
}
```

**Errores Posibles:**

| Código | Error                                          | Descripción                 |
| ------ | ---------------------------------------------- | --------------------------- |
| 400    | "No se recibió ninguna imagen"                 | No se envió archivo         |
| 400    | "Solo se permiten imágenes"                    | El archivo no es una imagen |
| 413    | "Archivo muy grande"                           | La imagen supera 10MB       |
| 500    | "Credenciales de Azure Vision no configuradas" | Faltan variables de entorno |
| 500    | "Error al procesar la imagen"                  | Error durante el análisis   |

---

## 🔐 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Variables de Puerto

```env
# Puerto en el que corre el servidor (default: 4000)
PORT=4000
```

### Variables de Azure Computer Vision

```env
# Clave de suscripción a Azure Cognitive Services
AZURE_VISION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL del endpoint de Azure Vision (varía por región)
# Ejemplo: https://eastus.api.cognitive.microsoft.com
AZURE_VISION_ENDPOINT=https://[region].api.cognitive.microsoft.com
```

### Variables de Azure Storage (Blob Storage)

```env
# Cadena de conexión completa (Importante: contiene credenciales)
# Formato: DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=tuCuenta;AccountKey=tuClave;EndpointSuffix=core.windows.net

# Nombre de la cuenta de almacenamiento
AZURE_STORAGE_ACCOUNT_NAME=tuCuenta

# Clave de acceso primaria de la cuenta
AZURE_STORAGE_ACCOUNT_KEY=tuClave

# Nombre del contenedor donde se guardan las imágenes
AZURE_STORAGE_CONTAINER_NAME=uploads

# URL base pública del contenedor (para acceder a las imágenes)
# Formato: https://[cuenta].blob.core.windows.net/[contenedor]
AZURE_STORAGE_BASE_URL=https://tuCuenta.blob.core.windows.net/uploads
```

### ⚠️ Notas Importantes sobre Seguridad

- **Nunca** commits el archivo `.env` al repositorio
- **Nunca** compartas las credenciales de Azure
- En producción, usa Azure Key Vault en lugar de variables de entorno
- Las credenciales en el archivo `.env` deben ser secretas

---

## ☁️ Servicios Azure Utilizados

### 1. Azure Computer Vision API

**Función:** Analiza imágenes para detectar objetos, texto, escenas, etc.

**Características Utilizadas:**

- **Visual Features**: Tags
  - Detecta etiquetas relevantes en la imagen
  - Devuelve confianza para cada tag
  - Filtramos solo tags con confianza > 70%

**Costo:** Según número de análisis (consulta precios en Azure)

**Documentación:** [Azure Computer Vision Docs](https://learn.microsoft.com/es-es/azure/ai-services/computer-vision/)

### 2. Azure Blob Storage

**Función:** Almacena las imágenes en la nube para acceso rápido y persistencia.

**Características:**

- Almacenamiento escalable
- URLs públicas para acceder a los archivos
- Versionado opcional
- Replicación para redundancia

**Estructura:**

```
Storage Account (Cuenta)
└── Container: uploads
    ├── 1705314645123-imagen1.jpg
    ├── 1705314645456-imagen2.jpg
    └── 1705314645789-imagen3.jpg
```

**URL de Acceso Público:**

```
https://{cuenta}.blob.core.windows.net/{contenedor}/{nombreArchivo}
```

---

## 📚 Base de Conocimiento de Residuos

El archivo `src/data/knowledge.ts` contiene una base de datos local con información sobre diferentes tipos de residuos. Esta información se utiliza para clasificar los residuos detectados por Azure Vision.

### Estructura de Datos

Cada residuo tiene los siguientes atributos:

```typescript
{
  object: string;           // Nombre del objeto/residuo
  material: string;         // Material de composición
  category: string;         // Categoría (Reciclable, Orgánico, Peligroso, etc.)
  container: string;        // Color del contenedor recomendado
  containerColor: string;   // Código de color (para frontend)
  degradation: string;      // Tiempo aproximado de degradación
  recommendation: string;   // Recomendación de reciclaje
  confidence?: number;      // Nivel de confianza (0-100)
}
```

### Residuos Incluidos Actualmente

| Tag       | Objeto              | Material  | Categoría  | Contenedor | Degradación |
| --------- | ------------------- | --------- | ---------- | ---------- | ----------- |
| `bottle`  | Botella de plástico | PET #1    | Reciclable | Azul       | 450 años    |
| `can`     | Lata de aluminio    | Aluminio  | Reciclable | Azul       | 80-100 años |
| `banana`  | Residuo orgánico    | Orgánico  | Orgánico   | Verde      | 2-4 semanas |
| `battery` | Batería             | Peligroso | Peligroso  | Especial   | 100+ años   |
| `paper`   | Papel               | Papel     | Reciclable | Azul       | 2-6 semanas |

### Función de Clasificación

```typescript
export function classifyWaste(tags: string[]): any;
```

**Lógica:**

1. Recibe un array de tags detectados por Azure Vision
2. Itera sobre cada tag buscando coincidencia en `wasteKnowledge`
3. Retorna el primer match encontrado
4. Si no hay coincidencia, retorna clasificación genérica "No identificado"

**Ejemplo:**

```typescript
// Azure Vision devuelve tags: ["bottle", "plastic", "drink"]
// La función busca en este orden:
// 1. "bottle" → ✅ ENCONTRADO → Retorna info de botella de plástico
// 2. No continúa con los demás tags

classifyWaste(["bottle", "plastic", "drink"]);
// Retorna información sobre botella de plástico
```

### Agregar Nuevos Residuos

Para agregar un nuevo tipo de residuo:

```typescript
export const wasteKnowledge: Record<string, any> = {
  // ... residuos existentes ...

  // Nuevo residuo
  glass: {
    object: "Botella de vidrio",
    material: "Vidrio",
    category: "Reciclable",
    container: "Verde",
    containerColor: "green",
    degradation: "1+ millones de años",
    recommendation:
      "Depositar en contenedor de vidrio. Mantener separado de otros residuos.",
  },
};
```

---

## 📝 Scripts Disponibles

### Compilar TypeScript a JavaScript

```bash
npm run build
```

Compila todo el código TypeScript en la carpeta `src/` y genera los archivos JavaScript en la carpeta `dist/`. Esta es una compilación una sola vez.

### Ejecutar el Servidor

```bash
npm start
```

Ejecuta el servidor desde los archivos compilados en `dist/`. Requiere que hayas ejecutado `npm run build` primero.

### Desarrollo Rápido (Compilar + Ejecutar)

```bash
npm run dev
```

Compila TypeScript y ejecuta el servidor en un comando. Útil durante desarrollo.

### Probar Conectividad con Azure

```bash
npm run test:azure
```

Ejecuta el script `src/testAzure.ts` que verifica:

- Conexión a Azure Storage
- Credenciales de Azure Vision
- Conectividad general con los servicios Azure

---

## 📤 Estructura de Respuestas

### Respuesta Exitosa (Residuo Identificado)

```json
{
  "object": "Botella de plastico",
  "material": "PET #1",
  "category": "Reciclable",
  "container": "Azul",
  "containerColor": "blue",
  "degradation": "450 anos",
  "recommendation": "Lavar antes de reciclar y retirar la tapa.",
  "confidence": 90,
  "imageUrl": "https://tu-cuenta.blob.core.windows.net/uploads/1705314645123-abc123.jpg",
  "fileName": "1705314645123-abc123.jpg",
  "analysisDate": "2024-01-15T10:30:45.123Z"
}
```

### Respuesta Exitosa (Residuo No Identificado)

```json
{
  "object": "Residuo no identificado",
  "material": "Desconocido",
  "category": "No reciclable",
  "container": "Gris",
  "containerColor": "gray",
  "degradation": "Desconocido",
  "confidence": 0,
  "recommendation": "Llevar a centro de acopio para clasificacion manual.",
  "imageUrl": "https://tu-cuenta.blob.core.windows.net/uploads/1705314645789-xyz789.jpg",
  "fileName": "1705314645789-xyz789.jpg",
  "analysisDate": "2024-01-15T10:30:45.123Z"
}
```

### Estructura de Campos

| Campo            | Tipo   | Descripción                                                          |
| ---------------- | ------ | -------------------------------------------------------------------- |
| `object`         | string | Nombre descriptivo del residuo                                       |
| `material`       | string | Tipo de material (plástico, aluminio, papel, etc.)                   |
| `category`       | string | Categoría principal (Reciclable, Orgánico, Peligroso, No reciclable) |
| `container`      | string | Color del contenedor recomendado                                     |
| `containerColor` | string | Código de color para frontend (blue, green, red, gray)               |
| `degradation`    | string | Tiempo estimado que tarda en degradarse                              |
| `recommendation` | string | Instrucciones específicas para reciclar                              |
| `confidence`     | number | Nivel de confianza de la clasificación (0-100)                       |
| `imageUrl`       | string | URL pública para acceder a la imagen almacenada                      |
| `fileName`       | string | Nombre del archivo en Azure Blob Storage                             |
| `analysisDate`   | string | Timestamp en ISO 8601 del análisis                                   |

---

## ⚠️ Manejo de Errores

El servidor implementa un robusto sistema de manejo de errores:

### Validación de Entrada

```javascript
// Solo acepta imágenes
if (!file.mimetype.startsWith("image/")) {
  return res.status(400).json({ error: "Solo se permiten imágenes" });
}

// Máximo 10 MB
if (file.size > 10 * 1024 * 1024) {
  return res.status(413).json({ error: "Archivo muy grande" });
}
```

### Middleware Global de Errores

```typescript
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message,
  });
});
```

### Errores Comunes y Soluciones

| Error                                                 | Causa                                           | Solución                                           |
| ----------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| "AZURE_STORAGE_CONNECTION_STRING no está configurada" | Falta variable de entorno                       | Verifica el archivo `.env`                         |
| "Credenciales de Azure Vision no configuradas"        | Faltan AZURE_VISION_KEY o AZURE_VISION_ENDPOINT | Configura credenciales en `.env`                   |
| "Solo se permiten imágenes"                           | Archivo no es imagen                            | Envía un archivo de imagen válido (JPG, PNG, etc.) |
| "Archivo muy grande"                                  | Imagen > 10MB                                   | Comprimir imagen o reducir tamaño                  |
| "Error al procesar la imagen"                         | Azure Vision rechaza la imagen                  | Verifica calidad y formato de imagen               |

---

## 🧪 Desarrollo y Testing

### Estructura de Carpetas en Desarrollo

```
ecovisionAI-backend/
├── src/                    # Código TypeScript original
│   └── ...
├── dist/                   # Código compilado (NO editar manualmente)
│   └── ...
├── node_modules/           # Dependencias instaladas
├── .env                    # Variables de entorno (NO versionar)
├── .gitignore             # Archivo para ignorar archivos en git
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Testing Manual

#### Verificar conexión a Azure

```bash
npm run test:azure
```

#### Verificar health del servidor

```bash
curl http://localhost:4000/health
```

#### Probar endpoint de análisis

```bash
# Con una imagen local
curl -X POST http://localhost:4000/analyze \
  -F "image=@./imagen-test.jpg"

# Con una imagen desde URL (requiere cliente HTTP como Postman)
# POST /analyze
# Body: multipart/form-data
# Field: image (seleccionar archivo)
```

### Debugging

Para ver logs detallados durante desarrollo:

```bash
# El servidor imprime logs con emojis para fácil seguimiento
# 📸 Analizando imagen
# ✅ Imagen subida a Azure
# 🔍 Enviando a Azure Vision API
# 📊 Tags detectados
```

### Dependencias del Proyecto

```json
{
  "dependencies": {
    "@azure/storage-blob": "^12.23.0", // Interacción con Blob Storage
    "axios": "^1.16.1", // HTTP client para Azure Vision
    "cors": "^2.8.6", // CORS middleware
    "dotenv": "^17.4.2", // Cargar variables de entorno
    "express": "^5.2.1", // Framework web
    "multer": "^2.1.1" // Parsear uploads de archivos
  },
  "devDependencies": {
    "@types/cors": "^2.8.17", // Tipos de TypeScript para CORS
    "@types/express": "^5.0.6", // Tipos de TypeScript para Express
    "@types/multer": "^2.1.0", // Tipos de TypeScript para Multer
    "@types/node": "^25.9.1", // Tipos de TypeScript para Node.js
    "ts-node": "^10.9.2", // Ejecutar TypeScript directamente
    "typescript": "^6.0.3" // Compilador TypeScript
  }
}
```

---

## 🌐 Ejemplo de Uso Completo

### 1. Cliente (Frontend)

```javascript
// Captura de imagen
const imageInput = document.getElementById("imageInput");
const analyzeBtn = document.getElementById("analyzeBtn");

analyzeBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Por favor selecciona una imagen");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("http://localhost:4000/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();

    // Mostrar resultados
    console.log("Residuo detectado:", result.object);
    console.log("Contenedor:", result.container);
    console.log("Recomendación:", result.recommendation);
    console.log("Imagen: ", result.imageUrl);
  } catch (error) {
    console.error("Error al analizar:", error);
    alert("Error: " + error.message);
  }
});
```

### 2. Servidor Backend

El servidor recibe la solicitud y:

1. **Valida** que sea una imagen válida
2. **Genera** un nombre único (timestamp + random)
3. **Sube** a Azure Blob Storage
4. **Analiza** con Azure Vision API
5. **Clasifica** usando la base de conocimiento
6. **Retorna** resultados detallados

### 3. Flujo Completo

```
Usuario toma foto → Frontend envía POST /analyze
                 → Backend valida imagen
                 → Sube a Azure Blob Storage
                 → Consulta Azure Vision
                 → Procesa tags
                 → Clasifica residuo
                 → Retorna JSON
                 → Frontend muestra resultados
```

---

## 📞 Soporte y Troubleshooting

### Problema: Puerto 4000 ya está en uso

**Solución:**

```bash
# Cambiar puerto en .env
PORT=5000

# O matar el proceso en el puerto
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Problema: Error "Module not found"

**Solución:**

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problema: Credenciales inválidas de Azure

**Solución:**

1. Verifica que `.env` está en la raíz del proyecto
2. Verifica que las credenciales son correctas en Azure Portal
3. Ejecuta `npm run test:azure` para diagnosticar

---

## 🔄 Versiones y Updates

- **Versión Actual:** 1.0.0
- **Node.js Recomendado:** 18+
- **TypeScript:** 6.0.3+

---

## 📄 Licencia

ISC

---

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como solución integral para la clasificación automática de residuos utilizando inteligencia artificial y computación en la nube.

---

**¡Gracias por usar EcoVision AI Backend! 🌱**
