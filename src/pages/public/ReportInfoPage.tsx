import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Building2,
  FileText,
  Send,
  Search,
  ArrowLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AttentionRoute, Entity, FeedbackReport } from '../../types';
import { api } from '../../services/api';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';

export const ReportInfoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedRouteId = searchParams.get('routeId') || '';

  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState(preselectedRouteId);
  const [reporterType, setReporterType] = useState('Ciudadano');
  const [issueType, setIssueType] = useState('desactualizado');
  const [comments, setComments] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<FeedbackReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const fetched = await api.getRoutes({ publicOnly: true });
        setRoutes(fetched);
        if (preselectedRouteId && !selectedRouteId) {
          setSelectedRouteId(preselectedRouteId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoutes();
  }, [preselectedRouteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId) {
      setError('Por favor seleccione la ruta de atención a la cual se refiere el reporte.');
      return;
    }
    if (!comments.trim()) {
      setError('Por favor describa la novedad observada.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await api.submitFeedbackReport({
        routeId: selectedRouteId,
        reporterType,
        issueType,
        comments: comments.trim(),
      });
      setSubmittedReport(result);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            <span>Participación Ciudadana y Calidad de la Información</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Reportar Información Desactualizada o Novedades
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ayúdenos a mantener la precisión de las rutas oficiales de Quibdó. Si detecta un número telefónico que no responde, cambio de horario, requisitos inexactos o cambios en la sede de atención, envíe su observación a la Mesa Coordinadora.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <PIIWarningBanner compact />

        <div>
          <Link
            to="/rutas"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>

        {submittedReport ? (
          /* Confirmation card */
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Reporte Radicado Exitosamente
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Su observación ha sido registrada para verificación. Puede consultar el estado de su radicado en cualquier momento haciendo <Link to="/consultar-reporte" className="text-emerald-600 font-bold hover:underline">clic aquí</Link> o usando el enlace en el pie de página.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 max-w-sm mx-auto text-xs text-slate-600 dark:text-slate-300 space-y-1 border border-slate-200 dark:border-slate-700">
              <div>
                <strong>Radicado:</strong> <span className="font-mono text-emerald-600 dark:text-emerald-400">{submittedReport.id}</span>
              </div>
              <div>
                <strong>Ruta:</strong> {submittedReport.routeName}
              </div>
              <div>
                <strong>Fecha:</strong> {new Date(submittedReport.date).toLocaleString('es-CO')}
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedReport(null);
                  setComments('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Enviar otro reporte
              </button>
              <Link
                to={`/consultar-reporte?radicado=${submittedReport.id}`}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Consultar este Reporte
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Consultation Shortcut */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase">¿Ya tiene un radicado?</h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">Consulte la respuesta institucional de un reporte previo.</p>
                </div>
              </div>
              <Link
                to="/consultar-reporte"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-sm shadow-blue-600/20"
              >
                Consultar Estado →
              </Link>
            </div>

            {/* Report Form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs"
            >
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Field 1: Route selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Ruta de Atención Institucional *
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  required
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Seleccione la ruta sobre la cual desea reportar --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.entityName}] {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2 & 3: Issue type and reporter role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Tipo de Novedad *
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="desactualizado">Horario o teléfonos desactualizados</option>
                    <option value="requisitos_cambiaron">Los requisitos solicitados cambiaron en ventanilla</option>
                    <option value="direccion_cambio">La sede o dirección física cambió</option>
                    <option value="canal_inaccesible">Canal virtual o presencial no se encuentra disponible</option>
                    <option value="otro">Otro motivo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Usted reporta como:
                  </label>
                  <select
                    value={reporterType}
                    onChange={(e) => setReporterType(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ciudadano">Ciudadano migrante o usuario</option>
                    <option value="Servidor Público">Servidor público institucional</option>
                    <option value="Organización Social">Organización social o comunitaria</option>
                    <option value="Cooperación Internacional">Agencia de cooperación</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Detailed comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Detalle de la Observación o Inconsistencia *
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describa puntualmente qué información debe ser actualizada (Ej: La ventanilla ahora atiende únicamente de 8 a 12 m, o el número telefónico correcto es...)"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  Por favor, <strong>no incluya nombres de personas, documentos de identidad ni casos clínicos personales</strong> en este campo.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <Link
                  to="/rutas"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Enviando reporte...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Radicar Reporte Ciudadano</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
