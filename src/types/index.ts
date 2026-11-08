export type SystemRole = 'admin' | 'coordinator' | 'institutional' | 'public';

export type RouteStatus = 
  | 'Borrador'
  | 'Enviada a revisión'
  | 'En revisión'
  | 'Devuelta para ajustes'
  | 'Aprobada'
  | 'Publicada'
  | 'Archivada'
  | 'Vencida';

export type EntityType = 
  | 'Municipal'
  | 'Departamental'
  | 'Nacional'
  | 'Órgano de Control'
  | 'Fuerza Pública'
  | 'Cooperación Internacional';

// 3. Entities (Fase 2 Extended Model)
export interface EntityModel {
  id: string;
  name: string;
  code: string;
  sigla?: string;
  entityType?: EntityType;
  entity_type?: EntityType;
  description?: string;
  logoUrl?: string;
  logo_url?: string;
  coverUrl?: string;
  cover_url?: string;
  address?: string;
  institutionalAddress?: string;
  phone?: string;
  institutionalPhone?: string;
  email?: string;
  institutionalEmail?: string;
  website?: string;
  serviceHours?: string;
  service_hours?: string;
  hours?: string;
  general_hours?: string;
  category?: string;
  active: boolean;
  primaryResponsible?: string;
  primary_responsible?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// 1. Users (Fase 2 Extended Model)
export interface UserModel {
  id: string;
  name: string;
  email: string;
  password?: string;
  password_hash?: string;
  positionTitle?: string;
  position_title?: string;
  role: SystemRole;
  role_id?: string;
  role_code?: SystemRole;
  entityId?: string;
  entity_id?: string;
  entityName?: string;
  entity_name?: string;
  active: boolean;
  createdAt?: string;
  created_at?: string;
  lastAccess?: string;
  last_access?: string;
}

// Entity Indicators & Metrics for Phase 2
export interface EntityProgressIndicators {
  entityId: string;
  entityName: string;
  entityCode: string;
  active: boolean;
  totalRoutes: number;
  draftsCount: number;
  inReviewCount: number;
  approvedCount: number;
  publishedCount: number;
  expiredCount: number;
  pendingObservationsCount: number;
  pendingCommitmentsCount: number;
  expiredCommitmentsCount: number;
  lastUpdatedAt: string;
}

// Route Steps
export interface RouteStepModel {
  id: string;
  route_id?: string;
  stepNumber?: number;
  step_number?: number;
  title: string;
  description: string;
  responsibleRole?: string;
  responsible_role?: string;
  estimatedTime?: string;
  estimated_time?: string;
  channel?: string;
  order?: number;
}

// Routes
export interface RouteModel {
  id: string;
  name: string;
  service_name: string;
  entity_id: string;
  entity_name: string;
  category_id?: string;
  category_name: string;
  description: string;
  target_population: string;
  addressed_need: string;
  channel_id?: string;
  channel_name: string;
  institutional_address: string;
  institutional_phone: string;
  institutional_email: string;
  service_hours: string;
  estimated_response_time: string;
  institutional_officer: string;
  status: RouteStatus;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  published_at?: string;
  next_review_date?: string;
  created_by_user_id: string;
  created_by_user_name: string;
  updated_by_user_id: string;
  updated_by_user_name: string;
}

// Audit Logs
export interface AuditLogModel {
  id: string;
  timestamp: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  userRole?: string;
  user_role?: string;
  entityName?: string;
  entity_name?: string;
  action: string;
  module?: string;
  targetId?: string;
  target_id?: string;
  targetRecord?: string;
  details: string;
  oldValues?: any;
  newValues?: any;
  ip_address?: string;
}

// Compatible Aliases
export type Role = SystemRole;
export type RouteState = RouteStatus;
export interface Entity extends EntityModel {}
export interface User extends UserModel {}
export interface RouteStep extends RouteStepModel {}
export type ProcedureStep = RouteStep;
export interface ReviewComment {
  id: string;
  userId?: string;
  userName?: string;
  userRole?: SystemRole | string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  date: string;
  comment: string;
  type?: 'general' | 'adjustment' | 'approval' | 'rejection';
  status?: string;
}
export interface DynamicRequirement {
  id: string;
  text: string;
  order: number;
  isObligatory: boolean;
  observation?: string;
}

export interface DynamicDocument {
  id: string;
  name: string;
  description?: string;
  isObligatory: boolean;
  observation?: string;
}

export interface DynamicStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  channel?: string;
  estimatedTime?: string;
  responsible?: string;
  order: number;
}

export interface RouteImage {
  id: string;
  url: string;
  altText: string;
  description?: string;
  isMain?: boolean;
  order?: number;
}

export interface AttentionRoute {
  id: string;
  name: string;
  serviceName: string;
  entityId: string;
  entityName: string;
  category: string;
  description: string;
  targetPopulation: string;
  addressedNeed: string;
  requirements: string[];
  dynamicRequirements?: DynamicRequirement[];
  requestedDocuments: string[];
  dynamicDocuments?: DynamicDocument[];
  channel: string;
  channels?: string[];
  institutionalAddress: string;
  institutionalPhone: string;
  institutionalEmail: string;
  serviceHours: string;
  estimatedResponseTime: string;
  procedureSteps: RouteStep[];
  dynamicSteps?: DynamicStep[];
  articulatedEntityIds: string[];
  articulatedEntityNames?: string[];
  institutionalOfficer: string;
  technicalObservations: string;
  institutionalCommitments: string;
  status: RouteState;
  mainImageUrl?: string;
  mainImageAlt?: string;
  galleryImages?: RouteImage[];
  attachmentUrls?: string[];
  incompleteFields?: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  nextReviewDate?: string;
  createdByUserId: string;
  createdByUserName: string;
  updatedByUserId: string;
  updatedByUserName: string;
  reviewComments: ReviewComment[];
  version?: number;
  parentRouteId?: string;
  versionHistory?: Array<{
    version: number;
    updatedAt: string;
    updatedByName: string;
    snapshot: any;
    reason?: string;
  }>;
}
export interface SystemConfig {
  initialMeetingDate: string;
  observationDeadline: string;
  municipalityName: string;
  departmentName: string;
  categories: string[];
  targetPopulations: string[];
  channels: string[];
  alcaldiaAddress?: string;
  alcaldiaPhone?: string;
  alcaldiaEmail?: string;
  alcaldiaSchedule?: string;
  alcaldiaScheduleNote?: string;
  alcaldiaSubtitle?: string;
}
export interface AuditLog extends AuditLogModel {
  userId: string;
  userName: string;
  userRole: string;
  entityName: string;
}
export interface FeedbackReport {
  id: string;
  routeId: string;
  routeName: string;
  entityId: string;
  entityName: string;
  date: string;
  reporterType: 'Ciudadano' | 'Organización' | 'Servidor Público' | string;
  issueType: 'desactualizado' | 'informacion_erronea' | 'contacto_no_funciona' | 'otro' | string;
  comments: string;
  status: 'pendiente' | 'revisado' | 'resuelto';
  response?: string;
  respondedAt?: string;
  responderName?: string;
}

// FASE 6: Observaciones y Ajustes Institucionales
export type ObservationPriority = 'Alta' | 'Media' | 'Baja';
export type ObservationStatus =
  | 'Pendiente'
  | 'En revisión'
  | 'Requiere aclaración'
  | 'Aceptada'
  | 'Rechazada'
  | 'Cerrada';

export interface ObservationHistoryItem {
  date: string;
  action: string;
  user: string;
  role: string;
  details?: string;
}

export interface ObservationModel {
  id: string;
  routeId: string;
  routeName: string;
  entityId: string;
  entityName: string;
  topic: string;
  currentProposal: string;
  whatToReview: string;
  entityObservation: string;
  adjustmentProposal: string;
  priority: ObservationPriority;
  status: ObservationStatus;
  responsible: string;
  createdAt: string;
  updatedAt: string;
  registeredByUserId: string;
  registeredByUserName: string;
  coordinatorResponse?: string;
  coordinatorResponseDate?: string;
  coordinatorResponderName?: string;
  history?: ObservationHistoryItem[];
}

// FASE 6: Compromisos Institucionales de Cumplimiento
export type CommitmentStatus =
  | 'Pendiente'
  | 'En proceso'
  | 'Cumplido'
  | 'Vencido'
  | 'Cancelado'
  | 'Requiere apoyo interinstitucional';

export interface CommitmentHistoryItem {
  date: string;
  action: string;
  user: string;
  progress: number;
  comments?: string;
}

export interface CommitmentModel {
  id: string;
  topic: string;
  agreement: string;
  routeId?: string;
  routeName?: string;
  entityId: string;
  entityName: string;
  responsiblePerson: string;
  institutionalEmail: string;
  commitmentDate: string; // YYYY-MM-DD
  status: CommitmentStatus;
  progressPercentage: number; // 0 - 100
  comments: string;
  evidenceUrl?: string;
  evidenceName?: string;
  updatedAt: string;
  createdAt: string;
  createdByUserId: string;
  createdByName?: string;
  history?: CommitmentHistoryItem[];
}

export type Observation = ObservationModel;
export type InstitutionalCommitment = CommitmentModel;

// FASE 8: Gestión Segura de Archivos y Multimedia Institucional
export type MediaFileType =
  | 'logo_entidad'
  | 'portada_entidad'
  | 'imagen_principal_ruta'
  | 'galeria_ruta'
  | 'documento_institucional'
  | 'evidencia_compromiso'
  | 'soporte_revision';

export type MediaFileStatus = 'active' | 'deleted';

export interface PrivacyCheckResult {
  hasSensitiveDataWarning: boolean;
  flags: string[];
  userAcknowledgedHabeasData: boolean;
}

export interface MediaFileModel {
  id: string;
  originalName: string;
  internalName: string;
  secureUrl: string;
  thumbnailUrl: string;
  type: MediaFileType;
  mimeType: string;
  size: number; // bytes
  sizeFormatted: string;
  width?: number;
  height?: number;
  altText?: string; // Obligatorio para imágenes
  description: string; // Mínimo requerido
  entityId: string;
  entityName: string;
  routeId?: string;
  routeName?: string;
  commitmentId?: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedAt: string;
  status: MediaFileStatus;
  deletedAt?: string;
  deletedByUserId?: string;
  deletedReason?: string;
  isPublic: boolean;
  privacyCheck?: PrivacyCheckResult;
  dataBase64?: string;
}

export type MediaFile = MediaFileModel;
