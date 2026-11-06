import React, { useState } from 'react';
import { Building2, Shield, Eye, Calendar, ChevronDown, LogIn, LogOut, Terminal, KeyRound } from 'lucide-react';
import { UserContext } from '../../services/api';
import { SystemConfig } from '../../types';

interface HeaderProps {
  activeView: 'public' | 'institutional' | 'schedule';
  setActiveView: (view: 'public' | 'institutional' | 'schedule') => void;
  currentUser: UserContext;
  setCurrentUser: (user: UserContext) => void;
  config: SystemConfig;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTests: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  currentUser,
  setCurrentUser,
  config,
  onOpenLogin,
  onLogout,
  onOpenTests,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const meetingDateObj = new Date(config.initialMeetingDate);
  const formattedMeeting = `${meetingDateObj.getDate()} de Noviembre de ${meetingDateObj.getFullYear()}, 9:00 a.m.`;

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Municipal Banner */}
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

      {/* Main Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setActiveView('public');
              }}
              className="text-base font-bold tracking-tight text-white hover:text-emerald-300 transition-colors block"
            >
              Ruta Estratégica Migrante
            </a>
            <span className="text-xs text-slate-400 block -mt-1">Municipio de Quibdó</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveView('public')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 px-2 border-b-2 ${
              activeView === 'public'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Portal Público (Ciudadanía)
          </button>
          <button
            onClick={() => setActiveView('institutional')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 px-2 border-b-2 ${
              activeView === 'institutional'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Área Privada Institucional
          </button>
          <button
            onClick={() => setActiveView('schedule')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 px-2 border-b-2 ${
              activeView === 'schedule'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Cronograma & Fechas Límite
          </button>
        </nav>

        {/* Zone 3: Actions & Interactive Role Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User / Login Button */}
          {currentUser.role === 'public' ? (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[140px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                    Cambiar Rol de Prueba
                  </div>

                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'usr-admin',
                        name: 'Carlos Mario Perea (Admin General)',
                        role: 'admin',
                      });
                      setShowRoleMenu(false);
                      setActiveView('institutional');
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                      currentUser.role === 'admin' ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">1. Administrador General</div>
                      <div className="text-[10px] text-slate-400">Control total, entidades, usuarios y auditoría</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'usr-coord',
                        name: 'Dra. Luz Marina Mosquera (Coordinadora)',
                        role: 'coordinator',
                        entityId: 'ent-19',
                        entityName: 'Secretaría coordinadora de la Ruta',
                      });
                      setShowRoleMenu(false);
                      setActiveView('institutional');
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                      currentUser.role === 'coordinator' ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">2. Coordinadora de la Ruta</div>
                      <div className="text-[10px] text-slate-400">Revisión, aprobación, devoluciones y reportes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'usr-salud',
                        name: 'Lic. Yilber Córdoba (Enlace Salud)',
                        role: 'institutional',
                        entityId: 'ent-2',
                        entityName: 'Secretaría de Salud',
                      });
                      setShowRoleMenu(false);
                      setActiveView('institutional');
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                      currentUser.role === 'institutional' ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">3. Usuario Institucional (Salud)</div>
                      <div className="text-[10px] text-slate-400">Solo gestiona rutas de su entidad asignada</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentUser({
                        id: 'usr-public',
                        name: 'Usuario Público / Ciudadanía',
                        role: 'public',
                      });
                      setShowRoleMenu(false);
                      setActiveView('public');
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                      (currentUser.role as string) === 'public' ? 'text-emerald-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span>4. Usuario Público (Sin Clave)</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Consulta exclusiva de rutas aprobadas y publicadas</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-800 mt-2 pt-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión Segura</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
