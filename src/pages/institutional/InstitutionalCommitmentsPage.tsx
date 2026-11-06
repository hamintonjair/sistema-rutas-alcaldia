import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Edit2,
  Shield,
  Upload,
  Percent,
  X,
  Send,
  Building2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CommitmentModel, AttentionRoute, CommitmentStatus } from '../../types';
import { api, UserContext } from '../../services/api';

interface InstitutionalCommitmentsPageProps {
  userContext: UserContext;
}

export const InstitutionalCommitmentsPage: React.FC<InstitutionalCommitmentsPageProps> = ({
  userContext,
}) => {
  const [commitments, setCommitments] = useState<CommitmentModel[]>([]);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentModel | null>(null);

  // Supabase Sync states
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);

  // Create form fields
  const [topic, setTopic] = useState('');
  const [agreement, setAgreement] = useState('');
  const [routeId, setRouteId] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState(userContext.name);
  const [institutionalEmail, setInstitutionalEmail] = useState('contacto@quibdo.gov.co');
  const [commitmentDate, setCommitmentDate] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [comments, setComments] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  // Update progress modal fields
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<CommitmentStatus>('En proceso');
  const [editComments, setEditComments] = useState('');
  const [editEvidenceName, setEditEvidenceName] = useState('');
  const [editEvidenceUrl, setEditEvidenceUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [comData, routesData] = await Promise.all([
        api.getCommitments({ entityId: userContext.entityId }, userContext),
        api.getRoutes({ entityId: userContext.entityId }),
      ]);
      setCommitments(comData);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error cargando compromisos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  const openCreateModal = () => {
    setTopic('');
    setAgreement('');
    setRouteId(routes[0]?.id || '');
    setResponsiblePerson(userContext.name);
    setInstitutionalEmail('enlace@quibdo.gov.co');
    // Default deadline: 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCommitmentDate(d.toISOString().split('T')[0]);
    setProgressPercentage(0);
    setComments('');
    setEvidenceName('');
    setEvidenceUrl('');
    setFormError(null);
    setPiiWarnings([]);
    setIsCreateModalOpen(true);
  };

  const openUpdateModal = (c: CommitmentModel) => {
    setSelectedCommitment(c);
    setEditProgress(c.progressPercentage);
    setEditStatus(c.status);
    setEditComments('');
    setEditEvidenceName(c.evidenceName || '');
    setEditEvidenceUrl(c.evidenceUrl || '');
    setFormError(null);
    setPiiWarnings([]);
    setIsUpdateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!topic.trim()) {
      setFormError('El tema del compromiso es obligatorio.');
      return;
    }
    if (!agreement.trim()) {
      setFormError('El texto del acuerdo institucional es obligatorio.');
      return;
    }
    if (!responsiblePerson.trim()) {
      setFormError('Indique el nombre del responsable institucional.');
      return;
    }
    if (!commitmentDate) {
      setFormError('Seleccione una fecha de cumplimiento.');
      return;
    }

    setSaving(true);
    try {
      const selectedRoute = routes.find((r) => r.id === routeId);
      const payload: Partial<CommitmentModel> = {
        topic: topic.trim(),
        agreement: agreement.trim(),
        routeId: routeId || undefined,
        routeName: selectedRoute ? selectedRoute.name : undefined,
        entityId: userContext.entityId,
        entityName: userContext.entityName,
        responsiblePerson: responsiblePerson.trim(),
        institutionalEmail: institutionalEmail.trim(),
        commitmentDate,
        progressPercentage,
        comments: comments.trim(),
        evidenceName: evidenceName.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
      };

      const res = await api.createCommitment(payload, userContext);
      if (res.piiWarnings && res.piiWarnings.length > 0) {
        setPiiWarnings(res.piiWarnings);
      }
      await loadData();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el compromiso.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitment) return;

    setSaving(true);
    setFormError(null);
    try {
      const payload: Partial<CommitmentModel> = {
        progressPercentage: editProgress,
        status: editProgress === 100 ? 'Cumplido' : editStatus,
        comments: editComments.trim() || undefined,
        evidenceName: editEvidenceName.trim() || undefined,
        evidenceUrl: editEvidenceUrl.trim() || undefined,
      };

      await api.updateCommitment(selectedCommitment.id, payload, userContext);
      await loadData();
      setIsUpdateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar el avance del compromiso.');
    } finally {
      setSaving(false);
    }
  };

  // Quick action: Complete 100%
  const handleQuickComplete = async (c: CommitmentModel) => {
    try {
      await api.updateCommitment(
        c.id,
        {
          progressPercentage: 100,
          status: 'Cumplido',
          comments: 'Compromiso completado al 100% y certificado en el sistema.',
        },
        userContext
      );
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCommitment = async (c: CommitmentModel) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el compromiso "${c.topic}"? Esta acción borrará el registro de la base de datos.`)) return;
    try {
      setLoading(true);
      await api.deleteCommitment(c.id, userContext);
      setSyncFeedback({
        type: 'success',
        message: `El compromiso "${c.topic}" fue eliminado correctamente de la base de datos.`,
      });
      await loadData();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Error al eliminar el compromiso.',
      });
      setLoading(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingSupabase(true);
    setSyncFeedback(null);
    try {
      const res = await api.syncCommitmentsToSupabase(userContext);
      setSyncFeedback({
        type: 'success',
        message: res.message || 'Compromisos sincronizados correctamente con la base de datos Supabase.',
      });
      await loadData();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'No se pudo sincronizar automáticamente con Supabase.',
      });
    } finally {
      setSyncingSupabase(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getStatusBadge = (c: CommitmentModel) => {
    const isExpired = c.status === 'Vencido' || (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado');

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          Vencido
        </span>
      );
    }

    switch (c.status) {
      case 'Cumplido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Cumplido (100%)
          </span>
        );
      case 'En proceso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <Clock className="w-3 h-3" />
            En proceso ({c.progressPercentage}%)
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'Requiere apoyo interinstitucional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
            <Building2 className="w-3 h-3" />
            Requiere apoyo
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Filter
  const filtered = commitments.filter((c) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'Vencido') {
        const isExp = c.status === 'Vencido' || (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido');
        if (!isExp) return false;
      } else if (c.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTopic = c.topic.toLowerCase().includes(q);
      const matchAg = c.agreement.toLowerCase().includes(q);
      const matchResp = c.responsiblePerson.toLowerCase().includes(q);
      const matchRoute = c.routeName ? c.routeName.toLowerCase().includes(q) : false;
      return matchTopic || matchAg || matchResp || matchRoute;
    }
    return true;
  });

  // Metrics
  const totalCount = commitments.length;
  const fulfilledCount = commitments.filter((c) => c.status === 'Cumplido' || c.progressPercentage === 100).length;
  const inProgressCount = commitments.filter((c) => c.status === 'En proceso' && c.progressPercentage < 100).length;
  const expiredCount = commitments.filter(
    (c) => c.status === 'Vencido' || (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado')
  ).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <CheckSquare className="w-4 h-4" />
          <span>Fase 6 · Tablero de Compromisos y Acuerdos</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Compromisos Institucionales de {userContext.entityName || 'la Entidad'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Registro, seguimiento porcentual y cargue de evidencias para los compromisos operativos, plazos de ventanilla y acuerdos interinstitucionales adquiridos en la Mesa de la Ruta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncSupabase}
              disabled={syncingSupabase}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-700 disabled:opacity-60 shadow-xs"
              title="Sincronizar compromisos y actualizar campo institutional_commitments en la tabla routes de Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{syncingSupabase ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Compromiso Institucional</span>
            </button>
          </div>
        </div>
        <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-medium border-t border-slate-800">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Área Interna Reservada: Los acuerdos y evidencias de avance no son públicos y se reportan al Coordinador de la Ruta.</span>
        </div>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 font-medium block">Total Acuerdos</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">En Proceso de Cumplimiento</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{inProgressCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Cumplidos (100%)</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{fulfilledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">Vencidos / Con Retraso</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">{expiredCount}</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por acuerdo, responsable o tema..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium text-[11px]">Filtrar estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todos los estados</option>
            <option value="En proceso">En proceso</option>
            <option value="Cumplido">Cumplidos</option>
            <option value="Vencido">Vencidos (Alerta)</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Requiere apoyo interinstitucional">Requiere apoyo</option>
          </select>
        </div>
      </div>

      {/* Commitments List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          Cargando compromisos institucionales...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <CheckSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No hay compromisos institucionales registrados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'No hay registros que coincidan con los criterios de búsqueda.'
              : 'Registre aquí los acuerdos y metas acordados por su secretaría para el fortalecimiento de la Ruta.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear primer compromiso</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((com) => {
            const isExpired =
              com.status === 'Vencido' ||
              (com.commitmentDate < todayStr && com.progressPercentage < 100 && com.status !== 'Cumplido' && com.status !== 'Cancelado');

            return (
              <div
                key={com.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all shadow-2xs space-y-4 ${
                  isExpired
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(com)}
                      {com.routeName && (
                        <span className="text-[11px] text-slate-500">
                          Ruta: <strong>{com.routeName}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {com.topic}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {com.progressPercentage < 100 && (
                      <button
                        onClick={() => handleQuickComplete(com)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                        title="Marcar como cumplido al 100%"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Marcar Cumplido</span>
                      </button>
                    )}
                    <button
                      onClick={() => openUpdateModal(com)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Actualizar Avance</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCommitment(com)}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Eliminar este compromiso permanentemente"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      Porcentaje de Cumplimiento:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {com.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        com.progressPercentage === 100
                          ? 'bg-emerald-500'
                          : isExpired
                          ? 'bg-rose-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${com.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Agreement Description */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Acuerdo y Meta Institucional
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {com.agreement}
                  </p>
                </div>

                {/* Comments / Bitácora if present */}
                {com.comments && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-2 border-l-2 border-emerald-500">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Bitácora de Seguimiento
                    </span>
                    <p>{com.comments}</p>
                  </div>
                )}

                {/* Evidence Attachment if present */}
                {com.evidenceName && (
                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 flex items-center justify-between gap-3 text-xs border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        Soporte/Evidencia: {com.evidenceName}
                      </span>
                    </div>
                    {com.evidenceUrl && (
                      <a
                        href={com.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold shrink-0 flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver Documento</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Responsable: <strong>{com.responsiblePerson}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {com.institutionalEmail}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 font-semibold ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha Límite: {new Date(com.commitmentDate).toLocaleDateString('es-CO')}
                      {isExpired && ' (VENCIDO)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Compromiso */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Nuevo Compromiso Institucional</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tema */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tema del Compromiso *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej. Jornada descentralizada de caracterización y registro"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Acuerdo */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Acuerdo Institucional Concreto *
                </label>
                <textarea
                  value={agreement}
                  onChange={(e) => setAgreement(e.target.value)}
                  rows={3}
                  placeholder="Describa el acuerdo, metas cuantitativas, plazos y recursos comprometidos..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Ruta Relacionada */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ruta relacionada (Opcional)
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">(Compromiso transversal general de la entidad)</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsable & Correo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Responsable o Enlace *
                  </label>
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    placeholder="Nombre y cargo del enlace"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Correo Institucional Oficial *
                  </label>
                  <input
                    type="email"
                    value={institutionalEmail}
                    onChange={(e) => setInstitutionalEmail(e.target.value)}
                    placeholder="enlace@quibdo.gov.co"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Fecha Límite & Avance Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Fecha Límite de Cumplimiento *
                  </label>
                  <input
                    type="date"
                    value={commitmentDate}
                    onChange={(e) => setCommitmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Avance Inicial ({progressPercentage}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Evidencia Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nombre del Soporte o Acta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={evidenceName}
                    onChange={(e) => setEvidenceName(e.target.value)}
                    placeholder="Ej. Acta de Concertación N° 05-2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Enlace / URL de la Evidencia (Opcional)
                  </label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://quibdo.gov.co/docs/acta.pdf"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{saving ? 'Registrando...' : 'Registrar Compromiso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Actualizar Avance y Evidencia */}
      {isUpdateModalOpen && selectedCommitment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Actualizar Avance y Evidencia</h3>
                <p className="text-xs text-slate-400 truncate max-w-sm">{selectedCommitment.topic}</p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Slider de porcentaje */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Porcentaje de Avance Actual:
                  </label>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {editProgress}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0% (Sin iniciar)</span>
                  <span>50% (En desarrollo)</span>
                  <span>100% (Cumplido)</span>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Estado del Compromiso
                </label>
                <select
                  value={editProgress === 100 ? 'Cumplido' : editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CommitmentStatus)}
                  disabled={editProgress === 100}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Cumplido">Cumplido</option>
                  <option value="Requiere apoyo interinstitucional">Requiere apoyo interinstitucional</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                {editProgress === 100 && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Al llegar al 100% el estado se cataloga automáticamente como "Cumplido".
                  </p>
                )}
              </div>

              {/* Bitácora / Comentario */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Notas de Avance / Comentarios de Seguimiento
                </label>
                <textarea
                  value={editComments}
                  onChange={(e) => setEditComments(e.target.value)}
                  rows={2}
                  placeholder="Detalle de actividades realizadas en este periodo..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Evidencia */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Soporte / Evidencia Institucional</span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600 dark:text-slate-400">
                    Nombre o Radicado del Documento Soporte
                  </label>
                  <input
                    type="text"
                    value={editEvidenceName}
                    onChange={(e) => setEditEvidenceName(e.target.value)}
                    placeholder="Ej. Acta de Entrega N° 12 o Circular Externa 03"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600 dark:text-slate-400">
                    Enlace / URL de Descarga del Documento
                  </label>
                  <input
                    type="url"
                    value={editEvidenceUrl}
                    onChange={(e) => setEditEvidenceUrl(e.target.value)}
                    placeholder="https://quibdo.gov.co/documentos/soporte.pdf"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : 'Guardar Actualización'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
