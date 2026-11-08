import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Edit2,
  Check,
  Shield,
  Send,
  X,
} from 'lucide-react';
import { ObservationModel, AttentionRoute, ObservationPriority, ObservationStatus } from '../../types';
import { api, UserContext } from '../../services/api';

interface InstitutionalObservationsPageProps {
  userContext: UserContext;
}

export const InstitutionalObservationsPage: React.FC<InstitutionalObservationsPageProps> = ({
  userContext,
}) => {
  const [observations, setObservations] = useState<ObservationModel[]>([]);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObs, setEditingObs] = useState<ObservationModel | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [routeId, setRouteId] = useState('');
  const [topic, setTopic] = useState('');
  const [currentProposal, setCurrentProposal] = useState('');
  const [whatToReview, setWhatToReview] = useState('');
  const [entityObservation, setEntityObservation] = useState('');
  const [adjustmentProposal, setAdjustmentProposal] = useState('');
  const [priority, setPriority] = useState<ObservationPriority>('Media');
  const [responsible, setResponsible] = useState(userContext.name);

  const loadData = async () => {
    setLoading(true);
    try {
      const [obsData, routesData] = await Promise.all([
        api.getObservations({ entityId: userContext.entityId }, userContext),
        api.getRoutes({ entityId: userContext.entityId }),
      ]);
      setObservations(obsData);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error cargando observaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  const openCreateModal = () => {
    setEditingObs(null);
    setRouteId(routes[0]?.id || '');
    setTopic('');
    setCurrentProposal('');
    setWhatToReview('');
    setEntityObservation('');
    setAdjustmentProposal('');
    setPriority('Media');
    setResponsible(userContext.name);
    setFormError(null);
    setPiiWarnings([]);
    setIsModalOpen(true);
  };

  const openEditModal = (obs: ObservationModel) => {
    setEditingObs(obs);
    setRouteId(obs.routeId || '');
    setTopic(obs.topic);
    setCurrentProposal(obs.currentProposal || '');
    setWhatToReview(obs.whatToReview);
    setEntityObservation(obs.entityObservation || '');
    setAdjustmentProposal(obs.adjustmentProposal);
    setPriority(obs.priority);
    setResponsible(obs.responsible);
    setFormError(null);
    setPiiWarnings([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPiiWarnings([]);

    if (!topic.trim()) {
      setFormError('El tema de la observación es obligatorio.');
      return;
    }
    if (!whatToReview.trim()) {
      setFormError('Especifique qué aspecto de la ruta conviene revisar.');
      return;
    }
    if (!adjustmentProposal.trim()) {
      setFormError('La propuesta técnica de ajuste es obligatoria.');
      return;
    }

    setSaving(true);
    try {
      const selectedRoute = routes.find((r) => r.id === routeId);
      const payload: Partial<ObservationModel> = {
        routeId,
        routeName: selectedRoute ? selectedRoute.name : 'Ruta sin asociar',
        topic: topic.trim(),
        currentProposal: currentProposal.trim(),
        whatToReview: whatToReview.trim(),
        entityObservation: entityObservation.trim(),
        adjustmentProposal: adjustmentProposal.trim(),
        priority,
        responsible: responsible.trim() || userContext.name,
        entityId: userContext.entityId,
        entityName: userContext.entityName,
      };

      if (editingObs) {
        const res = await api.updateObservation(editingObs.id, payload, userContext);
        if (res.piiWarnings && res.piiWarnings.length > 0) {
          setPiiWarnings(res.piiWarnings);
        }
      } else {
        const res = await api.createObservation(payload, userContext);
        if (res.piiWarnings && res.piiWarnings.length > 0) {
          setPiiWarnings(res.piiWarnings);
        }
      }

      await loadData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar la observación.');
    } finally {
      setSaving(false);
    }
  };

  // Filter observations
  const filtered = observations.filter((obs) => {
    if (priorityFilter !== 'all' && obs.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && obs.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTopic = obs.topic.toLowerCase().includes(q);
      const matchRoute = obs.routeName.toLowerCase().includes(q);
      const matchWhat = obs.whatToReview.toLowerCase().includes(q);
      const matchProp = obs.adjustmentProposal.toLowerCase().includes(q);
      return matchTopic || matchRoute || matchWhat || matchProp;
    }
    return true;
  });

  const getStatusBadge = (status: ObservationStatus) => {
    switch (status) {
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'En revisión':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <Clock className="w-3 h-3" />
            En revisión
          </span>
        );
      case 'Requiere aclaración':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
            <AlertTriangle className="w-3 h-3" />
            Requiere aclaración
          </span>
        );
      case 'Aceptada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Aceptada
          </span>
        );
      case 'Rechazada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
            <XCircle className="w-3 h-3" />
            Rechazada
          </span>
        );
      case 'Cerrada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Check className="w-3 h-3" />
            Cerrada
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: ObservationPriority) => {
    switch (priority) {
      case 'Alta':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
            Prioridad Alta
          </span>
        );
      case 'Media':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
            Prioridad Media
          </span>
        );
      case 'Baja':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            Prioridad Baja
          </span>
        );
    }
  };

  // Metrics
  const totalObs = observations.length;
  const pendingObs = observations.filter((o) => o.status === 'Pendiente' || o.status === 'En revisión').length;
  const acceptedObs = observations.filter((o) => o.status === 'Aceptada').length;
  const clarificationObs = observations.filter((o) => o.status === 'Requiere aclaración').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Fase 6 · Área Privada Institucional</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Observaciones y Propuestas de Ajuste al Proceso
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Espacio exclusivo de {userContext.entityName || 'su entidad'} para registrar observaciones técnicas, identificar cuellos de botella y plantear ajustes antes de la concertación final con Coordinación.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Observación Técnica</span>
          </button>
        </div>
        <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300 font-medium border-t border-slate-800">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Protección de Confidencialidad: Esta información permanece en el área de trabajo privada y nunca se expone en el portal ciudadano.</span>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 font-medium block">Total Registradas</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{totalObs}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">Pendientes / En revisión</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingObs}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Aceptadas por Coordinación</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{acceptedObs}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium block">Requieren Aclaración</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-0.5 block">{clarificationObs}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tema, propuesta o ruta asociada..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Prioridad:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Requiere aclaración">Requiere aclaración</option>
              <option value="Aceptada">Aceptada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Observation List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          Cargando observaciones técnicas...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No se encontraron observaciones técnicas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {search || priorityFilter !== 'all' || statusFilter !== 'all'
              ? 'No hay registros que coincidan con los filtros aplicados.'
              : `Su entidad aún no ha radicado observaciones técnicas. Haga clic en "Nueva Observación Técnica" para proponer ajustes a las rutas.`}
          </p>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear primera observación</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((obs) => (
            <div
              key={obs.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(obs.priority)}
                    {getStatusBadge(obs.status)}
                    <span className="text-[11px] text-slate-500">
                      Proceso: <strong className="text-slate-800 dark:text-slate-200">{obs.routeName}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {obs.topic}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(obs)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Propuesta</span>
                  </button>
                </div>
              </div>

              {/* Grid with 4 Key Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {obs.currentProposal && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Qué plantea el Proceso actualmente
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {obs.currentProposal}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 block">
                    Qué conviene revisar
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {obs.whatToReview}
                  </p>
                </div>

                {obs.entityObservation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Observación de la Entidad
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {obs.entityObservation}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Propuesta concreta de ajuste
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {obs.adjustmentProposal}
                  </p>
                </div>
              </div>

              {/* Coordinator Response Highlight if present */}
              {obs.coordinatorResponse && (
                <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Respuesta del Coordinador del Proceso ({obs.coordinatorResponderName || 'Coordinación'})
                    </span>
                    {obs.coordinatorResponseDate && (
                      <span className="font-normal text-blue-600 dark:text-blue-400">
                        {new Date(obs.coordinatorResponseDate).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed">
                    {obs.coordinatorResponse}
                  </p>
                </div>
              )}

              {/* Card Footer: Responsible & Timestamps */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Responsable: <strong>{obs.responsible}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Registrada el {new Date(obs.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <span>Actualizada: {new Date(obs.updatedAt).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nueva / Editar Observación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  {editingObs ? 'Editar Observación Técnica' : 'Nueva Observación Técnica'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {piiWarnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Advertencia de Privacidad / Datos Sensibles detectados:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {piiWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 pt-1">
                    Por favor no incluya números de cédula, historias clínicas o nombres de casos individuales.
                  </p>
                </div>
              )}

              {/* Ruta Relacionada */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Proceso relacionado *
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {routes.length === 0 ? (
                    <option value="">(No hay rutas registradas para esta entidad)</option>
                  ) : (
                    routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tema & Prioridad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tema u Objeto de la Observación *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej. Simplificación de requisitos de matrícula escolar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Nivel de Prioridad *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ObservationPriority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Alta">Alta (Urgente)</option>
                    <option value="Media">Media (Concertación)</option>
                    <option value="Baja">Baja (Opcional)</option>
                  </select>
                </div>
              </div>

              {/* Qué plantea la Ruta */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Qué plantea el Proceso actualmente
                </label>
                <textarea
                  value={currentProposal}
                  onChange={(e) => setCurrentProposal(e.target.value)}
                  rows={2}
                  placeholder="Describa el procedimiento, requisito o plazo que contempla actualmente el documento..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Qué conviene revisar */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Qué conviene revisar *
                </label>
                <textarea
                  value={whatToReview}
                  onChange={(e) => setWhatToReview(e.target.value)}
                  rows={2}
                  placeholder="Explique por qué este punto debe ser revisado (barreras normativas, operativas, capacidad institucional)..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Observación de la entidad */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Observación y diagnóstico de la Entidad
                </label>
                <textarea
                  value={entityObservation}
                  onChange={(e) => setEntityObservation(e.target.value)}
                  rows={2}
                  placeholder="Antecedentes observados en territorio en Quibdó, número de casos afectados o particularidades locales..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Propuesta de ajuste */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Propuesta concreta de ajuste *
                </label>
                <textarea
                  value={adjustmentProposal}
                  onChange={(e) => setAdjustmentProposal(e.target.value)}
                  rows={3}
                  placeholder="Redacción sugerida, inclusión de un nuevo paso, exoneración de documento o articulación con otra dependencia..."
                  className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Responsable */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Funcionario o Enlace Responsable *
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Nombre y cargo del enlace institucional"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{saving ? 'Guardando...' : editingObs ? 'Actualizar Observación' : 'Radicar Observación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
