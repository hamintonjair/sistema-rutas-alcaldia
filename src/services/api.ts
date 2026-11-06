import {
  Entity,
  User,
  AttentionRoute,
  SystemConfig,
  AuditLog,
  FeedbackReport,
  RouteState,
  EntityProgressIndicators,
  ObservationModel,
  CommitmentModel,
  MediaFileModel,
  MediaFileType,
} from '../types';

export interface UserContext {
  id: string;
  name: string;
  role: 'admin' | 'coordinator' | 'institutional' | 'public';
  entityId?: string;
  entityName?: string;
  role_code?: string;
  roleSpanish?: string;
  email?: string;
}

function getAuthHeaders(userContext?: UserContext) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = typeof window !== 'undefined' ? localStorage.getItem('quibdo_auth_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userContext) {
    headers['x-user-id'] = userContext.id;
    headers['x-user-name'] = userContext.name;
    headers['x-user-role'] = userContext.role;
    if (userContext.entityId) {
      headers['x-user-entity-id'] = userContext.entityId;
      headers['x-entity-id'] = userContext.entityId;
    }
  }
  return headers;
}

async function parseJsonResponse<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Error en el servidor (${res.status}): ${res.statusText}`);
    }
    throw new Error('Respuesta no esperada del servidor (se recibió HTML en lugar de JSON).');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Error en la solicitud (${res.status})`);
  }
  return data;
}

export const api = {
  // Auth API
  async login(email: string, password_hash: string): Promise<{ token: string; user: UserContext }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: password_hash }),
    });
    return parseJsonResponse(res);
  },

  async logout(userContext: UserContext): Promise<void> {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(userContext),
      });
      await parseJsonResponse(res);
    } catch (e) {
      // Ignore logout cleanup failures
    }
  },

  async recoverPassword(email: string): Promise<{ success: boolean; message: string; token?: string }> {
    const res = await fetch('/api/auth/recover-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseJsonResponse(res);
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword }),
    });
    return parseJsonResponse(res);
  },

  async runAuthTests(): Promise<any> {
    const res = await fetch('/api/tests/run');
    return parseJsonResponse(res);
  },

  async runPhase2Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase2');
    return parseJsonResponse(res);
  },

  async runPhase3Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase3');
    return parseJsonResponse(res);
  },

  async runPhase4Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase4');
    return parseJsonResponse(res);
  },

  async runPhase5Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase5');
    return parseJsonResponse(res);
  },

  async runPhase6Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase6');
    return parseJsonResponse(res);
  },

  async runPhase7Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase7');
    return parseJsonResponse(res);
  },

  async purgeDatabase(userContext: UserContext): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/purge-database', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // System Config
  async getConfig(): Promise<SystemConfig> {
    const res = await fetch('/api/config');
    return parseJsonResponse(res);
  },

  async updateConfig(config: Partial<SystemConfig>, userContext: UserContext): Promise<{ success: boolean; config: SystemConfig }> {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(config),
    });
    return parseJsonResponse(res);
  },

  // Entities
  async getEntities(): Promise<Entity[]> {
    const res = await fetch('/api/entities');
    return parseJsonResponse(res);
  },

  async getEntityDetail(id: string): Promise<{
    entity: Entity;
    users: User[];
    routes: AttentionRoute[];
    indicators: EntityProgressIndicators;
  }> {
    const res = await fetch(`/api/entities/${id}`);
    return parseJsonResponse(res);
  },

  async createEntity(entity: { name: string; entityType?: string; code?: string; category?: string; [key: string]: any }, userContext: UserContext): Promise<Entity> {
    const res = await fetch('/api/entities', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(entity),
    });
    return parseJsonResponse(res);
  },

  async updateEntity(id: string, entity: Partial<Entity>, userContext: UserContext): Promise<Entity> {
    const res = await fetch(`/api/entities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(entity),
    });
    return parseJsonResponse(res);
  },

  // Users
  async getUsers(userContext: UserContext): Promise<User[]> {
    const res = await fetch('/api/users', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async createUser(user: Partial<User> & { password?: string; password_hash?: string }, userContext: UserContext): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(user),
    });
    return parseJsonResponse(res);
  },

  async updateUser(id: string, user: Partial<User> & { password?: string; password_hash?: string }, userContext: UserContext): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(user),
    });
    return parseJsonResponse(res);
  },

  async resetUserPassword(userId: string, userContext: UserContext): Promise<{ success: boolean; message: string; tempPassword?: string }> {
    const res = await fetch(`/api/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // Routes
  async getRoutes(params?: {
    publicOnly?: boolean;
    entityId?: string;
    category?: string;
    status?: string;
    search?: string;
    population?: string;
    channel?: string;
  }): Promise<AttentionRoute[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.publicOnly) query.append('publicOnly', 'true');
      if (params.entityId) query.append('entityId', params.entityId);
      if (params.category) query.append('category', params.category);
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      if (params.population) query.append('population', params.population);
      if (params.channel) query.append('channel', params.channel);
    }
    const res = await fetch(`/api/routes?${query.toString()}`);
    return parseJsonResponse(res);
  },

  async createRoute(routeData: Partial<AttentionRoute>, userContext: UserContext): Promise<{ route: AttentionRoute; piiWarnings: string[] }> {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(routeData),
    });
    return parseJsonResponse(res);
  },

  async updateRoute(id: string, routeData: Partial<AttentionRoute>, userContext: UserContext): Promise<{ route: AttentionRoute; piiWarnings: string[] }> {
    const res = await fetch(`/api/routes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(routeData),
    });
    return parseJsonResponse(res);
  },

  async changeRouteStatus(id: string, newStatus: RouteState, comment: string, userContext: UserContext): Promise<AttentionRoute> {
    const res = await fetch(`/api/routes/${id}/status`, {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ newStatus, comment }),
    });
    return parseJsonResponse(res);
  },

  // Audit Logs
  async getAuditLogs(userContext: UserContext): Promise<AuditLog[]> {
    const res = await fetch('/api/audit', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // Feedback Reports
  async getFeedbackReports(userContext?: UserContext): Promise<FeedbackReport[]> {
    const res = await fetch('/api/feedback', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async getFeedbackReportById(radicadoId: string): Promise<FeedbackReport> {
    const res = await fetch(`/api/feedback/consult/${radicadoId}`);
    return parseJsonResponse(res);
  },

  async submitFeedbackReport(report: { routeId: string; reporterType: string; issueType: string; comments: string }): Promise<FeedbackReport> {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return parseJsonResponse(res);
  },

  async respondToFeedbackReport(id: string, response: string, status: string, userContext: UserContext): Promise<FeedbackReport> {
    const res = await fetch(`/api/feedback/${id}/respond`, {
      method: 'PATCH',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ response, status }),
    });
    return parseJsonResponse(res);
  },

  // Reports Summary
  async getConsolidatedReport(userContext: UserContext): Promise<{
    summary: {
      totalEntities: number;
      totalRoutes: number;
      publishedRoutes: number;
      approvedRoutes: number;
      inReviewRoutes: number;
      returnedRoutes: number;
      draftRoutes: number;
      meetingDate: string;
      observationDeadline: string;
    };
    entityMatrix: Array<{
      entityId: string;
      entityName: string;
      entityCode: string;
      totalRoutes: number;
      published: number;
      pending: number;
      drafts: number;
      commitmentsCount: number;
    }>;
  }> {
    const res = await fetch('/api/reports/consolidated', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // FASE 6: Observaciones y Propuestas de Ajuste
  async getObservations(
    params?: {
      entityId?: string;
      priority?: string;
      status?: string;
      routeId?: string;
      search?: string;
    },
    userContext?: UserContext
  ): Promise<ObservationModel[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.entityId) query.append('entityId', params.entityId);
      if (params.priority) query.append('priority', params.priority);
      if (params.status) query.append('status', params.status);
      if (params.routeId) query.append('routeId', params.routeId);
      if (params.search) query.append('search', params.search);
    }
    const res = await fetch(`/api/observations?${query.toString()}`, {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async createObservation(
    data: Partial<ObservationModel>,
    userContext: UserContext
  ): Promise<{ observation: ObservationModel; piiWarnings: string[] }> {
    const res = await fetch('/api/observations', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  async updateObservation(
    id: string,
    data: Partial<ObservationModel>,
    userContext: UserContext
  ): Promise<{ observation: ObservationModel; piiWarnings: string[] }> {
    const res = await fetch(`/api/observations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  async respondObservation(
    id: string,
    status: string,
    coordinatorResponse: string,
    userContext: UserContext
  ): Promise<ObservationModel> {
    const res = await fetch(`/api/observations/${id}/respond`, {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ status, coordinatorResponse }),
    });
    return parseJsonResponse(res);
  },

  // FASE 6: Compromisos Institucionales
  async getCommitments(
    params?: {
      entityId?: string;
      status?: string;
      search?: string;
      expiredOnly?: boolean;
    },
    userContext?: UserContext
  ): Promise<CommitmentModel[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.entityId) query.append('entityId', params.entityId);
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      if (params.expiredOnly) query.append('expiredOnly', 'true');
    }
    const res = await fetch(`/api/commitments?${query.toString()}`, {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async createCommitment(
    data: Partial<CommitmentModel>,
    userContext: UserContext
  ): Promise<{ commitment: CommitmentModel; piiWarnings: string[] }> {
    const res = await fetch('/api/commitments', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  async updateCommitment(
    id: string,
    data: Partial<CommitmentModel>,
    userContext: UserContext
  ): Promise<{ commitment: CommitmentModel; piiWarnings: string[]; sql?: string; supabaseSuccess?: boolean; supabaseMessage?: string }> {
    const res = await fetch(`/api/commitments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  async deleteCommitment(id: string, userContext: UserContext): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/commitments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async syncCommitmentsToSupabase(userContext: UserContext): Promise<{
    total: number;
    synced: number;
    errors: string[];
    sqlStatements: string[];
    message: string;
  }> {
    const res = await fetch('/api/commitments/sync-supabase', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // FASE 7: Dashboards & Métricas
  async getAdminDashboardStats(userContext: UserContext): Promise<any> {
    const res = await fetch('/api/admin/dashboard-stats', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async getCoordinatorDashboardStats(userContext: UserContext): Promise<any> {
    const res = await fetch('/api/coordinator/dashboard-stats', {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async getInstitutionalDashboardStats(userContext: UserContext, entityId?: string): Promise<any> {
    const query = entityId ? `?entityId=${entityId}` : '';
    const res = await fetch(`/api/institutional/dashboard-stats${query}`, {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  // FASE 8: Gestión de Archivos y Multimedia
  async getMediaFiles(
    params?: {
      entityId?: string;
      routeId?: string;
      type?: string;
      search?: string;
      includeDeleted?: boolean;
    },
    userContext?: UserContext
  ): Promise<MediaFileModel[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.entityId) query.append('entityId', params.entityId);
      if (params.routeId) query.append('routeId', params.routeId);
      if (params.type) query.append('type', params.type);
      if (params.search) query.append('search', params.search);
      if (params.includeDeleted) query.append('includeDeleted', 'true');
    }
    const res = await fetch(`/api/media?${query.toString()}`, {
      headers: getAuthHeaders(userContext),
    });
    return parseJsonResponse(res);
  },

  async uploadMediaFile(
    data: {
      originalName: string;
      type: MediaFileType;
      mimeType?: string;
      size: number;
      altText?: string;
      description: string;
      entityId?: string;
      routeId?: string;
      routeName?: string;
      commitmentId?: string;
      width?: number;
      height?: number;
      dataBase64?: string;
      userAcknowledgedHabeasData?: boolean;
    },
    userContext: UserContext
  ): Promise<{ file: MediaFileModel; privacyCheck: any }> {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(data),
    });
    return parseJsonResponse(res);
  },

  async updateMediaFile(
    fileId: string,
    updates: { altText?: string; description?: string },
    userContext: UserContext
  ): Promise<MediaFileModel> {
    const res = await fetch(`/api/media/${fileId}`, {
      method: 'PUT',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify(updates),
    });
    return parseJsonResponse(res);
  },

  async deleteMediaFile(
    fileId: string,
    reason: string,
    userContext: UserContext
  ): Promise<{ success: boolean; message: string; fileId: string }> {
    const res = await fetch(`/api/media/${fileId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ reason }),
    });
    return parseJsonResponse(res);
  },

  async uploadStorageImage(
    fileData: string,
    fileName: string,
    mimeType: string,
    userContext?: UserContext
  ): Promise<{ url: string; path: string; fileName: string; size: number }> {
    const res = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ fileData, fileName, mimeType }),
    });
    return parseJsonResponse(res);
  },

  async deleteStorageImage(
    url: string,
    userContext?: UserContext
  ): Promise<{ success: boolean; deleted: boolean; path: string }> {
    const res = await fetch('/api/storage/delete', {
      method: 'POST',
      headers: getAuthHeaders(userContext),
      body: JSON.stringify({ url }),
    });
    return parseJsonResponse(res);
  },

  async runPhase8Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase8');
    return parseJsonResponse(res);
  },

  async runPhase9Tests(): Promise<any> {
    const res = await fetch('/api/tests/fase9');
    return parseJsonResponse(res);
  },
};

