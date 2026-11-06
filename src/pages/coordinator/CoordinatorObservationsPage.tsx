import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Check,
  Building2,
  User,
  Calendar,
  Send,
  X,
  Shield,
  FileText,
} from 'lucide-react';
import { ObservationModel, Entity, ObservationPriority, ObservationStatus } from '../../types';
import { api, UserContext } from '../../services/api';

interface CoordinatorObservationsPageProps {
  userContext: UserContext;
}

export const CoordinatorObservationsPage: React.FC<CoordinatorObservationsPageProps> = ({
  userContext,
}) => {
  const [observations, setObservations] = useState<ObservationModel[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Response Modal State
  const [selectedObs, setSelectedObs] = useState<ObservationModel | null>(null);
  const [newStatus, setNewStatus] = useState<ObservationStatus>('Aceptada');
  const [coordinatorComment, setCoordinatorComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [obsData, entData] = await Promise.all([
        api.getObservations(undefined, userContext),
        api.getEntities(),
      ]);
      setObservations(obsData);
      setEntities(entData);
    } catch (err) {
      console.error('Error cargando observaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  const openRespondModal = (obs: ObservationModel) => {
    setSelectedObs(obs);
    setNewStatus(
      obs.status === 'Pendiente' || obs.status === 'En revisión' ? 'Aceptada' : obs.status
    );
    setCoordinatorComment(obs.coordinatorResponse || '');
    setModalError(null);
  };

  const handleRespondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObs) return;

    if (!coordinatorComment.trim()) {
      setModalError('Debe ingresar un comentario u observación técnica de respuesta.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      await api.respondObservation(selectedObs.id, newStatus, coordinatorComment.trim(), userContext);
      await loadData();
      setSelectedObs(null);
    } catch (err: any) {
      setModalError(err.message || 'Error al guardar la respuesta.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = observations.filter((obs) => {
    if (selectedEntityId !== 'all' && obs.entityId !== selectedEntityId) return false;
    if (priorityFilter !== 'all' && obs.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && obs.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTopic = obs.topic.toLowerCase().includes(q);
      const matchEntity = obs.entityName.toLowerCase().includes(q);
      const matchRoute = obs.routeName.toLowerCase().includes(q);
      const matchProposal = obs.adjustmentProposal.toLowerCase().includes(q);
      return matchTopic || matchEntity || matchRoute || matchProposal;
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
  const totalCount = observations.length;
  const pendingCount = observations.filter((o) => o.status === 'Pendiente' || o.status === 'En revisión').length;
  const acceptedCount = observations.filter((o) => o.status === 'Aceptada').length;
  const clarificationCount = observations.filter((o) => o.status === 'Requiere aclaración').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Módulo de Coordinación General</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
          Revisión y Respuesta a Observaciones Institucionales
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl">
          Monitoree y califique las propuestas técnicas de ajuste radicadas por las 19 entidades de la Ruta de Atención a Población Migrante en Quibdó.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 font-medium block">Total Observaciones</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">Pendientes de Evaluación</span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{pendingCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Aceptadas para la Ruta</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{acceptedCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium block">Con Aclaración Solicitada</span>
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-0.5 block">{clarificationCount}</span>
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
            placeholder="Buscar por tema, propuesta, ruta o entidad..."
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

          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Prioridad:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
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

      {/* Observation Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          Cargando observaciones técnicas...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No se encontraron observaciones técnicas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No hay registros que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((obs) => (
            <div
              key={obs.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {obs.entityName}
                    </span>
                    <span>·</span>
                    {getPriorityBadge(obs.priority)}
                    {getStatusBadge(obs.status)}
                    <span className="text-[11px] text-slate-500">
                      Ruta: <strong>{obs.routeName}</strong>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {obs.topic}
                  </h3>
                </div>

                <button
                  onClick={() => openRespondModal(obs)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Evaluar y Responder</span>
                </button>
              </div>

              {/* Grid 4 columns / boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {obs.currentProposal && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                      Qué plantea la Ruta actualmente
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

              {/* Coordinator Response Display */}
              {obs.coordinatorResponse && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    <span>Respuesta oficial de Coordinación ({obs.coordinatorResponderName || 'Coordinador'})</span>
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

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Enlace de la entidad: <strong>{obs.responsible}</strong>
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

      {/* Modal: Evaluar y Responder Observación */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">Evaluar Observación Técnica</h3>
                <span className="text-xs text-blue-300">{selectedObs.entityName} · {selectedObs.topic}</span>
              </div>
              <button
                onClick={() => setSelectedObs(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRespondSubmit} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {modalError}
                </div>
              )}

              {/* Proposal Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Propuesta de Ajuste de la Entidad
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedObs.adjustmentProposal}
                </p>
              </div>

              {/* Estado de Calificación */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Veredicto y Estado de la Observación *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ObservationStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Aceptada">Aceptada (Ajuste incorporado a la Ruta)</option>
                  <option value="Requiere aclaración">Requiere aclaración (Solicitar mayor soporte a la entidad)</option>
                  <option value="En revisión">En revisión (Pendiente de concepto interinstitucional)</option>
                  <option value="Rechazada">Rechazada (No procedente por marco normativo)</option>
                  <option value="Cerrada">Cerrada (Concertación finalizada)</option>
                </select>
              </div>

              {/* Concepto / Respuesta del Coordinador */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Concepto Técnico o Justificación de la Coordinación *
                </label>
                <textarea
                  value={coordinatorComment}
                  onChange={(e) => setCoordinatorComment(e.target.value)}
                  rows={4}
                  placeholder="Explique las razones técnicas, directrices normativas o el acuerdo alcanzado para aceptar, rechazar o solicitar aclaración..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedObs(null)}
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
                  <span>{saving ? 'Guardando respuesta...' : 'Emitir Concepto Oficial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
