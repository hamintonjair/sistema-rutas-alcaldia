import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { AttentionRoute } from '../../types';

interface ReportIssueModalProps {
  route: AttentionRoute;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ route, onClose }) => {
  const [reporterType, setReporterType] = useState<'Ciudadano' | 'Organización' | 'Servidor Público'>('Ciudadano');
  const [issueType, setIssueType] = useState<'desactualizado' | 'informacion_erronea' | 'contacto_no_funciona' | 'otro'>('desactualizado');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    setLoading(true);
    setFormError('');
    try {
      await api.submitFeedbackReport({
        routeId: route.id,
        reporterType,
        issueType,
        comments,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Error al enviar el reporte. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Reportar Novedad sobre la Ruta</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {formError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-xs border border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Ruta: </span>
            <span className="text-slate-900 dark:text-white font-medium">{route.name}</span>
            <div className="text-slate-500 mt-0.5">Entidad: {route.entityName}</div>
          </div>

          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-slate-900 dark:text-white text-base">¡Reporte Enviado con Éxito!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Agradecemos su colaboración. La Secretaría Coordinadora revisará esta novedad con la entidad responsable.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Usted realiza este reporte como:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Ciudadano', 'Organización', 'Servidor Público'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReporterType(type)}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium text-center transition-colors ${
                        reporterType === type
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Novedad Identificada:
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="desactualizado">Información o procedimiento desactualizado</option>
                  <option value="contacto_no_funciona">Teléfono, correo o dirección inactivos/erróneos</option>
                  <option value="informacion_erronea">Requisitos incoherentes o no coincidentes</option>
                  <option value="otro">Otra observación técnica o sugerencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detalle de la Observación o Novedad:
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Describa brevemente lo que identificó (Ej: El número telefónico no contesta, o el procedimiento cambió de horario...)"
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !comments.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Enviando...' : 'Enviar Reporte'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
