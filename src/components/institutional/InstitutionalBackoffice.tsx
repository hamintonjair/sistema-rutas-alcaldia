import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Users,
  Shield,
  Download,
  Calendar,
  MessageSquare,
  Edit2,
  Send,
  ArrowRight,
  Eye,
  Filter,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { AttentionRoute, Entity, RouteState, SystemConfig, User } from '../../types';
import { api, UserContext } from '../../services/api';
import { RouteStatusBadge } from '../common/RouteStatusBadge';
import { RouteFormModal } from './RouteFormModal';
import { EntitiesManager } from './EntitiesManager';
import { UsersManager } from './UsersManager';
import { AuditLogViewer } from './AuditLogViewer';
import { DateSettingsPanel } from './DateSettingsPanel';
import { CommitmentsView } from './CommitmentsView';
import { ReportsExportPanel } from './ReportsExportPanel';
import { PIIWarningBanner } from '../common/PIIWarningBanner';

interface InstitutionalBackofficeProps {
  userContext: UserContext;
  config: SystemConfig;
  onRefreshConfig: () => void;
}

export const InstitutionalBackoffice: React.FC<InstitutionalBackofficeProps> = ({
  userContext,
  config,
  onRefreshConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    'routes' | 'coordination' | 'entities' | 'users' | 'commitments' | 'reports' | 'audit' | 'dates'
  >('routes');

  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<AttentionRoute | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState(
    userContext.role === 'institutional' ? userContext.entityId || '' : ''
  );
  const [selectedStatus, setSelectedStatus] = useState('');

  // Coordination Review State
  const [reviewRouteId, setReviewRouteId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<RouteState>('Aprobada');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fetchedRoutes, fetchedEntities, fetchedUsers] = await Promise.all([
        api.getRoutes(),
        api.getEntities(),
        api.getUsers(userContext),
      ]);
      setRoutes(fetchedRoutes);
      setEntities(fetchedEntities);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userContext]);

  // Tenant Isolation logic for institutional users:
  // If role === 'institutional', user can only see routes belonging to their entity
  const visibleRoutes = routes.filter((r) => {
    if (userContext.role === 'institutional' && userContext.entityId) {
      if (r.entityId !== userContext.entityId) return false;
    }
    if (selectedEntityId && r.entityId !== selectedEntityId) return false;
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        r.serviceName.toLowerCase().includes(term) ||
        r.entityName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Coordination tab needs routes in 'Enviada a revisión' or 'En revisión' or 'Devuelta para ajustes'
  const pendingReviewRoutes = routes.filter(
    (r) =>
      r.status === 'Enviada a revisión' ||
      r.status === 'En revisión' ||
      r.status === 'Devuelta para ajustes' ||
      r.status === 'Aprobada'
  );

  // Metrics
  const totalCount = visibleRoutes.length;
  const publishedCount = visibleRoutes.filter((r) => r.status === 'Publicada').length;
  const approvedCount = visibleRoutes.filter((r) => r.status === 'Aprobada').length;
  const reviewCount = visibleRoutes.filter((r) => r.status === 'En revisión' || r.status === 'Enviada a revisión').length;
  const returnedCount = visibleRoutes.filter((r) => r.status === 'Devuelta para ajustes').length;

  const handleCreateNew = () => {
    setEditingRoute(null);
    setShowRouteModal(true);
  };

  const handleEditRoute = (r: AttentionRoute) => {
    setEditingRoute(r);
    setShowRouteModal(true);
  };

  const [actionError, setActionError] = useState<string | null>(null);

  const handleCoordinationStatusChange = async (routeId: string, newStatus: RouteState) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await api.changeRouteStatus(routeId, newStatus, reviewComment, userContext);
      setReviewRouteId(null);
      setReviewComment('');
      loadAllData();
    } catch (err: any) {
      setActionError(err.message || 'Error al cambiar estado.');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Backoffice Header */}
      <section className="bg-slate-900 text-white pt-8 pb-6 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" />
                <span>Área Privada Institucional • {userContext.role === 'admin' ? 'Administrador' : userContext.role === 'coordinator' ? 'Coordinador' : 'Usuario Institucional'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Gestión de la Ruta Estratégica Migrante de Quibdó
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {userContext.entityName ? `Entidad: ${userContext.entityName}` : 'Panel de Administración y Coordinación de la Alcaldía de Quibdó'}
              </p>
            </div>

            {(userContext.role === 'admin' || userContext.role === 'institutional') && (
              <button
                onClick={handleCreateNew}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nueva Ruta</span>
              </button>
            )}
          </div>

          {/* Metrics KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
              <span className="text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">Total Rutas</span>
              <div className="text-xl font-bold text-white">{totalCount}</div>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 space-y-1">
              <span className="text-emerald-400 text-[10px] block font-semibold uppercase tracking-wider">Publicadas</span>
              <div className="text-xl font-bold text-emerald-300">{publishedCount}</div>
            </div>
            <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800/60 space-y-1">
              <span className="text-blue-400 text-[10px] block font-semibold uppercase tracking-wider">Aprobadas</span>
              <div className="text-xl font-bold text-blue-300">{approvedCount}</div>
            </div>
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60 space-y-1">
              <span className="text-amber-400 text-[10px] block font-semibold uppercase tracking-wider">En Revisión</span>
              <div className="text-xl font-bold text-amber-300">{reviewCount}</div>
            </div>
            <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/60 space-y-1">
              <span className="text-rose-400 text-[10px] block font-semibold uppercase tracking-wider">Devueltas</span>
              <div className="text-xl font-bold text-rose-300">{returnedCount}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Backoffice Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <PIIWarningBanner />

        {/* Tab Navigation Ribbon */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 flex flex-wrap items-center gap-1 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gestión de Rutas ({routes.length})</span>
          </button>

          {(userContext.role === 'admin' || userContext.role === 'coordinator') && (
            <button
              onClick={() => setActiveTab('coordination')}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'coordination'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Panel de Coordinación</span>
            </button>
          )}

          {userContext.role === 'admin' && (
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'entities'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Entidades (19)</span>
            </button>
          )}

          {userContext.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'commitments'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Compromisos Registrados</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reportes & Exportaciones</span>
          </button>

          {(userContext.role === 'admin' || userContext.role === 'coordinator') && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Auditoría de Acciones</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('dates')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dates'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Fechas & Plazos</span>
          </button>
        </div>

        {/* TAB 1: ROUTES MANAGEMENT */}
        {activeTab === 'routes' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, servicio o entidad..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                {userContext.role !== 'institutional' && (
                  <select
                    value={selectedEntityId}
                    onChange={(e) => setSelectedEntityId(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Todas las Entidades (19)</option>
                    {entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todos los Estados</option>
                  <option value="Borrador">Borrador</option>
                  <option value="Enviada a revisión">Enviada a revisión</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Devuelta para ajustes">Devuelta para ajustes</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Publicada">Publicada</option>
                </select>

                <button
                  onClick={loadAllData}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Routes Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Ruta de Atención</th>
                      <th className="p-3">Servicio</th>
                      <th className="p-3">Entidad Responsable</th>
                      <th className="p-3">Pasos</th>
                      <th className="p-3">Última Modificación</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {visibleRoutes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No hay rutas registradas con estos filtros.
                        </td>
                      </tr>
                    ) : (
                      visibleRoutes.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3">
                            <RouteStatusBadge status={r.status} />
                          </td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                            {r.name}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{r.serviceName}</td>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{r.entityName}</td>
                          <td className="p-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                            {r.procedureSteps?.length || 0}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {new Date(r.updatedAt).toLocaleDateString('es-CO')}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditRoute(r)}
                              className="px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COORDINATION & APPROVAL PANEL */}
        {activeTab === 'coordination' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Panel de Revisión y Validación del Coordinador de la Ruta</span>
              </h3>
              <p className="text-xs text-slate-300">
                Solo el Coordinador de la Ruta o el Administrador General pueden aprobar y publicar rutas. Las entidades no tienen permisos de publicación directa.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pendingReviewRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <RouteStatusBadge status={route.status} />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{route.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">Entidad: <strong>{route.entityName}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {route.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/60">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Población:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{route.targetPopulation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Canal:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{route.channel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Pasos / Requisitos:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{route.procedureSteps?.length || 0} pasos • {route.requirements?.length || 0} reqs</span>
                    </div>
                  </div>

                  {/* Previous Review Comments */}
                  {route.reviewComments && route.reviewComments.length > 0 && (
                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/60 dark:border-amber-800/60 text-xs space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                        Observaciones Anteriores del Coordinador:
                      </span>
                      {route.reviewComments.map((com) => (
                        <div key={com.id} className="text-slate-700 dark:text-slate-300">
                          <strong>{com.userName}:</strong> "{com.comment}" <span className="text-[10px] text-slate-400">({new Date(com.date).toLocaleDateString('es-CO')})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions for Coordinator */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="text-xs text-slate-600 dark:text-slate-300 font-medium hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspeccionar Contenido Completo</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReviewRouteId(route.id);
                          setReviewAction('Devuelta para ajustes');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
                      >
                        Devolver para Ajustes
                      </button>

                      <button
                        onClick={() => {
                          setReviewRouteId(route.id);
                          setReviewAction('Aprobada');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                      >
                        Aprobar Ruta
                      </button>

                      <button
                        onClick={() => {
                          setReviewRouteId(route.id);
                          setReviewAction('Publicada');
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition-colors"
                      >
                        Aprobar y Publicar
                      </button>
                    </div>
                  </div>

                  {/* Comment Box Modal Drawer */}
                  {reviewRouteId === route.id && (
                    <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 mt-3">
                      <h4 className="font-bold text-xs text-emerald-400">
                        Confirmar Acción: Cambio a estado "{reviewAction}"
                      </h4>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">
                          Observación o Comentario Institucional para la Entidad:
                        </label>
                        <textarea
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Ingrese las recomendaciones técnicas o la justificación de aprobación..."
                          className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReviewRouteId(null)}
                          className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md"
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCoordinationStatusChange(route.id, reviewAction)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md shadow-sm"
                        >
                          {actionLoading ? 'Procesando...' : 'Confirmar Estado'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ENTITIES MANAGEMENT */}
        {activeTab === 'entities' && userContext.role === 'admin' && (
          <EntitiesManager entities={entities} userContext={userContext} onRefresh={loadAllData} />
        )}

        {/* TAB 4: USERS MANAGEMENT */}
        {activeTab === 'users' && userContext.role === 'admin' && (
          <UsersManager users={users} entities={entities} userContext={userContext} onRefresh={loadAllData} />
        )}

        {/* TAB 5: COMMITMENTS VIEW */}
        {activeTab === 'commitments' && <CommitmentsView routes={routes} />}

        {/* TAB 6: REPORTS & EXPORTS */}
        {activeTab === 'reports' && <ReportsExportPanel routes={routes} config={config} userContext={userContext} />}

        {/* TAB 7: AUDIT LOGS */}
        {activeTab === 'audit' && (userContext.role === 'admin' || userContext.role === 'coordinator') && (
          <AuditLogViewer userContext={userContext} />
        )}

        {/* TAB 8: DATE SETTINGS */}
        {activeTab === 'dates' && (
          <DateSettingsPanel config={config} userContext={userContext} onRefreshConfig={onRefreshConfig} />
        )}
      </main>

      {/* Route Form Modal */}
      {showRouteModal && (
        <RouteFormModal
          route={editingRoute}
          entities={entities}
          config={config}
          userContext={userContext}
          onClose={() => setShowRouteModal(false)}
          onSaveSuccess={loadAllData}
        />
      )}
    </div>
  );
};
