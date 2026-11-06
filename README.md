# Sistema Integral de Rutas de Atención a Población Migrante y Refugiada
### Municipio de Quibdó – Departamento del Chocó

Plataforma tecnológica oficial para la articulación interinstitucional, gestión, auditoría y consulta ciudadana de las rutas de atención integral a la población migrante, refugiada y retornada en el Municipio de Quibdó.

---

## 📌 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
3. [Módulos del Sistema](#-módulos-del-sistema)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Requisitos Previos](#-requisitos-previos)
6. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
7. [Base de Datos (Supabase / PostgreSQL)](#-base-de-datos-supabase--postgresql)
8. [Despliegue en Producción (Render)](#-despliegue-en-producción-render)
9. [Usuarios y Roles Iniciales](#-usuarios-y-roles-iniciales)
10. [Licencia y Créditos](#-licencia-y-créditos)

---

## 📖 Descripción General

Este sistema centraliza la oferta institucional municipal, departamental y de cooperación internacional para garantizar la atención efectiva y con enfoque diferencial de la población migrante en Quibdó.

Permite:
- **A la Ciudadanía:** Consultar rutas oficiales verificadas, pasos de atención, requisitos, horarios y canales de contacto; radicar novedades o reportes de desactualización de forma segura y anónima; y consultar el estado de sus trámites mediante su número de radicado oficial.
- **A las Entidades Responsables (SISBEN, Salud, Educación, Comisarías, etc.):** Gestionar sus rutas, reportar avances de compromisos interinstitucionales, subir archivos y evidencias a la biblioteca multimedia, y responder formalmente a las observaciones ciudadanas.
- **A la Mesa Coordinadora y Alcaldía:** Monitorear el ciclo de vida de cada ruta (Borrador → Revisión → Aprobada → Publicada), coordinar observaciones técnicas y auditar el cumplimiento interinstitucional en tiempo real.

---

## 🛠 Arquitectura y Stack Tecnológico

El proyecto está diseñado como una solución **Full-Stack desacoplada y contenerizable**:

- **Frontend:**
  - React 19 con TypeScript
  - Vite 8 (Compilador y empaquetador ultrarrápido)
  - Tailwind CSS v4 (Estilos modernos y diseño responsivo)
  - React Router 7 (Enrutamiento del lado del cliente)
  - Lucide React (Iconografía técnica y accesible)
  - jsPDF & html2canvas (Generación oficial de fichas técnicas en PDF)
  - SheetJS / XLSX (Exportación de reportes tabulares)

- **Backend:**
  - Node.js (v20+)
  - Express 4 (API RESTful modular)
  - TSX (Motor de ejecución TypeScript en tiempo de ejecución)
  - Persistencia híbrida resiliente: Conexión nativa con Supabase (PostgreSQL) con almacenamiento local de respaldo.

- **Base de Datos & Almacenamiento:**
  - PostgreSQL / Supabase con Row Level Security (RLS)
  - Supabase Storage (Almacenamiento de logotipos institucionales y evidencias)

---

## 🏢 Módulos del Sistema

| Módulo | Acceso | Funcionalidades Principales |
| :--- | :--- | :--- |
| **Portal Ciudadano Público** | Abierto (`/`, `/rutas`, `/consultar-reporte`) | Catálogo de rutas, buscador por filtros, vista de detalle paso a paso, formulario de radicación anónima y consulta de estado de radicado. |
| **Espacio Institucional** | Privado (`/mi-entidad/*`) | Gestión de rutas de la entidad, compromisos, biblioteca multimedia y módulo de atención de reportes ciudadanos (con paginación, filtros y buscador). |
| **Mesa de Coordinación** | Privado (`/coordinador/*`) | Bandeja de revisión técnica de rutas, matriz de observaciones, control de alertas y semáforos de cumplimiento. |
| **Administración General** | Privado (`/admin/*`) | Gestión de entidades adscritas, administración de usuarios y contraseñas, configuración de plazos estratégicos y registro de auditoría inmutable. |

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── components/         # Componentes reutilizables (layouts, modales, banners)
│   │   ├── layouts/        # Layouts de navegación (Admin, Coordinador, Institucional, Público)
│   │   └── public/         # Componentes ciudadanos y fichas de ruta
│   ├── pages/              # Vistas principales del sistema
│   │   ├── admin/          # Panel de administración de entidades, usuarios y auditoría
│   │   ├── coordinator/    # Panel de coordinación y revisión técnica
│   │   ├── institutional/  # Portal privado de las entidades y gestión de reportes
│   │   └── public/         # Catálogo público, radicación y consulta
│   ├── services/           # Cliente de API centralizado y llamadas HTTP
│   ├── types/              # Definiciones e interfaces TypeScript
│   ├── App.tsx             # Enrutador principal y control de sesión
│   └── main.tsx            # Punto de entrada del frontend
├── server.ts               # Servidor backend Express y controladores de API
├── ai_studio_code.sql      # Script de base de datos DDL completo para PostgreSQL / Supabase
├── render.yaml             # Manifiesto de despliegue en la nube para Render
├── package.json            # Configuración de dependencias y scripts de npm
└── .env.example            # Plantilla de variables de entorno requeridas
```

---

## ⚙️ Requisitos Previos

- **Node.js:** Versión 20.x o superior.
- **npm:** Versión 10.x o superior.
- **Cuenta en Supabase:** O una base de datos PostgreSQL estándar.

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd quibdo-rutas-migrantes
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo y completa tus credenciales:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` con tus valores de Supabase:
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET="clave_secreta_super_segura"
   SUPABASE_URL="https://tu-proyecto.supabase.co"
   SUPABASE_SERVICE_KEY="tu-service-role-key"
   SUPABASE_ANON_KEY="tu-anon-key"
   ```

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

5. **Compilar y probar en modo producción localmente:**
   ```bash
   npm run build
   npm start
   ```

---

## 🗄 Base de Datos (Supabase / PostgreSQL)

1. Ingresa al **SQL Editor** en tu proyecto de [Supabase](https://supabase.com).
2. Abre el archivo **`ai_studio_code.sql`** incluido en este repositorio.
3. Copia todo su contenido y ejecútalo en Supabase para crear automáticamente:
   - Enumeraciones de roles, estados y prioridades.
   - Tablas maestras: `system_config`, `entities`, `users`, `routes`, `route_steps`.
   - Tablas operativas: `observations`, `commitments`, `media_files`, `audit_logs` y `feedback_reports`.
   - Índices de alto rendimiento para consultas inmediatas.
   - Usuario administrador general por defecto.

> **Nota para bases de datos existentes:**  
> Si tu tabla `feedback_reports` ya fue creada previamente, ejecuta el bloque de migración no destructiva que se encuentra en la **Sección 6** al final de `ai_studio_code.sql` para añadir las columnas de respuesta institucional e índices correspondientes.

---

## ☁️ Despliegue en Producción (Render)

El proyecto está preconfigurado para ser desplegado como un **Web Service de Node** en [Render](https://render.com).

### Despliegue con 1 clic usando `render.yaml`:
1. Sube tu código a GitHub.
2. En Render, crea un **Blueprint** y selecciona tu repositorio.
3. Configura las variables secretas que solicite el panel.

### Despliegue Manual en Render:
1. En Render Dashboard, haz clic en **New +** > **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura los parámetros:
   - **Environment:** `Node`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
4. En **Environment Variables**, añade:
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `SUPABASE_SERVICE_KEY` = `tu-service-role-key`
   - `SUPABASE_ANON_KEY` = `tu-anon-key`
   - `JWT_SECRET` = `tu_clave_secreta_aleatoria`
5. Haz clic en **Create Web Service**. Render compilará el frontend con Vite y levantará el servidor Node en el puerto asignado dinámicamente.

---

## 🔐 Usuarios y Roles Iniciales

| Rol | Correo por Defecto | Contraseña por Defecto | Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador General** | `admin@sistema.com` | `Admin123*` | Control total del sistema, auditoría, configuración y gestión de entidades. |
| **Enlace Institucional (SISBEN)** | `sisben@quibdo.gov.co` | `Sisben123*` | Gestión de rutas de SISBEN y respuesta a radicados ciudadanos. |

*(Se recomienda actualizar las contraseñas inmediatamente después del primer inicio de sesión desde el perfil de usuario).*

---

## 📄 Licencia y Créditos

Desarrollado para la **Alcaldía Municipal de Quibdó** y la **Mesa de Coordinación Interinstitucional de Atención a la Población Migrante y Refugiada**.
