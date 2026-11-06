import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { CheckCircle2, FileText, MessageSquare, BarChart3, LogOut, ExternalLink } from 'lucide-react';
import { UserContext } from '../../services/api';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface CoordinatorLayoutProps {
  userContext: UserContext;
  onLogout: () => void;
}

export const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({
  userContext,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Coordinator Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white block">Panel de Coordinación</span>
              <span className="text-xs text-slate-400 block -mt-1">{userContext.name}</span>
            </div>
          </div>

          {/* Coordinator Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <NavLink
              to="/coordinacion"
              end
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Tablero General
            </NavLink>

            <NavLink
              to="/coordinacion/revision"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Revisión y Aprobación
            </NavLink>

            <NavLink
              to="/coordinacion/observaciones"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Observaciones
            </NavLink>

            <NavLink
              to="/coordinacion/compromisos"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Compromisos
            </NavLink>

            <NavLink
              to="/coordinacion/reportes"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Reportes
            </NavLink>

            <NavLink
              to="/coordinacion/archivos"
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Archivos
            </NavLink>


          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista previa pública</span>
            </Link>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Outlet */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};
