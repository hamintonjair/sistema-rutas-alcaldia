import React, { useState } from 'react';
import { X, LogIn, KeyRound, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { api, UserContext } from '../../services/api';
import { getNormalizedRoleCode } from './ProtectedRoute';

interface LoginModalProps {
  onLoginSuccess: (userContext: UserContext, token: string) => void;
  onClose: () => void;
  onOpenRecovery: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  onClose,
  onOpenRecovery,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo institucional y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email, password);
      const userRoleCode = getNormalizedRoleCode(data.user.role_code || data.user.role);
      onLoginSuccess(
        {
          id: data.user.id,
          name: data.user.name,
          role: userRoleCode,
          roleSpanish: data.user.roleSpanish || data.user.role,
          entityId: data.user.entityId,
          entityName: data.user.entityName,
        },
        data.token
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill helper for testing
  const autofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Inicio de Sesión Institucional</h3>
              <p className="text-[11px] text-slate-400">Plataforma Ruta Migrante Quibdó</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico Institucional:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@quibdo.gov.co"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Contraseña:</label>
                <button
                  type="button"
                  onClick={onOpenRecovery}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Verificando...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>

          {/* Quick Demo Autofill Credentials */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Autocompletar Credenciales de Prueba:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => autofill('admin.ruta@quibdo.gov.co', 'Admin123*')}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                ⚡ Administrador
              </button>
              <button
                type="button"
                onClick={() => autofill('coordinacion.migrantes@quibdo.gov.co', 'Coord123*')}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                📋 Coordinadora
              </button>
              <button
                type="button"
                onClick={() => autofill('salud.migrantes@quibdo.gov.co', 'Salud123*')}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-800 dark:text-slate-200 text-left font-medium"
              >
                🏥 Enlace Salud
              </button>
              <button
                type="button"
                onClick={() => autofill('inactivo.prueba@quibdo.gov.co', 'Prueba123*')}
                className="p-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 rounded text-left font-medium"
              >
                🚫 Usuario Inactivo (Test)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
