import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
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
  Percent,
  Building2,
  Eye,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { CommitmentModel, AttentionRoute } from '../../types';
import { api, UserContext } from '../../services/api';
import { CommitmentDetailModal } from '../../components/institutional/CommitmentDetailModal';

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
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentModel | null>(null);

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
      console.error('Error cargando compromisos institucionales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  const todayStr = new Date().toISOString().split('T')[0];

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

  // Filter commitments for current view
  const filtered = commitments.filter((c) => {
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
      const matchResp = (c.responsiblePerson || '').toLowerCase().includes(q);
      const matchRoute = c.routeName ? c.routeName.toLowerCase().includes(q) : false;
      return matchTopic || matchAg || matchResp || matchRoute;
    }
    return true;
  });

  // Metrics for entity
  const totalCount = commitments.length;
  const fulfilledCount = commitments.filter((c) => c.status === 'Cumplido' || c.progressPercentage === 100).length;
  const inProgressCount = commitments.filter((c) => c.status === 'En proceso' && c.progressPercentage < 100).length;
  const expiredCount = commitments.filter(
    (c) =>
      c.status === 'Vencido' ||
      (c.commitmentDate < todayStr && c.progressPercentage < 100 && c.status !== 'Cumplido' && c.status !== 'Cancelado')
  ).length;

  return (
    <div className="space-y-6">
      {/* Institutional Consultation Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckSquare className="w-32 h-32 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>CONSULTA INSTITUCIONAL DE COMPROMISOS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Compromisos Asignados a {userContext.entityName || 'la Entidad'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consulte y verifique el estado de avance, los acuerdos operativos y las metas fijadas para su entidad por la Administración Central para el fortalecimiento de los procesos institucionales.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>Actualizar Consulta</span>
          </button>
        </div>

        <div className="pt-3 flex items-center gap-2 text-xs text-amber-300/90 font-medium border-t border-slate-800/80">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Panel de Solo Visualización: Los registros, acuerdos formales y cambios de estado son administrados por la Alcaldía Central.
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Total Acuerdos</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider block">En Cumplimiento</span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">Cumplidos (100%)</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{fulfilledCount}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block">Vencidos / Mora</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">{expiredCount}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por acuerdo, tema, responsable o proceso..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Filtrar estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent font-bold text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900">Todos los estados</option>
            <option value="En proceso" className="bg-white dark:bg-slate-900">En proceso</option>
            <option value="Cumplido" className="bg-white dark:bg-slate-900">Cumplidos (100%)</option>
            <option value="Vencido" className="bg-white dark:bg-slate-900">Vencidos (Alerta)</option>
            <option value="Pendiente" className="bg-white dark:bg-slate-900">Pendientes</option>
            <option value="Requiere apoyo interinstitucional" className="bg-white dark:bg-slate-900">Requiere apoyo</option>
          </select>
        </div>
      </div>

      {/* Commitments List (Read-Only) */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Cargando compromisos asignados...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No hay compromisos registrados para su entidad
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || statusFilter !== 'all'
                ? 'No se encontraron compromisos que coincidan con la búsqueda.'
                : 'La Administración Central aún no ha registrado compromisos pendientes para su entidad.'}
            </p>
          </div>
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
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
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

                  <button
                    onClick={() => setSelectedCommitment(com)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Consultar Expediente</span>
                  </button>
                </div>

                {/* Progress Bar (Visual Only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      Avance Reportado:
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

                {/* Agreement Body */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acuerdo / Meta Fijada</span>
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
                      Plazo: {new Date(com.commitmentDate).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Observations & Evidences */}
                {(com.comments || com.evidenceUrl || com.evidenceName) && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 dark:border-slate-800/60">
                    {com.comments && (
                      <span className="text-[11px] text-slate-500 italic max-w-xl truncate">
                        <strong>Observaciones Técnicas:</strong> {com.comments}
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

      {/* Modal: Detalle del Compromiso */}
      {selectedCommitment && (
        <CommitmentDetailModal
          commitment={selectedCommitment}
          onClose={() => setSelectedCommitment(null)}
        />
      )}
    </div>
  );
};
