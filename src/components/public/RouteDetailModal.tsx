import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  Download,
  AlertCircle,
  Users,
  CheckCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { AttentionRoute, Entity, SystemConfig } from '../../types';
import { api } from '../../services/api';
import { exportRouteToPDF } from '../../utils/exportUtils';
import { ReportIssueModal } from './ReportIssueModal';

interface RouteDetailModalProps {
  route: AttentionRoute;
  onClose: () => void;
  config?: SystemConfig;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ route, onClose, config }) => {
  const [showReportModal, setShowReportModal] = useState(false);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Top Institutional Header */}
        <div className="bg-slate-900 text-white p-6 shrink-0 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            <Building2 className="w-4 h-4" />
            <span>{route.entityName}</span>
            <span className="text-slate-600">•</span>
            <span>{route.category}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight mb-2">
            {route.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700">
              Servicio: <strong>{route.serviceName}</strong>
            </span>
            <span className="bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800">
              Canal: <strong>{route.channel}</strong>
            </span>
            <span className="bg-blue-950/60 text-blue-300 px-2.5 py-1 rounded-md border border-blue-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Respuesta: {route.estimatedResponseTime}</span>
            </span>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Población Objetivo
              </h4>
              <p className="text-slate-700 dark:text-slate-300">{route.targetPopulation}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Necesidad que Atiende
              </h4>
              <p className="text-slate-700 dark:text-slate-300">{route.addressedNeed}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
              Descripción Institucional del Servicio
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {route.description}
            </p>
          </div>

          {/* Requirements & Documents Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-slate-900">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Requisitos Exigidos ({route.requirements.length})
              </h4>
              <ul className="space-y-2">
                {route.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 text-slate-900">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Documentos Solicitados ({route.requestedDocuments.length})
              </h4>
              <ul className="space-y-2">
                {route.requestedDocuments.map((docItem, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Procedure Timeline */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-1">
              Procedimiento Paso a Paso ({route.procedureSteps.length} pasos)
            </h3>

            <div className="space-y-4">
              {route.procedureSteps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 relative"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-emerald-600 font-bold text-sm flex items-center justify-center shrink-0">
                    {step.stepNumber || idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {step.title}
                      </h4>
                      {step.estimatedTime && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                          ⏱️ {step.estimatedTime}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-2">
                      {step.description}
                    </p>
                    {step.responsibleRole && (
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Responsable: <span className="text-slate-800 dark:text-slate-200 font-semibold">{step.responsibleRole}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Articulated Entities */}
          {route.articulatedEntityNames && route.articulatedEntityNames.length > 0 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Entidades Institucionales en Articulación Directa
              </h4>
              <div className="flex flex-wrap gap-2">
                {route.articulatedEntityNames.map((entName, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-md border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                  >
                    {entName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Institutional Contact Information Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
              Canales Oficiales de Atención Institucional
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Dirección Presencial:</span>
                  <span>{entity?.address || entity?.institutionalAddress || route.institutionalAddress || 'Palacio Municipal, Quibdó'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Teléfono Institucional:</span>
                  <span>{entity?.phone || entity?.institutionalPhone || route.institutionalPhone || 'Línea de Atención Municipal'}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Correo Electrónico Oficial:</span>
                  <span>
                    {entity?.email ||
                      entity?.institutionalEmail ||
                      (route.institutionalEmail && !route.institutionalEmail.includes('outlook.com') && !route.institutionalEmail.includes('gmail.com')
                        ? route.institutionalEmail
                        : '') ||
                      'contacto@quibdo.gov.co'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Horarios de Atención:</span>
                  <span>{entity?.serviceHours || route.serviceHours || 'Lunes a Viernes'}</span>
                </div>
              </div>
            </div>
            {route.institutionalOfficer && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Responsable del Registro: <strong className="text-slate-200">{route.institutionalOfficer}</strong>
              </div>
            )}
          </div>

          {/* PII Disclaimer Note */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed border border-slate-200 dark:border-slate-700">
            <strong>Aviso de Privacidad y Normativa:</strong> Esta información es de carácter institucional y público para la atención de la población migrante en Quibdó. No almacena datos personales de beneficiarios ni casos particulares.
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Reportar Información Desactualizada</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => exportRouteToPDF(route, config)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Ficha Técnica PDF</span>
            </button>
          </div>
        </div>
      </div>

      {showReportModal && (
        <ReportIssueModal route={route} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};
