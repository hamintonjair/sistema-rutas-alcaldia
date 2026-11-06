import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileText,
  CheckSquare,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Calendar,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';

interface InstitutionalHubProps {
  userContext: UserContext;
}

export const InstitutionalHub: React.FC<InstitutionalHubProps> = ({ userContext }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getInstitutionalDashboardStats(userContext);
      setData(res);
    } catch (err) {
      console.error('Error fetching institutional dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userContext]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-2 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-800">
              <Building2 className="w-3.5 h-3.5" />
              <span>Espacio Privado Institucional · {userContext.entityName}</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Gestión de Rutas y Compromisos de {userContext.entityName || 'Mi Entidad'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Panel exclusivo de trabajo para la formulación, actualización, respuesta a devoluciones y seguimiento de acuerdos suscritos por su secretaría.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            <Link
              to="/mi-entidad/rutas"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Ruta</span>
            </Link>
          </div>
        </div>

        {/* Última actualización tag */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
          <span>Aislamiento Estricto: Solo su entidad tiene acceso a estos borradores y compromisos internos.</span>
          <span className="text-emerald-400 font-medium">
            Última actualización: {kpis?.lastUpdatedAt ? new Date(kpis.lastUpdatedAt).toLocaleString('es-CO') : 'Reciente'}
          </span>
        </div>
      </div>

      <PIIWarningBanner />

      {/* Core Institutional Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        {/* Mis Rutas Totales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 block">
            Mis Rutas Total
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {kpis?.myRoutes ?? 0}
          </div>
          <Link to="/mi-entidad/rutas" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-[11px] block">
            Ver todas →
          </Link>
        </div>

        {/* Rutas en Borrador */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-600 block">
            En Borrador
          </span>
          <div className="text-2xl font-bold text-amber-600">
            {kpis?.draftRoutes ?? 0}
          </div>
          <Link to="/mi-entidad/rutas" className="text-amber-600 font-medium hover:underline text-[11px] block">
            Gestionar borradores →
          </Link>
        </div>

        {/* Rutas Publicadas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-emerald-600 block">
            Publicadas
          </span>
          <div className="text-2xl font-bold text-emerald-600">
            {kpis?.publishedRoutes ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 block">En portal público</span>
        </div>

        {/* Compromisos Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 block">
            Compromisos
          </span>
          <div className="text-2xl font-bold text-blue-600">
            {kpis?.pendingCommitments ?? 0}
          </div>
          <Link to="/mi-entidad/compromisos" className="text-blue-600 font-medium hover:underline text-[11px] block">
            Ver acuerdos →
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Observaciones */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Mis Observaciones Técnicas y Ajustes
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {kpis?.openObservations ?? 0} Abiertas
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Espacio exclusivo para radicar propuestas técnicas de ajuste, solicitar revisión de requisitos normativos y consultar el veredicto del Coordinador de la Ruta.
            </p>
          </div>
          <Link
            to="/mi-entidad/observaciones"
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Gestionar mis observaciones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compromisos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Mis Compromisos y Acuerdos
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {kpis?.pendingCommitments ?? 0} En seguimiento
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Actualice periódicamente el porcentaje de avance (0 a 100%) y cargue los soportes documentales oficiales (actas, resoluciones, circulares) de cumplimiento.
            </p>
          </div>
          <Link
            to="/mi-entidad/compromisos"
            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Gestionar mis compromisos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Perfil Institucional */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 sm:col-span-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Perfil Institucional y Logo Oficial
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Almacenamiento Supabase
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Actualice los datos institucionales de su entidad: descripción funcional, responsable institucional, dirección, teléfono, correo oficial, horarios de atención y el logo oficial con previsualización en vivo guardado directamente en Supabase Storage.
            </p>
          </div>
          <Link
            to="/mi-entidad/perfil"
            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
          >
            <span>Editar mi perfil institucional y logo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
