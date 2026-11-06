import React, { useState } from 'react';
import { Users, Plus, Shield, CheckCircle, XCircle, Search, Eye, EyeOff, Key, Sparkles, AlertCircle } from 'lucide-react';
import { User, Entity, Role } from '../../types';
import { api, UserContext } from '../../services/api';

interface UsersManagerProps {
  users: User[];
  entities: Entity[];
  userContext: UserContext;
  onRefresh: () => void;
}

const normalizeRole = (r?: string): Role => {
  const val = (r || '').toLowerCase().trim();
  if (val.includes('admin') || val === 'administrador' || val === 'admin') return 'admin';
  return 'institutional';
};

export const UsersManager: React.FC<UsersManagerProps> = ({ users, entities, userContext, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [localEntities, setLocalEntities] = useState<Entity[]>(entities || []);

  React.useEffect(() => {
    if (entities && entities.length > 0) {
      setLocalEntities(entities);
    } else {
      api.getEntities().then((res) => {
        if (res && res.length > 0) setLocalEntities(res);
      }).catch(console.error);
    }
  }, [entities]);

  const availableEntities = entities && entities.length > 0 ? entities : localEntities;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('institutional');
  const [entityId, setEntityId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRole('institutional');
    setEntityId(availableEntities[0]?.id || '');
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = async (u: User) => {
    setEditingUser(u);
    setName(u.name || '');
    setEmail(u.email || '');
    setPassword('');
    setShowPassword(false);
    
    const normRole = normalizeRole(u.role_code || u.role);
    setRole(normRole);

    let entsList = availableEntities;
    if (!entsList || entsList.length === 0) {
      try {
        entsList = await api.getEntities();
        setLocalEntities(entsList);
      } catch (e) {
        console.error('Error fetching entities for edit modal:', e);
      }
    }

    let matchedEntId = u.entityId || u.entity_id || '';
    if (!matchedEntId && (u.entityName || u.entity_name)) {
      const targetName = (u.entityName || u.entity_name || '').toLowerCase().trim();
      const match = (entsList || []).find(e => e.name.toLowerCase().trim() === targetName);
      if (match) matchedEntId = match.id;
    }
    setEntityId(matchedEntId || entsList[0]?.id || '');
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanRole = normalizeRole(role);

    if (!cleanName || !cleanEmail) {
      setFormError('El nombre completo y correo institucional son obligatorios.');
      return;
    }

    if (!editingUser) {
      if (!cleanPassword) {
        setFormError('La contraseña de acceso es obligatoria para registrar un nuevo usuario.');
        return;
      }
      if (cleanPassword.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    } else {
      if (cleanPassword && cleanPassword.length < 6) {
        setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    if (cleanRole !== 'admin' && !entityId) {
      setFormError('Debe asignar una entidad institucional al usuario.');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await api.updateUser(
          editingUser.id,
          {
            name: cleanName,
            email: cleanEmail,
            role: cleanRole,
            entityId: cleanRole !== 'admin' ? entityId : undefined,
            ...(cleanPassword ? { password: cleanPassword } : {}),
          },
          userContext
        );
        setActionSuccess(`Usuario "${cleanName}" actualizado exitosamente.`);
      } else {
        await api.createUser(
          {
            name: cleanName,
            email: cleanEmail,
            role: cleanRole,
            entityId: cleanRole !== 'admin' ? entityId : undefined,
            password: cleanPassword,
          },
          userContext
        );
        setActionSuccess(`Usuario "${cleanName}" creado exitosamente con sus credenciales de acceso.`);
      }
      onRefresh();
      setShowModal(false);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.entityName && u.entityName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por usuario, correo o entidad..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {userContext.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-slate-900 text-white dark:bg-emerald-600 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario Institucional</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Nombre del Servidor Público</th>
                <th className="p-3">Correo Institucional</th>
                <th className="p-3">Rol del Sistema</th>
                <th className="p-3">Entidad Asignada</th>
                <th className="p-3">Estado</th>
                {userContext.role === 'admin' && <th className="p-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {normalizeRole(u.role_code || u.role) === 'admin'
                        ? 'Administrador'
                        : 'Institucional'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{u.entityName || 'Administración General'}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3" /> Activo
                    </span>
                  </td>
                  {userContext.role === 'admin' && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              {editingUser ? 'Editar Usuario' : 'Crear Usuario Institucional'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nombre Completo y Cargo: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lic. María Pérez (Enlace Salud)"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Correo Institucional Oficial: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: enlace.migrantes@quibdo.gov.co"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    {editingUser ? 'Nueva Contraseña:' : 'Contraseña de Acceso:'} {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  {!editingUser ? (
                    <button
                      type="button"
                      onClick={() => {
                        const randomNum = Math.floor(100 + Math.random() * 900);
                        setPassword(`Quibdo${randomNum}*`);
                        setShowPassword(true);
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generar sugerida</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Opcional</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? 'Dejar en blanco para mantener la contraseña actual' : 'Ej: Quibdo2026*'}
                    className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required={!editingUser}
                    minLength={6}
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {editingUser
                    ? 'Si no desea cambiar la contraseña actual del usuario, deje este campo vacío.'
                    : 'Esta contraseña permitirá al usuario iniciar sesión en el sistema. Mínimo 6 caracteres.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Rol en la Plataforma:</label>
                <select
                  value={role === 'admin' ? 'admin' : 'institutional'}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="institutional">Usuario Institucional (Acceso exclusivo a su entidad)</option>
                  <option value="admin">Administrador General (Control total)</option>
                </select>
              </div>

              {role !== 'admin' && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Entidad Asignada: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  >
                    <option value="">-- Seleccionar Entidad --</option>
                    {availableEntities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                  {availableEntities.length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      Cargando lista de entidades...
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {saving ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
