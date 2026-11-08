import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  customLabelMap?: Record<string, string>;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customLabelMap = {} }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const defaultMap: Record<string, string> = {
    rutas: 'Procesos de Atención',
    agenda: 'Cronograma Institucional',
    login: 'Acceso Institucional',
    'recuperar-clave': 'Recuperar Contraseña',
    admin: 'Panel Administrativo',
    entidades: 'Gestión de Entidades',
    usuarios: 'Gestión de Usuarios',
    configuracion: 'Configuración de Fechas',
    auditoria: 'Auditoría de Acciones',
    coordinacion: 'Panel de Coordinación',
    revision: 'Revisión y Aprobación',
    'mi-entidad': 'Espacio Institucional',
    compromisos: 'Compromisos Registrados',
    reportes: 'Informes y Matriz',
    archivos: 'Biblioteca Multimedia',
    perfil: 'Perfil Institucional',
    'reportes-ciudadanos': 'Reportes Ciudadanos',
    ...customLabelMap,
  };

  if (pathnames.length === 0) return null;

  // Session-Aware Home Route Determination
  let homeTo = '/';
  let homeLabel = 'Inicio';
  let itemsToRender: string[] = pathnames;
  let basePathPrefix = '';

  if (location.pathname.startsWith('/admin')) {
    homeTo = '/admin';
    homeLabel = 'Inicio';
    basePathPrefix = '/admin';
    itemsToRender = pathnames.slice(1);
  } else if (location.pathname.startsWith('/mi-entidad')) {
    homeTo = '/mi-entidad';
    homeLabel = 'Inicio';
    basePathPrefix = '/mi-entidad';
    itemsToRender = pathnames.slice(1);
  } else if (location.pathname.startsWith('/coordinacion')) {
    homeTo = '/coordinacion';
    homeLabel = 'Inicio';
    basePathPrefix = '/coordinacion';
    itemsToRender = pathnames.slice(1);
  }

  return (
    <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 py-2 px-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <Link to={homeTo} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors">
        <Home className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>{homeLabel}</span>
      </Link>

      {itemsToRender.map((value, index) => {
        const to = `${basePathPrefix}/${itemsToRender.slice(0, index + 1).join('/')}`;
        const isLast = index === itemsToRender.length - 1;
        const label = defaultMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                {label}
              </span>
            ) : (
              <Link to={to} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
