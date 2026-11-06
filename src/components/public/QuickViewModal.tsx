import React from 'react';
import { X, Building2, Clock, CheckCircle2, ArrowRight, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { AttentionRoute } from '../../types';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slug';

interface QuickViewModalProps {
  route: AttentionRoute | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ route, onClose }) => {
  if (!route) return null;

  const routeSlug = slugify(route.name) || route.id;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image & badge */}
        <div className="relative h-44 bg-slate-950 overflow-hidden">
          <img
            src={
              route.mainImageUrl ||
              '/quibdo_alcaldia_logo.png'
            }
            alt={route.mainImageAlt || route.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/quibdo_alcaldia_logo.png';
            }}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Cerrar vista rápida"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Metadata */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-1">
              <span>{route.category}</span>
              <span aria-hidden="true">·</span>
              <span>Canal: {route.channel}</span>
            </div>
            <h2 id="quick-view-title" className="text-lg sm:text-xl font-bold leading-tight line-clamp-2">
              {route.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-700 dark:text-slate-300">
          {/* Entity and Service Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-900 dark:text-white">
                {route.entityName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Respuesta aprox.: <strong>{route.estimatedResponseTime || '3 a 5 días'}</strong></span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Descripción del Servicio
            </h3>
            <p className="text-sm leading-relaxed line-clamp-3 text-slate-800 dark:text-slate-200">
              {route.description}
            </p>
          </div>

          {/* Key Quick Indicators */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 block">Población objetivo</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {route.targetPopulation || 'Población Migrante en Quibdó'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Requisitos / Pasos</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {route.requirements?.length || 0} requisitos · {route.procedureSteps?.length || 0} pasos
              </span>
            </div>
          </div>

          {/* Sample requirements preview */}
          {route.requirements && route.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Requisitos esenciales
              </h3>
              <ul className="space-y-1 text-xs">
                {route.requirements.slice(0, 2).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{req}</span>
                  </li>
                ))}
                {route.requirements.length > 2 && (
                  <li className="text-[11px] text-slate-400 italic pl-5">
                    + {route.requirements.length - 2} requisito(s) adicional(es) en la ficha completa
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cerrar
            </button>

            <Link
              to={`/rutas/${routeSlug}`}
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span>Ver ruta completa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
