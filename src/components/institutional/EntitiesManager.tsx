import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  UserPlus,
  FileText,
  Users,
  Terminal,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Info,
} from 'lucide-react';
import { Entity, EntityType, User } from '../../types';
import { api, UserContext } from '../../services/api';
import { Phase2TestRunnerModal } from '../admin/Phase2TestRunnerModal';

interface EntitiesManagerProps {
  entities: Entity[];
  userContext: UserContext;
  onRefresh: () => void;
}

export const EntitiesManager: React.FC<EntitiesManagerProps> = ({ entities, userContext, onRefresh }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPhase2Tests, setShowPhase2Tests] = useState(false);

  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [targetEntityForUser, setTargetEntityForUser] = useState<Entity | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Entity Form Fields (Phase 2 Profile)
  const [name, setName] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('Municipal');

  // New Institutional User Fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);
  const [userPositionTitle, setUserPositionTitle] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const [saving, setSaving] = useState(false);

  const openCreateEntityModal = () => {
    setEditingEntity(null);
    setName('');
    setEntityType('Municipal');
    setShowEntityModal(true);
  };

  const openEditEntityModal = (ent: Entity) => {
    setEditingEntity(ent);
    setName(ent.name);
    setEntityType(ent.entityType || ent.entity_type || 'Municipal');
    setShowEntityModal(true);
  };

  const openCreateUserModal = (ent: Entity) => {
    setTargetEntityForUser(ent);
    setUserName(ent.primaryResponsible || (ent as any).primary_responsible || '');
    setUserEmail(ent.email || ent.institutionalEmail || '');
    setUserPassword(`Quibdo${Math.floor(100 + Math.random() * 900)}*`);
    setShowUserPassword(false);
    setUserPositionTitle(`Enlace Institucional - ${ent.sigla || ent.code}`);
    setUserPhone(ent.phone || ent.institutionalPhone || '');
    setShowUserModal(true);
  };

  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !name.trim()) return;

    setSaving(true);
    setFeedbackMessage(null);
    try {
      const payload = {
        name: name.trim(),
        entityType,
        active: true,
      };

      if (editingEntity) {
        await api.updateEntity(editingEntity.id, payload, userContext);
        setFeedbackMessage({ type: 'success', text: `Entidad "${name}" actualizada exitosamente.` });
      } else {
        await api.createEntity(payload, userContext);
        setFeedbackMessage({ type: 'success', text: `Entidad "${name}" registrada exitosamente. Ahora puede vincular usuarios institucionales a esta entidad.` });
      }
      onRefresh();
      setShowEntityModal(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error al guardar la entidad institucional.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInstitutionalUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEntityForUser || !userName.trim() || !userEmail.trim()) return;

    if (!userPassword.trim() || userPassword.trim().length < 6) {
      setFeedbackMessage({ type: 'error', text: 'La contraseña de acceso es obligatoria y debe tener al menos 6 caracteres.' });
      return;
    }

    setSaving(true);
    setFeedbackMessage(null);
    try {
      await api.createUser(
        {
          name: userName.trim(),
          email: userEmail.trim(),
          password: userPassword.trim(),
          role: 'institutional',
          entityId: targetEntityForUser.id,
          positionTitle: userPositionTitle.trim(),
          active: true,
        },
        userContext
      );
      setFeedbackMessage({ type: 'success', text: `Servidor público vinculado exitosamente a ${targetEntityForUser.name}. Clave asignada: ${userPassword.trim()}` });
      setShowUserModal(false);
      onRefresh();
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error al crear usuario institucional.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ent: Entity) => {
    try {
      await api.updateEntity(ent.id, { active: !ent.active }, userContext);
      setFeedbackMessage({ type: 'success', text: `Estado de ${ent.name} modificado a ${!ent.active ? 'Activa' : 'Inactiva'}.` });
      onRefresh();
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error al actualizar el estado de la entidad.' });
    }
  };

  const filtered = entities.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.code && e.code.toLowerCase().includes(search.toLowerCase())) ||
      (e.sigla && e.sigla.toLowerCase().includes(search.toLowerCase())) ||
      (e.primaryResponsible && e.primaryResponsible.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || (e.entityType || e.entity_type) === typeFilter;

    return matchesSearch && matchesType;
  });

  const activeCount = entities.filter((e) => e.active !== false).length;
  const inactiveCount = entities.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI matrix */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Fase 2 - Gestión Institucional
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Alcaldía Municipal de Quibdó
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Directorio Institucional y Entidades Articuladas
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Administración centralizada de perfiles institucionales, servidores públicos responsables y estado operativo para la atención a población migrante.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {userContext.role === 'admin' && (
              <button
                onClick={openCreateEntityModal}
                className="px-3.5 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Registrar Entidad</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Entidades</span>
            <span className="text-xl font-bold text-white font-mono">{entities.length}</span>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">Entidades Activas</span>
            <span className="text-xl font-bold text-emerald-300 font-mono">{activeCount}</span>
          </div>
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-800/60">
            <span className="text-[10px] font-bold uppercase text-rose-400 block">Entidades Inactivas</span>
            <span className="text-xl font-bold text-rose-300 font-mono">{inactiveCount}</span>
          </div>
          <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/60">
            <span className="text-[10px] font-bold uppercase text-blue-400 block">Cobertura Institucional</span>
            <span className="text-xl font-bold text-blue-300 font-mono">100% Quibdó</span>
          </div>
        </div>
      </div>

      {/* In-app Notification Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Action and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, sigla o responsable..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Filtrar por Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Todas los Tipos (19)</option>
            <option value="Municipal">Municipal / Alcaldía</option>
            <option value="Departamental">Departamental / Gobernación</option>
            <option value="Nacional">Nacional / Ministerio</option>
            <option value="Órgano de Control">Órganos de Control</option>
            <option value="Cooperación Internacional">Cooperación Internacional</option>
          </select>
        </div>
      </div>

      {/* Administrative Entities Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Entidad / Logo</th>
                <th className="p-3.5">Tipo de Entidad</th>
                <th className="p-3.5">Responsable Institucional</th>
                <th className="p-3.5">Contacto Institucional</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {/* Entity Name & Sigla */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={ent.logoUrl || ent.logo_url || '/quibdo_alcaldia_logo.png'}
                        alt={ent.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                        }}
                        className="w-10 h-10 rounded-lg bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{ent.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {ent.sigla || ent.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                          {ent.description || 'Sin descripción cargada.'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Entity Type */}
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {ent.entityType || ent.entity_type || 'Municipal'}
                    </span>
                  </td>

                  {/* Responsible */}
                  <td className="p-3.5 text-slate-800 dark:text-slate-200 font-semibold">
                    {ent.primaryResponsible || ent.primary_responsible || (
                      <span className="text-slate-400 font-normal italic">Por asignar</span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 space-y-0.5 text-[11px]">
                    <div className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{ent.email || ent.institutionalEmail || <span className="text-slate-400 italic">Sin correo asignado</span>}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{ent.phone || ent.institutionalPhone || <span className="text-slate-400 italic">Sin teléfono</span>}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    {ent.active !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3" /> Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
                        <XCircle className="w-3 h-3" /> Inactiva
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => navigate(`/admin/entidades/${ent.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Ver expediente institucional completo"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Expediente</span>
                    </button>

                    {userContext.role === 'admin' && (
                      <>
                        <button
                          onClick={() => openEditEntityModal(ent)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Editar perfil completo"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => openCreateUserModal(ent)}
                          className="px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                          title="Vincular servidor público a esta entidad"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ Servidor</span>
                        </button>

                        <button
                          onClick={() => toggleActive(ent)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                            ent.active !== false
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {ent.active !== false ? 'Desactivar' : 'Activar'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT ENTITY MODAL */}
      {showEntityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 space-y-4 my-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>{editingEntity ? `Editar Perfil: ${editingEntity.name}` : 'Registrar Nueva Entidad Institucional'}</span>
            </h3>

            <form onSubmit={handleSaveEntity} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>
                  El Administrador crea la entidad especificando únicamente su <strong>Nombre Completo</strong> y <strong>Tipo de Entidad</strong>. La descripción detallada, datos de contacto, horarios y el logo oficial serán completados directamente por los servidores de la entidad en su módulo <strong>Perfil Institucional</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nombre Completo de la Entidad:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Secretaría de Salud Municipal"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tipo de Entidad:</label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as EntityType)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Municipal">Municipal / Alcaldía Quibdó</option>
                    <option value="Departamental">Departamental / Gobernación del Chocó</option>
                    <option value="Nacional">Nacional / Gobierno Central</option>
                    <option value="Órgano de Control">Órgano de Control (Personería, Defensoría, etc.)</option>
                    <option value="Cooperación Internacional">Cooperación Internacional</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEntityModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg shadow-xs"
                >
                  {saving ? 'Guardando...' : 'Guardar Entidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE INSTITUTIONAL USER MODAL */}
      {showUserModal && targetEntityForUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 my-auto">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              <span>Vincular Servidor Público a {targetEntityForUser.sigla || targetEntityForUser.code}</span>
            </h3>

            <form onSubmit={handleCreateInstitutionalUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Nombre Completo del Servidor Público:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Dra. Patricia Mena"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Correo Electrónico Institucional:</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="patricia.mena@quibdo.gov.co"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña de Acceso: <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(100 + Math.random() * 900);
                      setUserPassword(`Quibdo${rand}*`);
                      setShowUserPassword(true);
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generar sugerida</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showUserPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Ej: Quibdo2026*"
                    className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPassword(!showUserPassword)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showUserPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Esta clave permitirá al servidor público iniciar sesión en la plataforma. Mínimo 6 caracteres.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Cargo u Oficio Institucional:</label>
                <input
                  type="text"
                  value={userPositionTitle}
                  onChange={(e) => setUserPositionTitle(e.target.value)}
                  placeholder="Ej: Enlace de Atención a Población Migrante"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Entidad Asignada Exclusiva:</label>
                <input
                  type="text"
                  value={`${targetEntityForUser.name} (${targetEntityForUser.sigla || targetEntityForUser.code})`}
                  disabled
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Regla de Aislamiento: Un usuario institucional solo puede pertenecer a una entidad.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 rounded-lg shadow-xs"
                >
                  {saving ? 'Viculando...' : 'Crear y Vincular Servidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 2 TEST SUITE RUNNER MODAL */}
      {showPhase2Tests && <Phase2TestRunnerModal onClose={() => setShowPhase2Tests(false)} />}
    </div>
  );
};
