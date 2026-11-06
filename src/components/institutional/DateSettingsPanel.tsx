import React, { useState } from 'react';
import { Calendar, Clock, Save, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SystemConfig } from '../../types';
import { api, UserContext } from '../../services/api';

interface DateSettingsPanelProps {
  config: SystemConfig;
  userContext: UserContext;
  onRefreshConfig: () => void;
}

export const DateSettingsPanel: React.FC<DateSettingsPanelProps> = ({
  config,
  userContext,
  onRefreshConfig,
}) => {
  const [meetingDate, setMeetingDate] = useState(
    config.initialMeetingDate ? config.initialMeetingDate.substring(0, 16) : '2026-11-04T09:00'
  );

  const [observationDeadline, setObservationDeadline] = useState(
    config.observationDeadline ? config.observationDeadline.substring(0, 16) : '2026-11-20T23:59'
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      await api.updateConfig(
        {
          initialMeetingDate: new Date(meetingDate).toISOString(),
          observationDeadline: new Date(observationDeadline).toISOString(),
        },
        userContext
      );
      setSuccess(true);
      onRefreshConfig();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Configuración Dinámica de Fechas Institucionales</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajuste los plazos del cronograma institucional. Esta fecha límite no está fija en el código y puede ser modificada en cualquier momento por la Secretaría Coordinadora o Administración.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Fechas actualizadas correctamente! Todos los usuarios verán los nuevos plazos en la plataforma.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Initial Meeting Date */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white">
              Fecha de la Reunión Institucional Inicial:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                disabled={userContext.role !== 'admin' && userContext.role !== 'coordinator'}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Fecha programada para la primera mesa de articulación institucional (4 de Noviembre de 2026, 9:00 AM).
            </p>
          </div>

          {/* Configurable Observation Deadline */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <label className="block font-bold text-amber-950 dark:text-amber-200">
              Fecha Límite para Enviar Observaciones y Ajustes a las Rutas:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={observationDeadline}
                onChange={(e) => setObservationDeadline(e.target.value)}
                disabled={userContext.role !== 'admin' && userContext.role !== 'coordinator'}
                className="w-full p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Plazo asignado a las 19 entidades para cargar borradores y responder observaciones del coordinador.
            </p>
          </div>

          {(userContext.role === 'admin' || userContext.role === 'coordinator') && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Guardando...' : 'Guardar Nuevos Plazos'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
