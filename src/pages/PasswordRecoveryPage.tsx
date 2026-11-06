import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const PasswordRecoveryPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    if (!email) return;

    setLoading(true);
    try {
      const res = await api.recoverPassword(email);
      setMessage(res.message);
      if (res.token) setToken(res.token);
      setStep('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al solicitar recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !token || !newPassword) return;

    setLoading(true);
    try {
      await api.resetPassword(email, token, newPassword);
      setResetSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestToken} className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Ingrese su correo electrónico institucional para generar un token de recuperación.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico Oficial:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@quibdo.gov.co"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/login"
              className="text-xs text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Iniciar Sesión</span>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Generando...' : 'Generar Token'}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          {resetSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">¡Contraseña restablecida con éxito!</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Redirigiendo automáticamente a la pantalla de inicio de sesión...
                </p>
              </div>
            </div>
          ) : (
            <>
              {message && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs">
                  {message}
                </div>
              )}

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Token de Verificación:</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nueva Contraseña:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingrese su nueva contraseña"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-xs text-slate-600 hover:underline"
            >
              Cambiar Correo
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
            >
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>
          </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};
