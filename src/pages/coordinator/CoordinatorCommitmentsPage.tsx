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
} from 'lucide-react';
import { CommitmentModel, Entity, CommitmentStatus, AttentionRoute } from '../../types';
import { api, UserContext } from '../../services/api';

interface CoordinatorCommitmentsPageProps {
  userContext: UserContext;
}

export const CoordinatorCommitmentsPage: React.FC<CoordinatorCommitmentsPageProps> = ({
  userContext,
}) => {
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

  // Form states
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create form
  const [newTopic, setNewTopic] = useState('');
  const [newAgreement, setNewAgreement] = useState('');
  const [newEntityId, setNewEntityId] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [newRouteId, setNewRouteId] = useState('');

  // Edit form
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
    setNewEntityId(entities[0]?.id || 'ent-1');
    setNewResponsible('');
    setNewEmail('');
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setNewDeadline(d.toISOString().split('T')[0]);
    setNewProgress(0);
    setNewRouteId('');
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
    if (!newResponsible.trim()) {
      setFormError('Indique el enlace o funcionario responsable.');
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

      const payload: Partial<CommitmentModel> = {
        topic: newTopic.trim(),
        agreement: newAgreement.trim(),
        entityId: newEntityId,
        entityName: entObj ? entObj.name : 'Entidad',
        routeId: newRouteId || undefined,
        routeName: matchedRoute ? matchedRoute.name : undefined,
        responsiblePerson: newResponsible.trim(),
        institutionalEmail: (newEmail || 'contacto@quibdo.gov.co').trim(),
        commitmentDate: newDeadline,
        progressPercentage: newProgress,
      };

      await api.createCommitment(payload, userContext);
      await loadData();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al crear compromiso.');
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
          progressPercentage: editProgress,
          status: editProgress === 100 ? 'Cumplido' : editStatus,
          comments: editComment.trim() || undefined,
          evidenceName: editEvidenceName.trim() || undefined,
          evidenceUrl: editEvidenceUrl.trim() || undefined,
        },
        userContext
      );
      await loadData();
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al actualizar compromiso.');
    } finally {
      setSaving(false);
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
      const matchTopic = c.topic.toLowerCase().includes(q);
      const matchAg = c.agreement.toLowerCase().includes(q);
      const matchEnt = c.entityName.toLowerCase().includes(q);
      const matchResp = c.responsiblePerson.toLowerCase().includes(q);
      return matchTopic || matchAg || matchEnt || matchResp;
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
    (c) => c.status === 'Vencido' || (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado')
  ).length;
  const supportCount = commitments.filter((c) => c.status === 'Requiere apoyo interinstitucional').length;

  const globalCompliance =
    totalCount > 0 ? Math.round(commitments.reduce((acc, c) => acc + c.progressPercentage, 0) / totalCount) : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <CheckSquare className="w-4 h-4" />
          <span>Módulo de Coordinación General</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Tablero de Cumplimiento de Compromisos Interinstitucionales
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Monitoreo del avance de los acuerdos y metas adquiridas por las 19 secretarías y entidades aliadas para la atención de población migrante en Quibdó.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Pactar Nuevo Compromiso</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 font-medium block">Total Compromisos</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Índice Global de Avance</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{globalCompliance}%</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">En Proceso</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{inProgressCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">Vencidos / Críticos</span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">{expiredCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium block">Requieren Apoyo</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">{supportCount}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por acuerdo, tema, responsable o entidad..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Entity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Entidad:</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              <option value="all">Todas las entidades ({entities.length})</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Cards List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          Cargando compromisos interinstitucionales...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No se encontraron compromisos
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No hay registros que coincidan con los criterios de búsqueda.
          </p>
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
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <Building2 className="w-3.5 h-3.5" />
                        {com.entityName}
                      </span>
                      <span>·</span>
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

                  <button
                    onClick={() => openEditModal(com)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Seguimiento y Ajuste</span>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      Avance Reportado:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {com.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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

                {/* Agreement */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Acuerdo y Meta Pactada
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {com.agreement}
                  </p>
                </div>

                {/* Comments */}
                {com.comments && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-2 border-l-2 border-blue-500">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Última Nota de Seguimiento
                    </span>
                    <p>{com.comments}</p>
                  </div>
                )}

                {/* Evidence link */}
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
                        <span>Ver Soporte</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Enlace: <strong>{com.responsiblePerson}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {com.institutionalEmail}
                    </span>
                  </div>

                  <span className={`flex items-center gap-1 font-semibold ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Fecha Límite: {new Date(com.commitmentDate).toLocaleDateString('es-CO')}
                    {isExpired && ' (VENCIDO)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Pactar Nuevo Compromiso (Coordinador) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Pactar Compromiso Interinstitucional</h3>
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
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Entidad Responsable */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Entidad Responsable del Cumplimiento *
                </label>
                <select
                  value={newEntityId}
                  onChange={(e) => setNewEntityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tema */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tema del Compromiso *
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Ej. Articulación de brigada fluvial de atención médica"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Acuerdo */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Acuerdo y Meta Cuantitativa / Operativa *
                </label>
                <textarea
                  value={newAgreement}
                  onChange={(e) => setNewAgreement(e.target.value)}
                  rows={3}
                  placeholder="Especifique los acuerdos, responsabilidades operativas y cronograma..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Ruta relacionada */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ruta relacionada (Opcional)
                </label>
                <select
                  value={newRouteId}
                  onChange={(e) => setNewRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">(Acuerdo interinstitucional general)</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.entityName})
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
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    placeholder="Nombre del servidor público"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Correo Institucional *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="servidor@quibdo.gov.co"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Fecha Límite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Fecha Límite *
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Avance Inicial ({newProgress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="w-full accent-blue-600"
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{saving ? 'Registrando...' : 'Pactar Compromiso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Seguimiento y Ajuste (Coordinador) */}
      {isEditModalOpen && selectedCommitment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Seguimiento de Coordinación</h3>
                <span className="text-xs text-blue-300 truncate block max-w-xs">{selectedCommitment.topic}</span>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {formError}
                </div>
              )}

              {/* Slider */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    Ajustar Porcentaje de Avance:
                  </label>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
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
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Estado Oficial
                </label>
                <select
                  value={editProgress === 100 ? 'Cumplido' : editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CommitmentStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Cumplido">Cumplido</option>
                  <option value="Requiere apoyo interinstitucional">Requiere apoyo interinstitucional</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Notas de Seguimiento */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Observaciones de la Coordinación en la Mesa Técnica
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="Registrar acuerdos de la reunión o requerimientos de articulación..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : 'Actualizar Estado'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
