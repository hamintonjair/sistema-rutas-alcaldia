import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { api, UserContext } from '../services/api';
import { getNormalizedRoleCode } from '../components/auth/ProtectedRoute';

interface LoginPageProps {
  onLoginSuccess: (userContext: UserContext, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo institucional y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.login(email.trim(), password.trim());
      const userRoleCode = getNormalizedRoleCode(data.user.role_code || data.user.role);

      const userCtx: UserContext = {
        id: data.user.id,
        name: data.user.name,
        role: userRoleCode,
        roleSpanish: data.user.roleSpanish || data.user.role,
        entityId: data.user.entityId,
        entityName: data.user.entityName,
      };

      onLoginSuccess(userCtx, data.token);

      // Strict Role-Based Redirect to the appropriate portal
      const roleHomeMap: Record<string, string> = {
        admin: '/admin',
        coordinator: '/coordinacion',
        institutional: '/mi-entidad',
      };

      const roleHome = roleHomeMap[userRoleCode] || '/';

      const isPathAllowedForRole = (path: string, code: string) => {
        if (!path || path === '/login' || path === '/recuperar-clave') return false;
        if (code === 'admin') return true;
        if (code === 'coordinator' && path.startsWith('/coordinacion')) return true;
        if (code === 'institutional' && path.startsWith('/mi-entidad')) return true;
        return false;
      };

      const targetDestination = from && isPathAllowedForRole(from, userRoleCode) ? from : roleHome;
      navigate(targetDestination, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      {from && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-xs">
          <strong>Acceso Restringido:</strong> Debe iniciar sesión con una cuenta autorizada para acceder a su panel.
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
            <Link
              to="/recuperar-clave"
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Verificando credenciales...' : 'Ingresar al Sistema'}</span>
        </button>
      </form>

      {/* Demo Credentials Section REMOVED */}
    </div>
  );
};
