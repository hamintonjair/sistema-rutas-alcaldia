import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Building2, ShieldCheck } from 'lucide-react';
import { SystemConfig } from '../../types';

interface ScheduleViewProps {
  config: SystemConfig;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ config }) => {
  const meetingDateObj = new Date(config.initialMeetingDate);
  const deadlineDateObj = new Date(config.observationDeadline);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-800">
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda Institucional Oficial</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Cronograma y Fechas Clave de Articulación Institucional
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Fechas oficiales establecidas para la Ruta Estratégica para la Atención Integral de la Población Refugiada y Migrante en Quibdó.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Initial Meeting Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            1. Reunión Institucional Inicial de Coordinación
          </h3>
          <div className="text-emerald-700 dark:text-emerald-400 font-bold text-lg font-mono">
            {meetingDateObj.getDate()} de Noviembre de {meetingDateObj.getFullYear()} — 9:00 a.m.
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Mesa de trabajo inicial con los representantes de las 19 entidades vinculadas para la socialización de la Ruta y definición de enlaces técnicos.
          </p>
        </div>

        {/* Observation Deadline Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            2. Fecha Límite para Enviar Observaciones a las Rutas
          </h3>
          <div className="text-amber-700 dark:text-amber-400 font-bold text-lg font-mono">
            {deadlineDateObj.getDate()} de Noviembre de {deadlineDateObj.getFullYear()} — 11:59 p.m.
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Plazo máximo configurable para que cada entidad registre sus observaciones, compromisos y ajustes requeridos en las fichas de atención.
          </p>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm mb-0.5">Nota de Administración:</strong>
          La fecha límite para enviar observaciones es <strong>dinámica</strong> y puede actualizarse desde el panel de configuración administrativo por el Administrador o la Coordinadora de la Ruta.
        </div>
      </div>
    </div>
  );
};
