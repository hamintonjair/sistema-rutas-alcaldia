import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  MessageSquare,
  CheckSquare,
  AlertTriangle,
  Building2,
  Calendar,
  ArrowRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';

interface CoordinatorDashboardProps {
  userContext: UserContext;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({ userContext }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getCoordinatorDashboardStats(userContext);
      setStats(data);
    } catch (err) {
      console.error('Error fetching coordinator stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userContext]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-2 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950 text-blue-300 rounded-full text-xs font-semibold border border-blue-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Panel del Coordinador de la Ruta · Fase 7</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Tablero de Coordinación y Seguimiento Interinstitucional
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Monitoreo del avance de las 19 entidades, gestión de rutas en revisión, evaluación de observaciones técnicas y control de compromisos.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Coordinator KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        {/* Entidades Participantes */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Entidades
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {stats?.kpis?.participatingEntities ?? 19}
          </div>
          <span className="text-[10px] text-slate-400 block">Participantes</span>
        </div>

        {/* Entidades Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Pendientes
          </span>
          <div className="text-xl font-bold text-amber-600">
            {stats?.kpis?.pendingEntities ?? 17}
          </div>
          <span className="text-[10px] text-slate-400 block">Sin publicar</span>
        </div>

        {/* Esperando Revisión */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Por Revisar
          </span>
          <div className="text-xl font-bold text-blue-600">
            {stats?.kpis?.routesWaitingReview ?? 0}
          </div>
          <Link to="/coordinacion/revision" className="text-[10px] text-blue-600 hover:underline block font-medium">
            Ver rutas →
          </Link>
        </div>

        {/* Devueltas */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Devueltas
          </span>
          <div className="text-xl font-bold text-rose-600">
            {stats?.kpis?.returnedRoutes ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">En ajustes</span>
        </div>

        {/* Aprobadas */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Aprobadas
          </span>
          <div className="text-xl font-bold text-emerald-600">
            {stats?.kpis?.approvedRoutes ?? 0}
          </div>
          <span className="text-[10px] text-slate-400 block">Listas publicar</span>
        </div>

        {/* Publicadas */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Publicadas
          </span>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {stats?.kpis?.publishedRoutes ?? 2}
          </div>
          <span className="text-[10px] text-slate-400 block">En portal</span>
        </div>

        {/* Observaciones Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Observaciones
          </span>
          <div className="text-xl font-bold text-amber-600">
            {stats?.kpis?.pendingObservations ?? 1}
          </div>
          <Link to="/coordinacion/observaciones" className="text-[10px] text-amber-600 hover:underline block font-medium">
            Evaluar →
          </Link>
        </div>

        {/* Compromisos Vencidos */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Compromisos
          </span>
          <div className="text-xl font-bold text-rose-600">
            {stats?.kpis?.expiredCommitments ?? 1}
          </div>
          <Link to="/coordinacion/compromisos" className="text-[10px] text-rose-600 hover:underline block font-medium">
            Vencidos →
          </Link>
        </div>
      </div>

      {/* Middle Section: Matrix of 19 Entities Progress & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avance por Entidad (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Avance por Entidad (19 Secretarías y Aliados)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Balance en tiempo real</span>
          </div>

          <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Entidad</th>
                  <th className="py-2.5 px-2 text-center">Rutas</th>
                  <th className="py-2.5 px-2 text-center">Publ.</th>
                  <th className="py-2.5 px-2 text-center">Rev.</th>
                  <th className="py-2.5 px-2 text-center">Borr.</th>
                  <th className="py-2.5 px-3">Cumplimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                {(stats?.entityProgress || []).map((ent: any) => (
                  <tr key={ent.entityId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                      {ent.entityName}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold">{ent.totalRoutes}</td>
                    <td className="py-2.5 px-2 text-center text-emerald-600 font-bold">{ent.publishedRoutes}</td>
                    <td className="py-2.5 px-2 text-center text-amber-600 font-bold">{ent.inReviewRoutes}</td>
                    <td className="py-2.5 px-2 text-center text-slate-400">{ent.draftRoutes}</td>
                    <td className="py-2.5 px-3 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ent.compliancePercentage === 100
                                ? 'bg-emerald-500'
                                : ent.compliancePercentage > 0
                                ? 'bg-blue-600'
                                : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            style={{ width: `${ent.compliancePercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[10px] w-8 text-right">
                          {ent.compliancePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Próximas Fechas Límite (1 Col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Próximas Fechas Límite
              </h3>
            </div>
            <Link to="/coordinacion/compromisos" className="text-[11px] text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {/* General Observations Deadline */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Plazo General de la Mesa Técnica
              </span>
              <div className="font-bold text-slate-900 dark:text-white text-xs">
                Cierre de Observaciones de la Ruta
              </div>
              <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-xs block">
                {stats?.kpis?.observationDeadline
                  ? new Date(stats.kpis.observationDeadline).toLocaleDateString('es-CO')
                  : '20 de Noviembre de 2026'}
              </span>
            </div>

            {/* Upcoming Commitments List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Compromisos Prioritarios en Cronograma
              </span>

              {(stats?.upcomingDeadlines || []).slice(0, 4).map((d: any) => (
                <div
                  key={d.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    d.isExpired
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                      {d.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        d.isExpired ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {new Date(d.commitmentDate).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[140px]">{d.entityName}</span>
                    <span className="font-semibold">{d.progressPercentage}% avance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
