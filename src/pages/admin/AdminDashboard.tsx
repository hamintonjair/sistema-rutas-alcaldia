import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HardDrive,
  History,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Activity,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';
import { SystemConfig } from '../../types';

interface AdminDashboardProps {
  userContext: UserContext;
  config: SystemConfig;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userContext, config }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDashboardStats(userContext);
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
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
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-800">
              <Shield className="w-3.5 h-3.5" />
              <span>Panel del Administrador General · Fase 7</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              Tablero de Control y Administración Central
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Supervisión de entidades, usuarios, almacenamiento multimedia, auditoría y alertas operativas de la plataforma institucional de Quibdó.
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

      {/* 6 Primary KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Total Entidades */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Entidades</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.kpis?.totalEntities ?? 0}
          </div>
          <Link to="/admin/entidades" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline text-[11px] block">
            Ver entidades ({stats?.kpis?.totalEntities ?? 0}) →
          </Link>
        </div>

        {/* Usuarios Activos */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Usuarios Activos</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.kpis?.activeUsers ?? 0}
          </div>
          <Link to="/admin/usuarios" className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-[11px] block">
            Gestionar accesos ({stats?.kpis?.activeUsers ?? 0}) →
          </Link>
        </div>

        {/* Rutas Totales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Rutas Totales</span>
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.kpis?.totalRoutes ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 block">En todo el sistema</span>
        </div>

        {/* Rutas Publicadas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Rutas Publicadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats?.kpis?.publishedRoutes ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 block">Visibles a ciudadanía</span>
        </div>

        {/* Rutas en Revisión */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">En Revisión</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats?.kpis?.inReviewRoutes ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 block">Revisión o devueltas</span>
        </div>

        {/* Rutas Vencidas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Rutas Vencidas</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">
            {stats?.kpis?.expiredRoutes ?? 0}
          </div>
          <span className="text-[11px] text-slate-400 block">Vigencia superada</span>
        </div>
      </div>

      {/* Middle Section: System Alerts */}
      <div className="space-y-4 text-xs">
        {/* System Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Alertas del Sistema</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {(stats?.systemAlerts || []).length} Activas
            </span>
          </div>

          <div className="space-y-2.5">
            {stats?.systemAlerts && stats.systemAlerts.length > 0 ? (
              stats.systemAlerts.map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    alert.type === 'danger'
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
                      : alert.type === 'warning'
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                      : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-current" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-xs">{alert.title}</span>
                    <p className="text-[11px] opacity-90 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No hay alertas críticas en el sistema. Todos los módulos operan normalmente.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity & Audit Logs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Actividad Reciente y Registros de Auditoría
            </h3>
          </div>
          <Link
            to="/admin/auditoria"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Ver bitácora completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Usuario</th>
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Entidad</th>
                <th className="py-2.5 px-3">Acción</th>
                <th className="py-2.5 px-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
              {(stats?.recentAuditLogs || []).slice(0, 7).map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleString('es-CO')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{log.entityName}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-400">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
