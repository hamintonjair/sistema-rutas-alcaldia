import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  Calendar,
  ShieldCheck,
  BarChart3,
  ExternalLink,
  LogOut,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { UserContext } from '../../services/api';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface AdminLayoutProps {
  userContext: UserContext;
  onLogout: () => void;
  onSwitchUser?: (newUser: UserContext) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  userContext,
  onLogout,
  onSwitchUser,
}) => {
  const navigate = useNavigate();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const isDevMode = process.env.NODE_ENV !== 'production';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white block">Panel Administrativo</span>
              <span className="text-xs text-slate-400 block -mt-1">Alcaldía Municipal de Quibdó</span>
            </div>
          </div>

          {/* Admin Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Resumen
            </NavLink>

            <NavLink
              to="/admin/entidades"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Entidades
            </NavLink>

            <NavLink
              to="/admin/usuarios"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Usuarios
            </NavLink>

            <NavLink
              to="/admin/rutas"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Rutas
            </NavLink>



            <NavLink
              to="/admin/auditoria"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Auditoría
            </NavLink>

            <NavLink
              to="/admin/reportes"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Reportes
            </NavLink>



            <NavLink
              to="/admin/ayuda"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              Ayuda
            </NavLink>
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Separate Public Preview Link as required by Admin rule 1 */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista previa pública</span>
            </Link>

            {/* Logout */}
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

      {/* Dev Mode Banner */}
      {isDevMode && (
        <div className="bg-amber-950 text-amber-200 text-xs py-1 px-4 border-b border-amber-800 flex items-center justify-between">
          <span className="font-semibold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Modo de demostración activo (Entorno Development)</span>
          </span>
          {onSwitchUser && (
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="text-[11px] underline hover:text-white font-medium flex items-center gap-1"
              >
                <span>Probar otro rol</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs text-white">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Cambiar Perfil de Prueba
                  </div>

                  <button
                    onClick={() => {
                      onSwitchUser({
                        id: 'usr-coord',
                        name: 'Dra. Luz Marina Mosquera (Coordinadora)',
                        role: 'coordinator',
                        entityId: 'ent-19',
                        entityName: 'Secretaría coordinadora de la Ruta',
                      });
                      setShowDemoMenu(false);
                      navigate('/coordinacion');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
                  >
                    Coordinadora de la Ruta
                  </button>

                  <button
                    onClick={() => {
                      onSwitchUser({
                        id: 'usr-salud',
                        name: 'Lic. Yilber Córdoba (Enlace Salud)',
                        role: 'institutional',
                        entityId: 'ent-2',
                        entityName: 'Secretaría de Salud',
                      });
                      setShowDemoMenu(false);
                      navigate('/mi-entidad');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
                  >
                    Usuario Institucional (Salud)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Outlet Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <Outlet />
      </div>
    </div>
  );
};
