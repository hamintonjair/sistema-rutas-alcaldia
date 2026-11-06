import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, RefreshCw, Terminal, FileText, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

interface Phase3TestRunnerModalProps {
  onClose: () => void;
}

export const Phase3TestRunnerModal: React.FC<Phase3TestRunnerModalProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const data = await api.runPhase3Tests();
      setTestResults(data);
    } catch (err) {
      console.error('Error running Phase 3 test suite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Suite de Pruebas de Registro y Gestión de Rutas (Fase 3)</h3>
              <p className="text-[11px] text-slate-400">Verificación automatizada de campos dinámicos, imágenes, PII y reglas de estado</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider block">Estado de Pruebas Fase 3:</span>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                {testResults
                  ? `${testResults.summary.passed} / ${testResults.summary.total} Pruebas Validadas Exitosamente`
                  : 'Ejecutando suite automatizada de Fase 3...'}
              </div>
            </div>

            <button
              onClick={runTests}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-900 text-white dark:bg-emerald-600 hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ejecutar de Nuevo</span>
            </button>
          </div>

          {/* Test cases list */}
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto">
            {loading || !testResults ? (
              <div className="py-12 text-center text-slate-500">Ejecutando suite automatizada de Fase 3...</div>
            ) : (
              testResults.results.map((res: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    res.passed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  {res.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5 flex-1">
                    <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
                      <span>{res.test}</span>
                      <span className="font-mono text-[10px] text-slate-400">P-3.{idx + 1}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{res.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
