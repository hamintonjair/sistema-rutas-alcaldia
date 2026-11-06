import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Play, ShieldAlert, RefreshCw, Terminal } from 'lucide-react';
import { api } from '../../services/api';

interface AuthTestRunnerModalProps {
  onClose: () => void;
}

export const AuthTestRunnerModal: React.FC<AuthTestRunnerModalProps> = ({ onClose }) => {
  const [activePhase, setActivePhase] = useState<'fase1' | 'fase2' | 'fase3' | 'fase4' | 'fase5' | 'fase6' | 'fase7' | 'fase8' | 'fase9'>('fase9');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = async (phase = activePhase) => {
    setLoading(true);
    setTestResults(null);
    try {
      let data: any;
      if (phase === 'fase1') data = await api.runAuthTests();
      else if (phase === 'fase2') data = await api.runPhase2Tests();
      else if (phase === 'fase3') data = await api.runPhase3Tests();
      else if (phase === 'fase4') data = await api.runPhase4Tests();
      else if (phase === 'fase5') data = await api.runPhase5Tests();
      else if (phase === 'fase6') data = await api.runPhase6Tests();
      else if (phase === 'fase7') data = await api.runPhase7Tests();
      else if (phase === 'fase8') data = await api.runPhase8Tests();
      else data = await api.runPhase9Tests();
      setTestResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests(activePhase);
  }, [activePhase]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Consola de Pruebas Automatizadas de la Plataforma</h3>
              <p className="text-[11px] text-slate-400">Verificación de requisitos técnicos, seguridad y control por fases</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Phase selector tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActivePhase('fase9')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase9'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 9: Seguridad & Versiones
          </button>
          <button
            onClick={() => setActivePhase('fase8')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase8'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 8: Archivos & Multimedia
          </button>
          <button
            onClick={() => setActivePhase('fase7')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase7'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 7: Tableros & Reportes
          </button>
          <button
            onClick={() => setActivePhase('fase6')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase6'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 6: Observaciones y Compromisos
          </button>
          <button
            onClick={() => setActivePhase('fase5')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase5'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 5: Portal Público
          </button>
          <button
            onClick={() => setActivePhase('fase4')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 4: Coordinación
          </button>
          <button
            onClick={() => setActivePhase('fase3')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase3'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 3: Institucional
          </button>
          <button
            onClick={() => setActivePhase('fase2')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 2: Admin & Entidades
          </button>
          <button
            onClick={() => setActivePhase('fase1')}
            className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              activePhase === 'fase1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fase 1: Auth & RBAC
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-slate-500 font-medium text-[11px]">
                {testResults?.summary?.fase || 'Suite de Pruebas'}:
              </span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {testResults
                  ? `${testResults.summary.passed} de ${testResults.summary.total} Pruebas Aprobadas (${Math.round((testResults.summary.passed / testResults.summary.total) * 100)}%)`
                  : 'Ejecutando pruebas del sistema...'}
              </div>
            </div>

            <button
              onClick={() => runTests(activePhase)}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-900 text-white dark:bg-blue-600 hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ejecutar de Nuevo</span>
            </button>
          </div>

          {/* Test cases list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {loading || !testResults ? (
              <div className="py-12 text-center text-slate-500">Ejecutando pruebas automatizadas...</div>
            ) : (
              testResults.results.map((res: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                    res.passed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  {res.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{res.test}</div>
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
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 rounded-lg"
          >
            Cerrar Consola de Pruebas
          </button>
        </div>
      </div>
    </div>
  );
};
