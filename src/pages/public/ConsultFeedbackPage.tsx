import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { FeedbackReport } from '../../types';
import { Search, Send, Clock, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const ConsultFeedbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const radicadoFromUrl = searchParams.get('radicado') || '';

  const [radicadoId, setRadicadoId] = useState(radicadoFromUrl);
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (targetId: string) => {
    if (!targetId.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const data = await api.getFeedbackReportById(targetId.trim());
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError('No se encontró ningún reporte con ese número de radicado. Por favor verifique e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (radicadoFromUrl) {
      handleSearch(radicadoFromUrl);
    }
  }, [radicadoFromUrl, handleSearch]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(radicadoId);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Search className="w-4 h-4" />
            <span>Consulta de Trámites Ciudadanos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Consultar Estado de mi Reporte
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ingrese el número de radicado que se le asignó al momento de enviar su novedad o sugerencia para conocer el estado de atención y la respuesta institucional.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Search Form */}
        <form onSubmit={onFormSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Número de Radicado (Ej: rad-173...)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={radicadoId}
                onChange={(e) => setRadicadoId(e.target.value)}
                placeholder="Pegue aquí su número de radicado"
                className="flex-1 text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Buscando...' : 'Consultar'}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-900/40">
              {error}
            </div>
          )}
        </form>

        {/* Result Card */}
        {report && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${report.status === 'resuelto' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado: {report.status === 'resuelto' ? 'Atendido y Resuelto' : 'En proceso de revisión'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Radicado el: {new Date(report.date).toLocaleDateString('es-CO')}</span>
            </div>

            <div className="p-6 space-y-6 text-sm">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Información de la Ruta</h4>
                  <p className="font-bold text-slate-900 dark:text-white">{report.routeName}</p>
                  <p className="text-xs text-slate-500">{report.entityName}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Su Novedad Reportada</span>
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">"{report.comments}"</p>
                </div>

                {report.response ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                    <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Respuesta Institucional Oficial</span>
                    </h4>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{report.response}</p>
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex justify-between items-center text-[10px] text-emerald-600 dark:text-emerald-400">
                      <span>Atendido por: {report.responderName}</span>
                      <span>{report.respondedAt ? new Date(report.respondedAt).toLocaleDateString('es-CO') : ''}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">Pendiente de Respuesta</h4>
                      <p className="text-xs text-amber-600 dark:text-amber-500/80 leading-relaxed">
                        Su reporte ha sido recibido por la entidad responsable y se encuentra en etapa de validación técnica. Por favor consulte más tarde.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
