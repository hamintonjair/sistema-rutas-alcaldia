import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Clock, LogOut, ShieldAlert } from 'lucide-react';

// Layouts
import { PublicLayout } from './components/layouts/PublicLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { CoordinatorLayout } from './components/layouts/CoordinatorLayout';
import { InstitutionalLayout } from './components/layouts/InstitutionalLayout';

// Auth Guard & Modals
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthTestRunnerModal } from './components/auth/AuthTestRunnerModal';

// Public Pages (Fase 5)
import { PublicHomePage } from './pages/public/PublicHomePage';
import { RoutesCatalogPage } from './pages/public/RoutesCatalogPage';
import { RouteDetailPage } from './pages/public/RouteDetailPage';
import { EntitiesCatalogPage } from './pages/public/EntitiesCatalogPage';
import { EntityDetailPage } from './pages/public/EntityDetailPage';
import { ReportInfoPage } from './pages/public/ReportInfoPage';
import { ConsultFeedbackPage } from './pages/public/ConsultFeedbackPage';
import { DocumentationPage } from './pages/public/DocumentationPage';
import { ScheduleView } from './components/common/ScheduleView';
import { LoginPage } from './pages/LoginPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';

import { RegistrationPage } from './pages/public/RegistrationPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEntityDetailPage } from './pages/admin/AdminEntityDetailPage';
import { EntitiesManager } from './components/institutional/EntitiesManager';
import { UsersManager } from './components/institutional/UsersManager';
import { DateSettingsPanel } from './components/institutional/DateSettingsPanel';
import { AuditLogViewer } from './components/institutional/AuditLogViewer';
import { ReportsExportPanel } from './components/institutional/ReportsExportPanel';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';

import { AdminPopulationPage } from './pages/admin/AdminPopulationPage';
import { AdminCommitmentsPage } from './pages/admin/AdminCommitmentsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Coordinator Pages
import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { CoordinatorObservationsPage } from './pages/coordinator/CoordinatorObservationsPage';
import { CoordinatorCommitmentsPage } from './pages/coordinator/CoordinatorCommitmentsPage';
import { CoordinatorMediaPage } from './pages/coordinator/CoordinatorMediaPage';

// Institutional Pages
import { InstitutionalHub } from './pages/institutional/InstitutionalHub';
import { InstitutionalRoutesPage } from './pages/institutional/InstitutionalRoutesPage';
import { InstitutionalObservationsPage } from './pages/institutional/InstitutionalObservationsPage';
import { InstitutionalCommitmentsPage } from './pages/institutional/InstitutionalCommitmentsPage';
import { InstitutionalProfilePage } from './pages/institutional/InstitutionalProfilePage';
import { InstitutionalMediaPage } from './pages/institutional/InstitutionalMediaPage';
import { InstitutionalHelpPage } from './pages/institutional/InstitutionalHelpPage';
import { InstitutionalPopulationPage } from './pages/institutional/InstitutionalPopulationPage';
import { InstitutionalFeedbackPage } from './pages/institutional/InstitutionalFeedbackPage';
import { InstitutionalBackoffice } from './components/institutional/InstitutionalBackoffice';

// Services & Models
import { api, UserContext } from './services/api';
import { SystemConfig, Entity, User, AttentionRoute } from './types';
import { INITIAL_CONFIG } from './data/mockData';

export default function App() {
  // Current Authenticated User Context restored from localStorage
  const [currentUser, setCurrentUser] = useState<UserContext>(() => {
    try {
      const saved = localStorage.getItem('quibdo_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role && parsed.role !== 'public') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error retrieving stored user session:', e);
    }
    return {
      id: 'usr-public',
      name: 'Usuario Público / Ciudadanía',
      role: 'public',
    };
  });

  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      return localStorage.getItem('quibdo_auth_token') || '';
    } catch (e) {
      return '';
    }
  });

  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [showTestsModal, setShowTestsModal] = useState(false);

  const [entities, setEntities] = useState<Entity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);

  const loadData = async () => {
    try {
      const [c, e, r] = await Promise.all([
        api.getConfig(),
        api.getEntities(),
        api.getRoutes(),
      ]);
      setConfig(c);
      setEntities(e);
      setRoutes(r);

      if (currentUser.role === 'admin' || currentUser.role === 'coordinator') {
        const u = await api.getUsers(currentUser);
        setUsers(u);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    try {
      if (currentUser && currentUser.role !== 'public') {
        localStorage.setItem('quibdo_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('quibdo_auth_user');
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      if (authToken) {
        localStorage.setItem('quibdo_auth_token', authToken);
      } else {
        localStorage.removeItem('quibdo_auth_token');
      }
    } catch (e) {}
  }, [authToken]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle successful login
  const handleLoginSuccess = (userContext: UserContext, token: string) => {
    try {
      localStorage.setItem('quibdo_auth_user', JSON.stringify(userContext));
      localStorage.setItem('quibdo_auth_token', token);
    } catch (e) {}
    setCurrentUser(userContext);
    setAuthToken(token);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (currentUser.role !== 'public') {
        await api.logout(currentUser);
      }
    } catch (err) {
      console.error(err);
    } finally {
      try {
        localStorage.removeItem('quibdo_auth_user');
        localStorage.removeItem('quibdo_auth_token');
      } catch (e) {}
      setCurrentUser({
        id: 'usr-public',
        name: 'Usuario Público / Ciudadanía',
        role: 'public',
      });
      setAuthToken('');
    }
  };

  const [sessionExpiredModal, setSessionExpiredModal] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  // 1-Hour Session Inactivity Auto-Logout Monitor
  useEffect(() => {
    if (!currentUser || currentUser.role === 'public') {
      return;
    }

    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll', 'visibilitychange'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    const ONE_HOUR_MS = 60 * 60 * 1000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= ONE_HOUR_MS) {
        handleLogout();
        setSessionExpiredModal(true);
      }
    }, 10000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleSwitchUser = (userContext: UserContext) => {
    try {
      localStorage.setItem('quibdo_auth_user', JSON.stringify(userContext));
    } catch (e) {}
    setCurrentUser(userContext);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES LAYER (PublicLayout) */}
        <Route element={<PublicLayout config={config} />}>
          <Route path="/" element={<PublicHomePage config={config} />} />
          <Route path="/rutas" element={<RoutesCatalogPage config={config} />} />
          <Route path="/rutas/:slug" element={<RouteDetailPage config={config} />} />
          <Route path="/entidades" element={<EntitiesCatalogPage />} />
          <Route path="/entidades/:slug" element={<EntityDetailPage />} />
          <Route path="/reportar-informacion" element={<ReportInfoPage />} />
          <Route path="/consultar-reporte" element={<ConsultFeedbackPage />} />
          <Route path="/documentacion" element={<DocumentationPage />} />
          <Route path="/agenda" element={<ScheduleView config={config} />} />
          <Route path="/registro" element={<RegistrationPage />} />
          <Route path="/flujograma" element={<PublicHomePage config={config} />} />
        </Route>

        {/* AUTHENTICATION LAYER (AuthLayout) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/recuperar-clave" element={<PasswordRecoveryPage />} />
        </Route>

        {/* ADMIN PRIVATE LAYER (AdminLayout + ProtectedRoute) */}
        <Route
          element={
            <ProtectedRoute userContext={currentUser} allowedRoles={['admin']}>
              <AdminLayout
                userContext={currentUser}
                onLogout={handleLogout}
                onSwitchUser={handleSwitchUser}
              />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard userContext={currentUser} config={config} />} />
          <Route
            path="/admin/entidades"
            element={<EntitiesManager entities={entities} userContext={currentUser} onRefresh={loadData} />}
          />
          <Route
            path="/admin/entidades/:id"
            element={<AdminEntityDetailPage userContext={currentUser} />}
          />
          <Route
            path="/admin/usuarios"
            element={<UsersManager users={users} entities={entities} userContext={currentUser} onRefresh={loadData} />}
          />
          <Route
            path="/admin/rutas"
            element={<InstitutionalRoutesPage userContext={currentUser} />}
          />
          <Route
            path="/admin/compromisos"
            element={<AdminCommitmentsPage userContext={currentUser} />}
          />
          <Route
            path="/admin/configuracion"
            element={<DateSettingsPanel config={config} userContext={currentUser} onRefreshConfig={loadData} />}
          />
          <Route path="/admin/auditoria" element={<AuditLogViewer userContext={currentUser} />} />
          <Route
            path="/admin/reportes"
            element={<ReportsExportPanel routes={routes} config={config} userContext={currentUser} />}
          />
          <Route path="/admin/ayuda" element={<InstitutionalHelpPage />} />
          <Route path="/admin/poblacion" element={<AdminPopulationPage userContext={currentUser} />} />
          <Route
            path="/admin/perfil"
            element={
              <AdminProfilePage
                userContext={currentUser}
                onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
              />
            }
          />
        </Route>

        {/* Redirect former coordinator path to admin */}
        <Route path="/coordinacion/*" element={<Navigate to="/admin" replace />} />

        {/* INSTITUTIONAL ENTITY PRIVATE LAYER (InstitutionalLayout + ProtectedRoute) */}
        <Route
          element={
            <ProtectedRoute userContext={currentUser} allowedRoles={['institutional']}>
              <InstitutionalLayout userContext={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/mi-entidad" element={<InstitutionalHub userContext={currentUser} />} />
          <Route path="/mi-entidad/rutas" element={<InstitutionalRoutesPage userContext={currentUser} />} />
          <Route path="/mi-entidad/observaciones" element={<InstitutionalObservationsPage userContext={currentUser} />} />
          <Route path="/mi-entidad/compromisos" element={<InstitutionalCommitmentsPage userContext={currentUser} />} />
          <Route path="/mi-entidad/perfil" element={<InstitutionalProfilePage userContext={currentUser} />} />
          <Route path="/mi-entidad/archivos" element={<InstitutionalMediaPage userContext={currentUser} />} />
          <Route path="/mi-entidad/ayuda" element={<InstitutionalHelpPage />} />
          <Route path="/mi-entidad/poblacion" element={<InstitutionalPopulationPage userContext={currentUser} />} />
          <Route path="/mi-entidad/reportes-ciudadanos" element={<InstitutionalFeedbackPage userContext={currentUser} />} />
        </Route>

        {/* Catch-all redirect to public portal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth Test Runner Modal */}
      {showTestsModal && (
        <AuthTestRunnerModal onClose={() => setShowTestsModal(false)} />
      )}

      {/* Session Expired Inactivity Modal */}
      {sessionExpiredModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shrink-0 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Sesión Finalizada por Inactividad
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Por seguridad de la plataforma institucional de Quibdó, su sesión se ha cerrado automáticamente tras 1 hora de inactividad.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              Para ingresar nuevamente a su panel de gestión, haga clic en el botón a continuación.
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSessionExpiredModal(false);
                  window.location.href = '/login';
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Iniciar Sesión Nuevamente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
