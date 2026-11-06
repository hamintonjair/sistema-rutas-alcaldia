import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, Calendar, LogIn, ShieldAlert, Menu, X } from 'lucide-react';
import { SystemConfig } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface PublicLayoutProps {
  config: SystemConfig;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ config }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const meetingDateObj = new Date(config.initialMeetingDate);
  const formattedMeeting = `${meetingDateObj.getDate()} de Noviembre de ${meetingDateObj.getFullYear()}, 9:00 a.m.`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Municipal Banner */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400">República de Colombia</span>
            <span className="text-slate-500">•</span>
            <span>Alcaldía Municipal de Quibdó - Chocó</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">Atención Integral a Población Migrante</span>
          </div>
        </div>
      </div>

      {/* Public Top Bar Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink flex-1 xs:flex-initial">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-inner shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-xs sm:text-base font-bold tracking-tight text-white block truncate">
                Ruta Estratégica Migrante
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 block -mt-1 truncate">Municipio de Quibdó</span>
            </div>
          </Link>

          {/* Public Navigation Desktop */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `whitespace-nowrap transition-colors py-1 px-1.5 border-b-2 ${
                  isActive ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-300 hover:text-white'
                }`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/rutas"
              className={({ isActive }) =>
                `whitespace-nowrap transition-colors py-1 px-1.5 border-b-2 ${
                  isActive ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-300 hover:text-white'
                }`
              }
            >
              Catálogo de Rutas
            </NavLink>
            <NavLink
              to="/entidades"
              className={({ isActive }) =>
                `whitespace-nowrap transition-colors py-1 px-1.5 border-b-2 ${
                  isActive ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-300 hover:text-white'
                }`
              }
            >
              Entidades
            </NavLink>

            <NavLink
              to="/reportar-informacion"
              className={({ isActive }) =>
                `whitespace-nowrap transition-colors py-1 px-1.5 border-b-2 ${
                  isActive ? 'border-amber-500 text-amber-400 font-bold' : 'border-transparent text-slate-300 hover:text-white'
                }`
              }
            >
              Reportar Novedad
            </NavLink>
          </nav>

          {/* Right: Institutional Login & Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Acceso Institucional</span>
              <span className="sm:hidden">Ingresar</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-emerald-400 bg-slate-800/90 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-colors shrink-0 flex items-center justify-center shadow-xs"
              title="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-2 text-xs font-semibold shadow-xl">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/rutas"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Catálogo de Rutas
            </NavLink>
            <NavLink
              to="/entidades"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Entidades
            </NavLink>
            <NavLink
              to="/reportar-informacion"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 px-3 rounded-lg transition-colors ${
                  isActive ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              Reportar Novedad
            </NavLink>
          </div>
        )}
      </header>

      {/* Breadcrumbs (for top-level pages only, detail pages render rich contextual breadcrumbs) */}
      {!location.pathname.startsWith('/rutas/') && !location.pathname.startsWith('/entidades/') && (
        <Breadcrumbs />
      )}

      {/* Main Outlet */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Municipal Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-200">
              Alcaldía Municipal de Quibdó - Chocó • República de Colombia
            </div>
            <div className="text-[11px] text-slate-500">
              Plataforma Institucional para la Atención Integral de la Población Migrante
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Portal Público</Link>
            <Link to="/agenda" className="hover:text-white transition-colors">Cronograma de Fechas</Link>
            <Link to="/consultar-reporte" className="hover:text-white transition-colors">Consultar mi Reporte</Link>
            <Link to="/login" className="hover:text-white transition-colors">Ingreso Servidores Públicos</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500 text-center">
          © {new Date().getFullYear()} Alcaldía de Quibdó. Documentación pública aprobada sin acopio de datos personales particulares conforme a la Ley 1581 de 2012.
        </div>
      </footer>
    </div>
  );
};
