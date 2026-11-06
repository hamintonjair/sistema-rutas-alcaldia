# Propuesta Técnica, Arquitectura y Modelo de Datos
## Plataforma Institucional: Ruta Estratégica para la Atención Integral de la Población Migrante en el Municipio de Quibdó

---

## 1. Arquitectura General del Sistema

La arquitectura de la plataforma está concebida bajo una **Arquitectura en Capas (Layered Architecture) decoupled full-stack** orientada a servicios RESTful, que garantiza alta disponibilidad, aislamiento multi-tenant por entidad, cumplimiento estricto de habeas data y seguridad RBAC (Role-Based Access Control).

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 |                            CAPA DE PRESENTACIÓN                         |
 |  ┌───────────────────────┐ ┌────────────────────────┐ ┌──────────────┐  |
 |  │ Portal Público        │ │ Panel Coordinador/Adm. │ │ Panel Entidad│  |
 |  │ (React + Tailwind)   │ │ (Backoffice Admin)     │ │ (Tenant Hub) │  |
 |  └───────────┬───────────┘ └───────────┬────────────┘ └──────┬───────┘  |
 └──────────────┼─────────────────────────┼─────────────────────┼──────────┘
                │ HTTP / REST APIs        │ Bearer JWT          │
 ┌──────────────▼─────────────────────────▼─────────────────────▼──────────┐
 |                            CAPA DE APLICACIÓN                           |
 |  ┌───────────────────────────────────────────────────────────────────┐  |
 |  │ Node.js / Express Gateway API Router                              │  |
 |  │  ├─ Auth & RBAC Middleware (Tenant Isolation Guard)               │  |
 |  │  ├─ PII Detection & Sanitization Engine (No Sensitive Data Filter)│  |
 |  │  ├─ Workflow State Transition Engine                              │  |
 |  │  └─ Document Exporters (PDF / Excel / Word Engine)                │  |
 |  └───────────────────────────────────┬───────────────────────────────┘  |
 └──────────────────────────────────────┼──────────────────────────────────┘
                                        │ Prisma ORM / SQL Client
 ┌──────────────────────────────────────▼──────────────────────────────────┐
 |                            CAPA DE PERSISTENCIA                         |
 |  ┌───────────────────────────────────────────────────────────────────┐  |
 |  │ PostgreSQL Database (17 Tablas Relacionales Normalizadas 3FN)    │  |
 |  │  ├─ Auditoría inmutable (audit_logs)                              │  |
 |  │  └─ Trazabilidad de estados (route_reviews)                       │  |
 |  └───────────────────────────────────────────────────────────────────┘  |
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. División Visual y Funcional de las Tres Áreas

1. **Portal Público (Ciudadanía, Migrantes y Personería)**:
   - Acceso anónimo (sin autenticación).
   - Consulta **exclusiva** de rutas en estado `Publicada`.
   - Buscador avanzado y filtros por Entidad, Categoría, Población Objetivo, Necesidad y Canal.
   - Visor detallado con cronograma paso a paso y descarga de Ficha Oficial en PDF.
   - Módulo de reporte cívico sobre información desactualizada o canales inactivos.

2. **Panel Administrativo (Administrador General)**:
   - Gestión integral de Entidades Institucionales (Creación, edición, activación/desactivación de las 19 entidades).
   - Gestión de Usuarios y asignación a Entidades.
   - Configuración dinámica del sistema (Fecha de reunión inicial y **Fecha límite configurable para enviar observaciones**).
   - Consulta global de auditoría de acciones (`audit_logs`) e informes consolidados.

3. **Panel Institucional (Coordinador de Ruta y Enlaces de Entidad)**:
   - **Enlace de Entidad**: Aislamiento estricto (Tenant Isolation); únicamente crea, edita y registra compromisos y observaciones para la entidad asignada. Envía rutas a revisión.
   - **Coordinador de la Ruta**: Revisa borradores cargados por todas las entidades, registra observaciones técnicas, devuelve rutas para ajustes con comentarios o aprueba y publica rutas.

---

## 3. Mapa de Módulos

```
                               ┌──────────────────────────┐
                               │ MÓDULOS DE LA PLATAFORMA │
                               └────────────┬─────────────┘
                                            │
      ┌────────────────────┬────────────────┼────────────────────┬────────────────────┐
      ▼                    ▼                ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐     ┌──────────────────┐
│ MOD-01       │   │ MOD-02       │  │ MOD-03       │   │ MOD-04       │     │ MOD-05           │
│ Portal       │   │ Gestión de   │  │ Flujo de     │   │ Entidades y  │     │ Compromisos y    │
│ Ciudadano    │   │ Rutas        │  │ Coordinación │   │ Usuarios     │     │ Observaciones    │
└──────────────┘   └──────────────┘  └──────────────┘   └──────────────┘     └──────────────────┘
      │                    │                │                    │                    │
      ▼                    ▼                ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐     ┌──────────────────┐
│ MOD-06       │   │ MOD-07       │  │ MOD-08       │   │ MOD-09       │     │ MOD-10           │
│ Motor PII    │   │ Exportaciones│  │ Config.      │   │ Auditoría    │     │ Notificaciones   │
│ (Habeas Data)│   │ PDF/XLS/Doc  │  │ Fechas/Plazos│   │ e Historial  │     │ Institucionales  │
└──────────────┘   └──────────────┘  └──────────────┘   └──────────────┘     └──────────────────┘
```

---

## 4. Diagrama y Reglas del Flujo de Publicación

### Diagrama de Estados y Transiciones

```
 ┌───────────┐       Envío a Revisión        ┌────────────────────┐
 │ Borrador  │ ────────────────────────────> │ Enviada a revisión │
 └─────▲─────┘                               └─────────┬──────────┘
       │                                               │
       │                                               ▼
 ┌─────┴──────────────────┐   Devolver para   ┌────────────────────┐
 │ Devuelta para ajustes  │ <──────────────── │    En revisión     │
 └────────────────────────┘     Ajustes       └────────┬───────────┘
                                                       │
                                                       │ Aprobar
                                                       ▼
 ┌───────────┐             Publicar           ┌────────────────────┐
 │ Publicada │ <───────────────────────────── │      Aprobada      │
 └─────┬─────┘                                └────────────────────┘
       │
       │ Archivar / Vencer
       ▼
 ┌────────────────────────┐
 │  Archivada / Vencida   │
 └────────────────────────┘
```

### Reglas de Negocio del Flujo:
1. Ninguna ruta en estado `Borrador`, `Enviada a revisión`, `En revisión` o `Devuelta para ajustes` puede ser visualizada en el portal público.
2. Solo los roles `Coordinador de la Ruta` y `Administrador` tienen la atribución legal de transicionar el estado a `Aprobada` o `Publicada`.
3. Cuando una ruta es transicionada a `Devuelta para ajustes`, el sistema exige ingresar un comentario justificado que queda registrado en `route_reviews` y notifica al usuario de la entidad creadora.

---

## 5. Modelo Entidad-Relación (ERD Conceptual)

```
 [roles] 1 ──── N [users] 1 ──── 0..1 [institutional_profiles] N ──── 1 [entities]
                     │                                                      │
                     │ (crea/actualiza)                                     │ (posee)
                     ▼                                                      ▼
             [route_reviews] N ───────── 1 [routes] 1 ─────────────────── N [commitments]
                     │                       │
                     ├───────────────┬───────┼───────────────┬──────────────┐
                     ▼               ▼       ▼               ▼              ▼
           [route_steps] [requirements] [observations] [files]  [general_obs]
```

---

## 6. Matriz de Permisos por Rol (RBAC)

| Módulo / Acción | Administrador | Coordinador de Ruta | Usuario Institucional | Usuario Público |
|---|:---:|:---:|:---:|:---:|
| Ver rutas publicadas |  |  |  |  |
| Crear/Editar borradores de su entidad |  |  |  | ❌ |
| Crear/Editar rutas de cualquier entidad |  | ❌ | ❌ | ❌ |
| Enviar ruta a revisión |  |  |  | ❌ |
| Devolver ruta para ajustes |  |  | ❌ | ❌ |
| Aprobar y publicar rutas |  |  | ❌ | ❌ |
| Gestionar Entidades (19 iniciales) |  | ❌ | ❌ | ❌ |
| Crear y asignar usuarios |  | ❌ | ❌ | ❌ |
| Configurar fecha de reunión y observaciones |  |  | ❌ | ❌ |
| Consultar logs de auditoría |  |  | ❌ | ❌ |
| Reportar información desactualizada |  |  |  |  |

---

## 7. Estructura de Carpetas Sugerida

```
quibdo-migrantes-platform/
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   │   ├── exportUtils.ts
│   │   └── piiValidator.ts
│   └── components/
│       ├── common/
│       │   ├── Header.tsx
│       │   ├── PIIWarningBanner.tsx
│       │   ├── RouteStatusBadge.tsx
│       │   └── ScheduleView.tsx
│       ├── public/
│       │   ├── PublicPortal.tsx
│       │   ├── RouteDetailModal.tsx
│       │   └── ReportIssueModal.tsx
│       └── institutional/
│           ├── InstitutionalBackoffice.tsx
│           ├── RouteFormModal.tsx
│           ├── EntitiesManager.tsx
│           ├── UsersManager.tsx
│           ├── AuditLogViewer.tsx
│           ├── DateSettingsPanel.tsx
│           ├── CommitmentsView.tsx
│           └── ReportsExportPanel.tsx
```

---

## 8. Diseño de la Base de Datos (Esquema DDL de las 17 Tablas)

### 1. `roles`
```sql
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'coordinator', 'institutional', 'public'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `entities`
```sql
CREATE TABLE entities (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `users`
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role_id VARCHAR(36) NOT NULL REFERENCES roles(id),
  entity_id VARCHAR(36) REFERENCES entities(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `institutional_profiles`
```sql
CREATE TABLE institutional_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_id VARCHAR(36) NOT NULL REFERENCES entities(id),
  position_title VARCHAR(150) NOT NULL,
  official_phone VARCHAR(50),
  department VARCHAR(150),
  is_primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `route_categories`
```sql
CREATE TABLE route_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  active BOOLEAN DEFAULT TRUE
);
```

### 6. `route_channels`
```sql
CREATE TABLE route_channels (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 'Presencial', 'Virtual', 'Telefónico', 'Móvil / Jornadas'
  type VARCHAR(50) NOT NULL,
  description TEXT
);
```

### 7. `routes`
```sql
CREATE TABLE routes (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  entity_id VARCHAR(36) NOT NULL REFERENCES entities(id),
  category_id VARCHAR(36) REFERENCES route_categories(id),
  channel_id VARCHAR(36) REFERENCES route_channels(id),
  description TEXT NOT NULL,
  target_population VARCHAR(255) NOT NULL,
  addressed_need TEXT NOT NULL,
  institutional_address VARCHAR(255),
  institutional_phone VARCHAR(100),
  institutional_email VARCHAR(150),
  service_hours TEXT,
  estimated_response_time VARCHAR(100),
  institutional_officer VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Borrador', -- Borrador, Enviada a revisión, En revisión, Devuelta para ajustes, Aprobada, Publicada, Archivada, Vencida
  created_by_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  updated_by_user_id VARCHAR(36) REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  next_review_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 8. `route_requirements`
```sql
CREATE TABLE route_requirements (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'requisito' O 'documento'
  title TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT TRUE,
  order_index INT DEFAULT 0
);
```

### 9. `route_steps`
```sql
CREATE TABLE route_steps (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  responsible_role VARCHAR(150),
  estimated_time VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 10. `observations`
```sql
CREATE TABLE observations (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'tecnica', -- 'tecnica', 'ajuste', 'general'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 11. `commitments`
```sql
CREATE TABLE commitments (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  entity_id VARCHAR(36) NOT NULL REFERENCES entities(id),
  commitment_text TEXT NOT NULL,
  target_date DATE,
  status VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'en_proceso', 'cumplido'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 12. `notifications`
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 13. `audit_logs`
```sql
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'CREAR_RUTA', 'CAMBIO_ESTADO', 'APROBAR_RUTA', etc.
  target_id VARCHAR(36),
  details TEXT NOT NULL,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 14. `route_reviews`
```sql
CREATE TABLE route_reviews (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  reviewer_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  review_notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 15. `general_observations`
```sql
CREATE TABLE general_observations (
  id VARCHAR(36) PRIMARY KEY,
  entity_id VARCHAR(36) REFERENCES entities(id),
  author_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 16. `system_settings`
```sql
CREATE TABLE system_settings (
  id VARCHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL, -- 'observation_deadline', 'initial_meeting_date'
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by_user_id VARCHAR(36) REFERENCES users(id)
);
```

### 17. `files`
```sql
CREATE TABLE files (
  id VARCHAR(36) PRIMARY KEY,
  route_id VARCHAR(36) REFERENCES routes(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Reglas de Seguridad

1. **Aislamiento Multi-Tenant por Entidad**: El middleware de Express verifica la entidad del token JWT/Contexto. Ningún usuario de tipo `institutional` puede consultar o editar borradores de otra entidad.
2. **Validación de Roles en Backend**: La publicación y aprobación se rechaza a nivel de servidor si `user.role` no pertenece a `admin` o `coordinator`.
3. **Desinfección de Inputs**: Uso de Zod / Express Sanitizer para prevenir inyecciones SQL y XSS en los campos de procedimiento.

---

## 10. Reglas de Auditoría

1. Registra de forma **inmutable** en `audit_logs`: ID de usuario, rol, entidad, timestamp ISO, IP, acción exacta y valor anterior/nuevo de los estados.
2. La tabla `audit_logs` no permite operaciones de `UPDATE` ni `DELETE` bajo ninguna circunstancia.

---

## 11. Estrategia para Detectar Datos Personales o Sensibles (PII Engine)

```typescript
export function checkPIIViolation(text: string): string[] {
  const warnings: string[] = [];
  if (!text) return warnings;

  // Pattern 1: Colombian National ID numbers / PPT / PEP / Cédulas
  if (/\b(CC|TI|CE|PEP|PPT|Pasaporte)\s*[:#.]?\s*\d{6,11}\b/i.test(text) || /\b\d{1,3}\.\d{3}\.\d{3}\b/.test(text)) {
    warnings.push('Posible número de identificación personal o cédula/PPT detectado.');
  }

  // Pattern 2: Personal mobile phone numbers
  if (/\b3[0-5]\d[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(text)) {
    warnings.push('Posible número de teléfono personal detectado (se requieren únicamente PBX o fijos institucionales).');
  }

  // Pattern 3: Clinical or sensitive individual case terminology
  if (/\b(paciente|historia clínica|diagnóstico clínico|víctima|beneficiario nombre|dirección particular)\b/i.test(text)) {
    warnings.push('Término de atención individual o historia médica detectado.');
  }

  return warnings;
}
```

---

## 12. Estrategia de Pruebas

1. **Pruebas de Unidad (Jest / Vitest)**:
   - Validación del motor de detección PII.
   - Evaluación de la máquina de estados del flujo de aprobación.
2. **Pruebas de Integración (Supertest)**:
   - Verificación de respuestas API REST y bloqueo de acceso no autorizado entre entidades.
3. **Pruebas de Aceptación E2E (Playwright)**:
   - Recorrido del ciudadano buscando rutas publicadas.
   - Recorrido del coordinador aprobando y devolviendo rutas con comentarios.

---

## 13. Plan de Desarrollo por Fases

- **Fase 1**: Análisis, Arquitectura, Esquema DDL de 17 tablas y prototipado. *(Fase Actual Entregada)*.
- **Fase 2**: Implementación del Backend API REST en Node/Express con ORM Prisma/PostgreSQL y autenticación RBAC.
- **Fase 3**: Construcción del Portal Público con filtros institucionales y exportador a PDF.
- **Fase 4**: Panel Institucional de Entidades, Validador PII y Panel del Coordinador con flujo de observaciones.
- **Fase 5**: Generación de informes consolidados en Excel, Word y auditoría final.

---

## 14. Historias de Usuario Principales y Criterios de Aceptación

### **HU-01: Consulta Pública Ciudadana de Rutas Aprobadas**
> **Como** ciudadano o migrante en Quibdó,  
> **Quiero** consultar los servicios y rutas de atención publicados por la Alcaldía,  
> **Para** conocer los requisitos, horarios y canales oficiales sin ingresar datos personales.

**Criterios de Aceptación**:
1. Solo se muestran rutas cuyo estado sea estrictamente `Publicada`.
2. Permite filtrar por Entidad Responsable (entre las 19 entidades), Categoría, Población Objetivo y Canal.
3. Permite descargar la ficha técnica individual en formato PDF oficial.

---

### **HU-02: Gestión y Carga de Rutas por Entidad**
> **Como** usuario institucional enlace de una secretaría,  
> **Quiero** redactar y enviar las rutas de atención de mi entidad,  
> **Para** remitirlas a revisión por parte de la Secretaría Coordinadora.

**Criterios de Aceptación**:
1. El usuario solo visualiza y edita información correspondiente a su propia entidad.
2. El sistema muestra una advertencia visible: *"No incluya datos personales de casos concretos"*.
3. El motor de PII alerta en tiempo real si se ingresan números de cédula o datos personales sensibles.

---

### **HU-03: Revisión, Aprobación y Devolución por el Coordinador**
> **Como** Coordinador de la Ruta,  
> **Quiero** examinar los borradores enviados por las entidades,  
> **Para** devolverlos con observaciones técnicas o aprobados para publicación pública.

**Criterios de Aceptación**:
1. El coordinador visualiza las rutas de todas las entidades en estado `Enviada a revisión` o `En revisión`.
2. Al seleccionar *"Devolver para ajustes"*, el sistema exige ingresar un comentario obligatorio.
3. Una ruta aprobada o devuelta no se publica en el portal público hasta alcanzar el estado `Publicada`.
