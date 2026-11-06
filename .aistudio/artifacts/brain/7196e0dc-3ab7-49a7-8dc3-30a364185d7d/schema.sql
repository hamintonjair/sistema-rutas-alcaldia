-- =============================================================================
-- SISTEMA INTEGRAL - SCRIPT DE CREACIÓN DE BASE DE DATOS (COMPLETO Y ROBUSTO)
-- =============================================================================

-- 1. LIMPIEZA PREVENTIVA DE TIPOS
DROP TYPE IF EXISTS system_role CASCADE;
DROP TYPE IF EXISTS route_status CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS observation_priority CASCADE;
DROP TYPE IF EXISTS observation_status CASCADE;
DROP TYPE IF EXISTS commitment_status CASCADE;
DROP TYPE IF EXISTS media_file_type CASCADE;
DROP TYPE IF EXISTS media_file_status CASCADE;

-- 2. CREACIÓN DE ENUMERACIONES
CREATE TYPE system_role AS ENUM ('admin', 'coordinator', 'institutional', 'public');
CREATE TYPE route_status AS ENUM ('Borrador', 'Enviada a revisión', 'En revisión', 'Devuelta para ajustes', 'Aprobada', 'Publicada', 'Archivada', 'Vencida');
CREATE TYPE entity_type AS ENUM ('Municipal', 'Departamental', 'Nacional', 'Órgano de Control', 'Fuerza Pública', 'Cooperación Internacional');
CREATE TYPE observation_priority AS ENUM ('Alta', 'Media', 'Baja');
CREATE TYPE observation_status AS ENUM ('Pendiente', 'En revisión', 'Requiere aclaración', 'Aceptada', 'Rechazada', 'Cerrada');
CREATE TYPE commitment_status AS ENUM ('Pendiente', 'En proceso', 'Cumplido', 'Vencido', 'Cancelado', 'Requiere apoyo interinstitucional');
CREATE TYPE media_file_type AS ENUM ('logo_entidad', 'portada_entidad', 'imagen_principal_ruta', 'galeria_ruta', 'documento_institucional', 'evidencia_compromiso', 'soporte_revision');
CREATE TYPE media_file_status AS ENUM ('active', 'deleted');

-- 3. CREACIÓN DE TABLAS
CREATE TABLE system_config (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'global-config',
    municipality_name VARCHAR(255) NOT NULL DEFAULT 'Quibdó',
    department_name VARCHAR(255) NOT NULL DEFAULT 'Chocó',
    initial_meeting_date DATE,
    observation_deadline DATE,
    categories JSONB DEFAULT '[]'::jsonb,
    target_populations JSONB DEFAULT '[]'::jsonb,
    channels JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    sigla VARCHAR(50),
    entity_type VARCHAR(50) DEFAULT 'Municipal',
    description TEXT,
    category VARCHAR(100),
    logo_url TEXT,
    cover_url TEXT,
    address TEXT,
    phone VARCHAR(100),
    email VARCHAR(255),
    website TEXT,
    service_hours TEXT,
    primary_responsible VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'institutional',
    entity_id VARCHAR(64) REFERENCES entities(id) ON DELETE SET NULL,
    entity_name VARCHAR(255),
    position_title VARCHAR(255),
    phone VARCHAR(100),
    photo_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP WITH TIME ZONE
);

CREATE TABLE routes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    target_population TEXT NOT NULL,
    addressed_need TEXT NOT NULL,
    channel VARCHAR(255),
    channels JSONB DEFAULT '[]'::jsonb,
    institutional_address TEXT,
    institutional_phone VARCHAR(100),
    institutional_email VARCHAR(255),
    service_hours VARCHAR(255),
    estimated_response_time VARCHAR(255),
    institutional_officer VARCHAR(255),
    technical_observations TEXT,
    institutional_commitments TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Borrador',
    main_image_url TEXT,
    main_image_alt TEXT,
    version INT DEFAULT 1,
    parent_route_id VARCHAR(64) REFERENCES routes(id) ON DELETE SET NULL,
    created_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    created_by_user_name VARCHAR(255) NOT NULL,
    updated_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    updated_by_user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    next_review_date DATE
);

CREATE TABLE route_steps (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    responsible_role VARCHAR(255),
    channel VARCHAR(255),
    estimated_time VARCHAR(100),
    step_order INT NOT NULL
);

CREATE TABLE route_requirements (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    is_obligatory BOOLEAN DEFAULT TRUE,
    observation TEXT,
    req_order INT NOT NULL
);

CREATE TABLE route_documents (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_obligatory BOOLEAN DEFAULT TRUE,
    observation TEXT
);

CREATE TABLE review_comments (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_versions (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    version INT NOT NULL,
    snapshot JSONB NOT NULL,
    reason TEXT,
    updated_by_user_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE observations (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) REFERENCES routes(id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    current_proposal TEXT,
    what_to_review TEXT NOT NULL,
    entity_observation TEXT NOT NULL,
    adjustment_proposal TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Media',
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    responsible VARCHAR(255) NOT NULL,
    registered_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    registered_by_user_name VARCHAR(255) NOT NULL,
    coordinator_response TEXT,
    coordinator_response_date TIMESTAMP WITH TIME ZONE,
    coordinator_responder_name VARCHAR(255),
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE commitments (
    id VARCHAR(64) PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    agreement TEXT NOT NULL,
    route_id VARCHAR(64) REFERENCES routes(id) ON DELETE SET NULL,
    route_name VARCHAR(255),
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL,
    responsible_person VARCHAR(255) NOT NULL,
    institutional_email VARCHAR(255) NOT NULL,
    commitment_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    comments TEXT,
    evidence_url TEXT,
    evidence_name VARCHAR(255),
    created_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    created_by_name VARCHAR(255),
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_files (
    id VARCHAR(64) PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    internal_name VARCHAR(255) NOT NULL UNIQUE,
    secure_url TEXT NOT NULL,
    thumbnail_url TEXT,
    type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    size_formatted VARCHAR(50) NOT NULL,
    width INT,
    height INT,
    alt_text TEXT,
    description TEXT NOT NULL,
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    entity_name VARCHAR(255) NOT NULL,
    route_id VARCHAR(64) REFERENCES routes(id) ON DELETE CASCADE,
    route_name VARCHAR(255),
    commitment_id VARCHAR(64) REFERENCES commitments(id) ON DELETE CASCADE,
    uploaded_by_user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    uploaded_by_user_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    is_public BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by_user_id VARCHAR(64),
    deleted_reason TEXT,
    privacy_check JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL DEFAULT 'General',
    target_id VARCHAR(64),
    target_record VARCHAR(255),
    details TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45)
);

CREATE TABLE feedback_reports (
    id VARCHAR(64) PRIMARY KEY,
    route_id VARCHAR(64) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(64) REFERENCES entities(id) ON DELETE SET NULL,
    entity_name VARCHAR(255) NOT NULL,
    reporter_type VARCHAR(50) NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    comments TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responder_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ÍNDICES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_entity ON users(entity_id);
CREATE INDEX idx_routes_entity ON routes(entity_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_category ON routes(category);
CREATE INDEX idx_route_steps_route ON route_steps(route_id, step_number);
CREATE INDEX idx_observations_route ON observations(route_id);
CREATE INDEX idx_observations_entity ON observations(entity_id);
CREATE INDEX idx_observations_status ON observations(status);
CREATE INDEX idx_commitments_entity ON commitments(entity_id);
CREATE INDEX idx_commitments_status ON commitments(status);
CREATE INDEX idx_media_files_entity ON media_files(entity_id);
CREATE INDEX idx_media_files_route ON media_files(route_id);
CREATE INDEX idx_media_files_status ON media_files(status, is_public);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_feedback_reports_route ON feedback_reports(route_id);
CREATE INDEX idx_feedback_reports_entity ON feedback_reports(entity_id);
CREATE INDEX idx_feedback_reports_status ON feedback_reports(status);

-- 5. USUARIO ADMINISTRADOR POR DEFECTO
INSERT INTO users (id, name, email, password_hash, role, active)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Administrador',
    'admin@sistema.com',
    'PENDIENTE_ACTUALIZAR',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 6. MIGRACIÓN PARA BASES DE DATOS EXISTENTES (NO DESTRUCTIVA)
-- Si ya ejecutó este script anteriormente y su tabla feedback_reports no tiene
-- los campos de entidad y respuesta institucional, ejecute este bloque:
-- =============================================================================
ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS entity_id VARCHAR(64) REFERENCES entities(id) ON DELETE SET NULL;
ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS responder_name VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_route ON feedback_reports(route_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_entity ON feedback_reports(entity_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reports_status ON feedback_reports(status);
