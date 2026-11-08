import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Edit2,
  Percent,
  FileText,
  X,
  Send,
  Shield,
  TrendingUp,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CommitmentModel, Entity, CommitmentStatus, AttentionRoute } from '../../types';
import { api, UserContext } from '../../services/api';

interface AdminCommitmentsPageProps {
  userContext: UserContext;
}

export const AdminCommitmentsPage: React.FC<AdminCommitmentsPageProps> = ({ userContext }) => {
  const [commitments, setCommitments] = useState<CommitmentModel[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentModel | null>(null);
  const [commitmentToDelete, setCommitmentToDelete] = useState<CommitmentModel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Supabase Sync states
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create form fields
  const [newTopic, setNewTopic] = useState('');
  const [newAgreement, setNewAgreement] = useState('');
  const [newEntityId, setNewEntityId] = useState('');
  const [newEntityName, setNewEntityName] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [newRouteId, setNewRouteId] = useState('');
  const [newComments, setNewComments] = useState('');
  const [newEvidenceName, setNewEvidenceName] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');

  // Edit form fields
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<CommitmentStatus>('En proceso');
  const [editComment, setEditComment] = useState('');
  const [editEvidenceName, setEditEvidenceName] = useState('');
  const [editEvidenceUrl, setEditEvidenceUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [comData, entData, routesData] = await Promise.all([
        api.getCommitments(undefined, userContext),
        api.getEntities(),
        api.getRoutes(),
      ]);
      setCommitments(comData);
      setEntities(entData);
      setRoutes(routesData);
      if (entData.length > 0 && !newEntityId) {
        setNewEntityId(entData[0].id);
      }
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
    setNewTopic('');
    setNewAgreement('');
    const initialEnt = (selectedEntityId !== 'all' ? entities.find((e) => e.id === selectedEntityId) : entities[0]) || entities[0];
    setNewEntityId(initialEnt?.id || '');
    setNewEntityName(initialEnt?.name || '');
    setNewResponsible('');
    setNewEmail('contacto@quibdo.gov.co');
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setNewDeadline(d.toISOString().split('T')[0]);
    setNewProgress(0);
    setNewRouteId('');
    setNewComments('');
    setNewEvidenceName('');
    setNewEvidenceUrl('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c: CommitmentModel) => {
    setSelectedCommitment(c);
    setEditProgress(c.progressPercentage);
    setEditStatus(c.status);
    setEditComment('');
    setEditEvidenceName(c.evidenceName || '');
    setEditEvidenceUrl(c.evidenceUrl || '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTopic.trim()) {
      setFormError('El tema del compromiso es obligatorio.');
      return;
    }
    if (!newAgreement.trim()) {
      setFormError('El acuerdo o meta pactada es obligatorio.');
      return;
    }
    if (!newEntityId) {
      setFormError('Seleccione la entidad responsable del compromiso.');
      return;
    }
    if (!newResponsible.trim()) {
      setFormError('Indique el funcionario o enlace responsable.');
      return;
    }
    if (!newDeadline) {
      setFormError('Indique la fecha límite de cumplimiento.');
      return;
    }

    setSaving(true);
    try {
      const entObj = entities.find((e) => e.id === newEntityId);
      const matchedRoute = newRouteId ? routes.find((r) => r.id === newRouteId) : undefined;
      const finalEntityName = (newEntityName || entObj?.name || matchedRoute?.entityName || 'SISBEN').trim();

      const payload: Partial<CommitmentModel> = {
        topic: newTopic.trim(),
        agreement: newAgreement.trim(),
        entityId: newEntityId,
        entityName: finalEntityName,
        routeId: newRouteId || undefined,
        routeName: matchedRoute ? matchedRoute.name : undefined,
        responsiblePerson: newResponsible.trim(),
        institutionalEmail: (newEmail || 'contacto@quibdo.gov.co').trim(),
        commitmentDate: newDeadline,
        progressPercentage: Number(newProgress) || 0,
        comments: newComments.trim() || undefined,
        evidenceName: newEvidenceName.trim() || undefined,
        evidenceUrl: newEvidenceUrl.trim() || undefined,
      };

      await api.createCommitment(payload, userContext);
      await loadData();
      setIsCreateModalOpen(false);
      setSyncFeedback({
        type: 'success',
        message: 'Compromiso registrado exitosamente en el sistema.',
      });
    } catch (err: any) {
      setFormError(err.message || 'Error al crear el compromiso.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitment) return;

    setSaving(true);
    setFormError(null);
    try {
      await api.updateCommitment(
        selectedCommitment.id,
        {
          progressPercentage: Number(editProgress),
          status: Number(editProgress) === 100 ? 'Cumplido' : editStatus,
          comments: editComment.trim() || undefined,
          evidenceName: editEvidenceName.trim() || undefined,
          evidenceUrl: editEvidenceUrl.trim() || undefined,
        },
        userContext
      );
      await loadData();
      setIsEditModalOpen(false);
      setSyncFeedback({
        type: 'success',
        message: `Compromiso "${selectedCommitment.topic}" actualizado con éxito.`,
      });
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar compromiso.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickComplete = async (c: CommitmentModel) => {
    try {
      await api.updateCommitment(
        c.id,
        {
          progressPercentage: 100,
          status: 'Cumplido',
          comments: 'Compromiso marcado al 100% de cumplimiento por la Administración Central.',
        },
        userContext
      );
      await loadData();
      setSyncFeedback({
        type: 'success',
        message: `Compromiso "${c.topic}" marcado como Cumplido (100%).`,
      });
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Error al actualizar estado del compromiso.',
      });
    }
  };

  const confirmDelete = async () => {
    if (!commitmentToDelete) return;
    setDeleting(true);
    try {
      await api.deleteCommitment(commitmentToDelete.id, userContext);
      setSyncFeedback({
        type: 'success',
        message: `El compromiso "${commitmentToDelete.topic}" fue eliminado correctamente del sistema.`,
      });
      setCommitmentToDelete(null);
      await loadData();
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Error al eliminar el compromiso.',
      });
    } finally {
      setDeleting(false);
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

  const filtered = commitments.filter((c) => {
    if (selectedEntityId !== 'all' && c.entityId !== selectedEntityId) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'Vencido') {
        const isExp =
          c.status === 'Vencido' ||
          (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido');
        if (!isExp) return false;
      } else if (c.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTopic = (c.topic || '').toLowerCase().includes(q);
      const matchAg = (c.agreement || '').toLowerCase().includes(q);
      const matchEnt = (c.entityName || '').toLowerCase().includes(q);
      const matchResp = (c.responsiblePerson || '').toLowerCase().includes(q);
      const matchRoute = c.routeName ? c.routeName.toLowerCase().includes(q) : false;
      return matchTopic || matchAg || matchEnt || matchResp || matchRoute;
    }
    return true;
  });

  const getStatusBadge = (c: CommitmentModel) => {
    const isExpired =
      c.status === 'Vencido' ||
      (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado');

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

  // Metrics
  const totalCount = commitments.length;
  const fulfilledCount = commitments.filter((c) => c.status === 'Cumplido' || c.progressPercentage === 100).length;
  const inProgressCount = commitments.filter((c) => c.status === 'En proceso' && c.progressPercentage < 100).length;
  const expiredCount = commitments.filter(
    (c) =>
      c.status === 'Vencido' ||
      (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado')
  ).length;
  const supportCount = commitments.filter((c) => c.status === 'Requiere apoyo interinstitucional').length;

  const globalCompliance = totalCount > 0
    ? Math.round(commitments.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / totalCount)
    : 0;

  // Filter routes according to selected entity in modal
  const availableRoutesForModal = newEntityId
    ? routes.filter((r) => r.entityId === newEntityId)
    : routes;

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckSquare className="w-32 h-32 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMINISTRACIÓN CENTRAL · CONTROL DE COMPROMISOS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Gestión y Registro de Compromisos Interinstitucionales
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Módulo administrativo para registrar nuevos acuerdos y compromisos operativos por entidad, monitorear el avance porcentual, cargar bitácoras técnicas y gestionar el cumplimiento interinstitucional de Quibdó.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncSupabase}
              disabled={syncingSupabase}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-700 disabled:opacity-60 shadow-sm"
              title="Sincronizar compromisos con base de datos"
            >
              <RefreshCw className={`w-4 h-4 ${syncingSupabase ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>{syncingSupabase ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
            </button>

            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Compromiso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Feedback Message */}
      {syncFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            syncFeedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{syncFeedback.message}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Total Compromisos</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">Cumplimiento Global</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{globalCompliance}%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider block">En Proceso</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">Cumplidos (100%)</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{fulfilledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block">Vencidos / Alerta</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">{expiredCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por acuerdo, tema, responsable, proceso o entidad..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Entity Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Entidad:</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="all" className="bg-white dark:bg-slate-900">Todas las entidades ({entities.length})</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id} className="bg-white dark:bg-slate-900">
                  {ent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-900">Todos los estados</option>
              <option value="En proceso" className="bg-white dark:bg-slate-900">En proceso</option>
              <option value="Cumplido" className="bg-white dark:bg-slate-900">Cumplidos</option>
              <option value="Vencido" className="bg-white dark:bg-slate-900">Vencidos (Alerta)</option>
              <option value="Pendiente" className="bg-white dark:bg-slate-900">Pendientes</option>
              <option value="Requiere apoyo interinstitucional" className="bg-white dark:bg-slate-900">Requiere apoyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commitments List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Cargando compromisos interinstitucionales...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No se encontraron compromisos
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || statusFilter !== 'all' || selectedEntityId !== 'all'
                ? 'No hay registros que coincidan con los filtros seleccionados.'
                : 'Aún no se han registrado compromisos interinstitucionales en la plataforma.'}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pactar primer compromiso</span>
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
                className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border transition-all shadow-sm space-y-4 ${
                  isExpired
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {com.entityName}
                      </span>
                      {getStatusBadge(com)}
                      {com.routeName && (
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          Proceso: <strong className="text-slate-700 dark:text-slate-300">{com.routeName}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {com.topic}
                    </h3>
                  </div>

                  {/* Actions for Admin */}
                  <div className="flex flex-wrap items-center gap-2">
                    {com.progressPercentage < 100 && (
                      <button
                        onClick={() => handleQuickComplete(com)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs"
                        title="Marcar este compromiso como cumplido al 100%"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Marcar Cumplido</span>
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(com)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Actualizar Avance / Estado</span>
                    </button>
                    <button
                      onClick={() => setCommitmentToDelete(com)}
                      className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                      title="Eliminar este compromiso permanentemente"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      Avance de Cumplimiento:
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {com.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        com.progressPercentage === 100
                          ? 'bg-emerald-500'
                          : isExpired
                          ? 'bg-rose-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${com.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Agreement & Details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acuerdo / Meta Pactada</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {com.agreement}
                  </p>
                </div>

                {/* Footer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate"><strong>Responsable:</strong> {com.responsiblePerson || 'Sin asignar'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate font-mono text-[11px]">{com.institutionalEmail || 'contacto@quibdo.gov.co'}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className={`font-semibold ${isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                      Límite: {new Date(com.commitmentDate).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Additional Notes or Evidences if present */}
                {(com.comments || com.evidenceUrl || com.evidenceName) && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800/60">
                    {com.comments && (
                      <span className="text-[11px] text-slate-500 italic max-w-xl truncate">
                        <strong>Última nota:</strong> {com.comments}
                      </span>
                    )}
                    {(com.evidenceUrl || com.evidenceName) && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Evidencia:</span>
                        {com.evidenceUrl ? (
                          <a
                            href={com.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>{com.evidenceName || 'Ver soporte'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">{com.evidenceName}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Registrar Nuevo Compromiso (Admin) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Registrar Compromiso Institucional</h3>
                <span className="text-xs text-emerald-400 font-semibold">Formulación administrativa para seguimiento y control</span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 sm:p-8 space-y-5 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Entity Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Entidad Responsable *</span>
                </label>
                <select
                  value={newEntityId}
                  onChange={(e) => {
                    const chosen = entities.find((ent) => ent.id === e.target.value);
                    setNewEntityId(e.target.value);
                    setNewEntityName(chosen ? chosen.name : '');
                    setNewRouteId('');
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} {ent.sigla ? `(${ent.sigla})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Associated Route */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Proceso o Servicio Institucional Asociado (Opcional)
                </label>
                <select
                  value={newRouteId}
                  onChange={(e) => setNewRouteId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Sin proceso específico / Compromiso General --</option>
                  {availableRoutesForModal.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.serviceName || r.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Tema del Compromiso *
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Ej: Adecuación de ventanilla preferencial, integración de datos SISBEN..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                </input>
              </div>

              {/* Agreement */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Acuerdo o Meta Operativa Pactada *
                </label>
                <textarea
                  value={newAgreement}
                  onChange={(e) => setNewAgreement(e.target.value)}
                  rows={3}
                  placeholder="Describa con claridad las acciones técnicas, metas de tiempo o compromisos específicos que debe cumplir la entidad..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Responsible Person & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Funcionario / Enlace Responsable *
                  </label>
                  <input
                    type="text"
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    placeholder="Nombre completo del servidor"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="enlace@entidad.gov.co"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Deadline & Initial Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Fecha Límite de Cumplimiento *
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Avance Inicial (%):</span>
                    <span className="font-bold font-mono text-emerald-600">{newProgress}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full accent-emerald-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Initial Observations */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Observaciones Técnicas Iniciales
                </label>
                <textarea
                  value={newComments}
                  onChange={(e) => setNewComments(e.target.value)}
                  rows={2}
                  placeholder="Detalles complementarios acordados en la mesa interinstitucional..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Evidences (optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nombre del Documento / Soporte
                  </label>
                  <input
                    type="text"
                    value={newEvidenceName}
                    onChange={(e) => setNewEvidenceName(e.target.value)}
                    placeholder="Ej: Acta_001_Mesa_Acuerdos.pdf"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    URL o Enlace de la Evidencia
                  </label>
                  <input
                    type="url"
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Pactar y Guardar Compromiso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Actualizar Avance y Estado (Admin) */}
      {isEditModalOpen && selectedCommitment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Actualizar Avance de Compromiso</h3>
                <span className="text-xs text-emerald-400 font-semibold truncate block max-w-md">
                  {selectedCommitment.topic}
                </span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 sm:p-8 space-y-5 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Entity info badge */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 dark:text-white">{selectedCommitment.entityName}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Límite: {new Date(selectedCommitment.commitmentDate).toLocaleDateString('es-CO')}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>Porcentaje de Avance Reportado:</span>
                  </label>
                  <span className="font-extrabold text-base text-emerald-600 font-mono">
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
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Inicio)</span>
                  <span>50% (En desarrollo)</span>
                  <span>100% (Cumplido)</span>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Estado Oficial del Compromiso
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CommitmentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="En proceso">En proceso</option>
                  <option value="Cumplido">Cumplido (100%)</option>
                  <option value="Pendiente">Pendiente de inicio</option>
                  <option value="Requiere apoyo interinstitucional">Requiere apoyo interinstitucional</option>
                  <option value="Vencido">Vencido / En Mora</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Comments / Technical Observations */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Observaciones Técnicas y Bitácora de Avance
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="Detalle el resultado del seguimiento, hitos alcanzados o dificultades reportadas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Evidences */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Soporte y Evidencias de Avance</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">Nombre de la Evidencia</label>
                    <input
                      type="text"
                      value={editEvidenceName}
                      onChange={(e) => setEditEvidenceName(e.target.value)}
                      placeholder="Ej: Acta_Cierre_Compromiso.pdf"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 font-medium">URL o Enlace de Consulta</label>
                    <input
                      type="url"
                      value={editEvidenceUrl}
                      onChange={(e) => setEditEvidenceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Ajustes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación */}
      {commitmentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/50 shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                ¿Eliminar este compromiso?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Está a punto de remover permanentemente el compromiso:{' '}
                <strong className="text-slate-800 dark:text-slate-200 block my-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-left">
                  "{commitmentToDelete.topic}"
                </strong>
                de la entidad{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {commitmentToDelete.entityName}
                </span>. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setCommitmentToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
