import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Save,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';

interface AdminProfilePageProps {
  userContext: UserContext;
  onUpdateUser?: (updatedUser: Partial<UserContext>) => void;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({
  userContext,
  onUpdateUser,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - Personal
  const [name, setName] = useState(userContext.name || '');
  const [email, setEmail] = useState(userContext.email || '');
  const [positionTitle, setPositionTitle] = useState('Administrador General');
  
  // Form Fields - Municipal Contact & Schedule (Alcaldía)
  const [alcaldiaAddress, setAlcaldiaAddress] = useState('Carrera 2 No. 24-45, Palacio Municipal, Quibdó - Chocó');
  const [alcaldiaPhone, setAlcaldiaPhone] = useState('(604) 671 0000 · Línea Gratuita: 01 8000 910 120');
  const [alcaldiaEmail, setAlcaldiaEmail] = useState('contacto@quibdo-choco.gov.co');
  const [alcaldiaSchedule, setAlcaldiaSchedule] = useState('Lunes a Viernes: 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.');
  const [alcaldiaScheduleNote, setAlcaldiaScheduleNote] = useState('Atención prioritaria para mujeres gestantes, personas con discapacidad y adultos mayores.');
  const [alcaldiaSubtitle, setAlcaldiaSubtitle] = useState('Secretaría de Gobierno y Secretaría Coordinadora del Proceso de Atención a Población Migrante.');

  // Password Fields
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [configData, users] = await Promise.all([
          api.getConfig().catch(() => null),
          api.getUsers(userContext).catch(() => []),
        ]);

        if (configData) {
          if (configData.alcaldiaAddress) setAlcaldiaAddress(configData.alcaldiaAddress);
          if (configData.alcaldiaPhone) setAlcaldiaPhone(configData.alcaldiaPhone);
          if (configData.alcaldiaEmail) setAlcaldiaEmail(configData.alcaldiaEmail);
          if (configData.alcaldiaSchedule) setAlcaldiaSchedule(configData.alcaldiaSchedule);
          if (configData.alcaldiaScheduleNote) setAlcaldiaScheduleNote(configData.alcaldiaScheduleNote);
          if (configData.alcaldiaSubtitle) setAlcaldiaSubtitle(configData.alcaldiaSubtitle);
        }

        const currentUserData = users.find((u) => u.id === userContext.id || u.email === userContext.email);
        if (currentUserData) {
          setName(currentUserData.name || userContext.name || '');
          setEmail(currentUserData.email || userContext.email || '');
          setPositionTitle(currentUserData.positionTitle || 'Administrador General');
        }
      } catch (err) {
        console.warn('No se pudo cargar detalle extendido de usuario, usando contexto actual:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('El nombre completo es obligatorio.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingrese un correo electrónico válido.');
      return;
    }

    if (changePassword) {
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden. Por favor verifique.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        positionTitle: positionTitle.trim(),
        role: 'admin',
      };

      if (changePassword && newPassword) {
        payload.password = newPassword;
      }

      await Promise.all([
        api.updateUser(userContext.id, payload, userContext),
        api.updateConfig(
          {
            alcaldiaAddress: alcaldiaAddress.trim(),
            alcaldiaPhone: alcaldiaPhone.trim(),
            alcaldiaEmail: alcaldiaEmail.trim(),
            alcaldiaSchedule: alcaldiaSchedule.trim(),
            alcaldiaScheduleNote: alcaldiaScheduleNote.trim(),
            alcaldiaSubtitle: alcaldiaSubtitle.trim(),
          },
          userContext
        ),
      ]);

      // Update parent state / session context
      if (onUpdateUser) {
        onUpdateUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        });
      }

      setSuccessMessage('Perfil de Administrador e información institucional de la Alcaldía actualizados correctamente.');
      setChangePassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <UserCheck className="w-32 h-32 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>PERFIL DE ADMINISTRADOR CENTRAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Configuración de Datos del Administrador
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Actualice sus datos personales, correo institucional, cargo y clave de acceso para la administración de la plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Info Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
            {/* Avatar Badge */}
            <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold font-serif text-3xl shadow-lg border-4 border-white dark:border-slate-800">
                {name ? name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white border-2 border-white dark:border-slate-800 shadow-sm" title="Cuenta Activa">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white font-serif">{name || 'Administrador Central'}</h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{positionTitle || 'Administrador General'}</p>
              <span className="inline-block text-[10px] font-bold text-slate-400 font-mono uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 mt-2">
                Rol: Administrador del Sistema
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] truncate">{email || 'admin@sistema.com'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Alcaldía Municipal de Quibdó</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Último acceso: Hoy (Sesión Activa)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Formulario de Edición de Perfil</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                Datos Centrales
              </span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
              {/* Feedback Notifications */}
              {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-xs">{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-3 animate-in fade-in duration-200">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-semibold text-xs">{errorMessage}</span>
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto" />
                  <span className="text-xs font-semibold">Cargando datos del perfil...</span>
                </div>
              ) : (
                <>
                  {/* Section 1: Personal & Contact Data */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Información Personal y Contacto</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Nombre y Apellidos"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="admin@quibdo.gov.co"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Position Title */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">
                          Cargo / Función Institucional
                        </label>
                        <input
                          type="text"
                          value={positionTitle}
                          onChange={(e) => setPositionTitle(e.target.value)}
                          placeholder="Ej: Administrador General, Jefe de Sistemas..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Section 2: Municipal Contact & Attention Schedule Info (Visible on Public Portal) */}
                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Datos de Contacto y Horarios de la Alcaldía (Portal Público)</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Visible en el pie de página público
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Alcaldía Address */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Dirección Oficial Sede Palacio Municipal</span>
                        </label>
                        <input
                          type="text"
                          value={alcaldiaAddress}
                          onChange={(e) => setAlcaldiaAddress(e.target.value)}
                          placeholder="Ej: Carrera 2 No. 24-45, Palacio Municipal, Quibdó - Chocó"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Alcaldía Phone PBX */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>PBX Municipal / Línea Gratuita</span>
                        </label>
                        <input
                          type="text"
                          value={alcaldiaPhone}
                          onChange={(e) => setAlcaldiaPhone(e.target.value)}
                          placeholder="Ej: PBX Municipal: (604) 671 0000 · Línea Gratuita: 01 8000 910 120"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Alcaldía Email */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correo Electrónico Institucional</span>
                        </label>
                        <input
                          type="email"
                          value={alcaldiaEmail}
                          onChange={(e) => setAlcaldiaEmail(e.target.value)}
                          placeholder="Ej: contacto@quibdo-choco.gov.co"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Alcaldía Schedule */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Horario General de Atención</span>
                        </label>
                        <input
                          type="text"
                          value={alcaldiaSchedule}
                          onChange={(e) => setAlcaldiaSchedule(e.target.value)}
                          placeholder="Ej: Lunes a Viernes: 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Alcaldía Schedule Priority Note */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nota de Atención Prioritaria</span>
                        </label>
                        <input
                          type="text"
                          value={alcaldiaScheduleNote}
                          onChange={(e) => setAlcaldiaScheduleNote(e.target.value)}
                          placeholder="Ej: Atención prioritaria para mujeres gestantes, personas con discapacidad..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Alcaldia Subtitle / Dependencies */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nombre de Dependencias / Secretaría Coordinadora (Pie de Página)</span>
                        </label>
                        <input
                          type="text"
                          value={alcaldiaSubtitle}
                          onChange={(e) => setAlcaldiaSubtitle(e.target.value)}
                          placeholder="Ej: Secretaría de Gobierno y Secretaría Coordinadora del Proceso de Atención a Población Migrante."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Security & Password Change */}
                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        <span>Seguridad y Contraseña</span>
                      </h3>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={changePassword}
                          onChange={(e) => setChangePassword(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Cambiar contraseña de acceso
                        </span>
                      </label>
                    </div>

                    {changePassword && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* New Password */}
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 dark:text-slate-300">
                              Nueva Contraseña *
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 dark:text-slate-300">
                              Confirmar Nueva Contraseña *
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita la nueva contraseña"
                                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>La nueva clave se guardará cifrada para su próxima autenticación.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Guardando Cambios...' : 'Guardar Cambios de Perfil'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
