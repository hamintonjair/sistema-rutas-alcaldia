import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Phone, Mail, Clock, CheckCircle2, FileText, AlertCircle, Eye, ChevronRight } from 'lucide-react';
import { AttentionRoute, Entity } from '../../types';
import { api } from '../../services/api';
import { RouteStatusBadge } from '../common/RouteStatusBadge';

interface RoutePreviewModalProps {
  route: AttentionRoute | Partial<AttentionRoute>;
  onClose: () => void;
}

export const RoutePreviewModal: React.FC<RoutePreviewModalProps> = ({ route, onClose }) => {
  const [entity, setEntity] = useState<Entity | null>(null);

  useEffect(() => {
    if (route.entityId) {
      api
        .getEntities()
        .then((list) => {
          const found = list.find((e) => e.id === route.entityId);
          if (found) setEntity(found);
        })
        .catch(() => {});
    }
  }, [route.entityId]);
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 block">Vista Previa del Portal Público</span>
              <h3 className="font-bold text-sm text-white truncate max-w-md">{route.name || 'Sin título de ruta'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Modal Body simulating Public Card & Detail */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800 dark:text-slate-200">
          {/* Main Hero Card Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-md">
            <img
              src={route.mainImageUrl || '/quibdo_alcaldia_logo.png'}
              alt={route.mainImageAlt || route.name || 'Vista de la ruta'}
              onError={(e) => {
                e.currentTarget.onerror = null;
                if (route.mainImageUrl && !e.currentTarget.src.includes('/api/storage/proxy')) {
                  e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(route.mainImageUrl)}`;
                } else {
                  e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                }
              }}
              className="w-full h-48 object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase font-mono">
                  {route.category || 'Categoría'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                  {route.serviceName || 'Servicio General'}
                </span>
                {route.status && <RouteStatusBadge status={route.status} />}
              </div>

              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">{route.name}</h1>
              <p className="text-xs text-slate-200 mt-1 line-clamp-2 max-w-2xl">{route.description}</p>
            </div>
          </div>

          {/* Key Attributes Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Población Objetivo</span>
              <strong className="text-slate-900 dark:text-white">{route.targetPopulation || 'Toda la población'}</strong>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Canales Disponibles</span>
              <strong className="text-slate-900 dark:text-white">
                {route.channels?.join(', ') || route.channel || 'Presencial'}
              </strong>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Tiempo de Respuesta</span>
              <strong className="text-slate-900 dark:text-white">{route.estimatedResponseTime || 'Inmediato'}</strong>
            </div>
          </div>

          {/* Dynamic Requirements Section */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Requisitos Institucionales Exigidos
            </h4>
            {route.dynamicRequirements && route.dynamicRequirements.length > 0 ? (
              <ul className="space-y-2">
                {route.dynamicRequirements.map((req, idx) => (
                  <li key={req.id || idx} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${req.isObligatory ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{req.text}</span>
                      {req.isObligatory && (
                        <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-700 rounded uppercase">Obligatorio</span>
                      )}
                      {req.observation && <p className="text-[11px] text-slate-500 mt-0.5">{req.observation}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : route.requirements && route.requirements.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                {route.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No se requieren documentos ni requisitos previos para este trámite.</p>
            )}
          </div>

          {/* Dynamic Procedure Steps Section */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Procedimiento Paso a Paso
            </h4>
            <div className="space-y-3">
              {(route.dynamicSteps || route.procedureSteps || []).map((step: any, idx: number) => (
                <div key={step.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    {step.stepNumber || idx + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">{step.title}</h5>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{step.description}</p>
                    {(step.responsibleRole || step.responsible) && (
                      <span className="text-[10px] text-slate-500 block">
                        Responsable: <strong>{step.responsibleRole || step.responsible}</strong> • Tiempo: <strong>{step.estimatedTime || 'N/A'}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Preview if any */}
          {route.galleryImages && route.galleryImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                Galería Institucional de Apoyo
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {route.galleryImages.map((img) => (
                  <div key={img.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                    <img
                      src={img.url}
                      alt={img.altText}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        if (img.url && !e.currentTarget.src.includes('/api/storage/proxy')) {
                          e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(img.url)}`;
                        } else {
                          e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                        }
                      }}
                      className="w-full h-28 object-cover"
                    />
                    {img.description && <p className="p-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800 truncate">{img.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Strip */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
            <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">Puntos de Atención e Información Institucional</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{entity?.address || entity?.institutionalAddress || route.institutionalAddress || 'Quibdó, Chocó'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{entity?.phone || entity?.institutionalPhone || route.institutionalPhone || '(604) 671 0000'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {entity?.email ||
                    entity?.institutionalEmail ||
                    (route.institutionalEmail && !route.institutionalEmail.includes('outlook.com') && !route.institutionalEmail.includes('gmail.com')
                      ? route.institutionalEmail
                      : '') ||
                    'contacto@quibdo.gov.co'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
