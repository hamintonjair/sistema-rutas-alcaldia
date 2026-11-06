import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import {
  Building2,
  FileText,
  MessageSquare,
  CheckSquare,
  UserCheck,
  HelpCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Home,
  Shield,
} from 'lucide-react';
import { UserContext } from '../../services/api';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface InstitutionalLayoutProps {
  userContext: UserContext;
  onLogout: () => void;
}

export const InstitutionalLayout: React.FC<InstitutionalLayoutProps> = ({
  userContext,
  onLogout,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      to: '/mi-entidad',
      label: 'Inicio',
      icon: Home,
      end: true,
    },
    {
      to: '/mi-entidad/rutas',
      label: 'Mis rutas',
      icon: FileText,
      end: false,
    },
    {
      to: '/mi-entidad/compromisos',
      label: 'Compromisos',
      icon: CheckSquare,
      end: false,
    },
    {
      to: '/mi-entidad/perfil',
      label: 'Perfil institucional',
      icon: UserCheck,
      end: false,
    },
    {
      to: '/mi-entidad/archivos',
      label: 'Biblioteca multimedia',
      icon: FileText,
      end: false,
    },

    {
      to: '/mi-entidad/reportes-ciudadanos',
      label: 'Reportes ciudadanos',
      icon: MessageSquare,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Abrir menú"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>

            <div>
              <span className="font-serif font-bold text-sm text-white block">Espacio Privado Institucional</span>
              <span className="text-[11px] text-emerald-400 font-semibold block -mt-0.5">
                {userContext.entityName || 'Alcaldía de Quibdó'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista previa pública</span>
            </Link>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* Sidebar Menu */}
        <aside
          className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Entity Header Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/quibdo_alcaldia_logo_1793464458662.jpg"
                  alt="Logo"
                  className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="truncate">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {userContext.entityName || 'Entidad Institucional'}
                  </h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono block">
                    {userContext.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Menú Institucional
              </span>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Breadcrumbs />
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
