import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
  ArrowLeft,
  Plus,
  Edit2,
  KeyRound,
  Shield,
  UserCheck,
  XCircle,
  Eye,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';
import { Entity, User, AttentionRoute, EntityProgressIndicators } from '../../types';
import { RouteStatusBadge } from '../../components/common/RouteStatusBadge';
import { RoutePreviewModal } from '../../components/public/RoutePreviewModal';

interface AdminEntityDetailPageProps {
  userContext: UserContext;
}

export const AdminEntityDetailPage: React.FC<AdminEntityDetailPageProps> = ({ userContext }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{
    entity: Entity;
    users: User[];
    routes: AttentionRoute[];
    indicators: EntityProgressIndicators;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'indicators' | 'users' | 'routes'>('indicators');
  const [selectedRouteForModal, setSelectedRouteForModal] = useState<AttentionRoute | null>(null);

  const loadEntityDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const json = await api.getEntityDetail(id);
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntityDetail();
  }, [id]);

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Cargando expediente de la entidad...</div>;
  }

  if (!data || !data.entity) {
    return (
      <div className="py-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Entidad no encontrada</h3>
        <Link to="/admin/entidades" className="text-xs text-emerald-600 hover:underline">
          Volver a la lista de entidades
        </Link>
      </div>
    );
  }

  const { entity, users, routes, indicators } = data;

  const handleResetPassword = async (usr: User) => {
    if (confirm(`¿Desea restablecer las credenciales del usuario ${usr.name}?`)) {
      try {
        const res = await api.resetUserPassword(usr.id, userContext);
        alert(res.message);
      } catch (err: any) {
        alert(err.message || 'Error al restablecer contraseña.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/entidades"
          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Lista de Entidades</span>
        </Link>

        <span className="text-xs text-slate-500">
          ID Entidad: <strong className="font-mono text-slate-800 dark:text-slate-200">{entity.id}</strong>
        </span>
      </div>

      {/* Entity Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="bg-slate-900 text-white p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={entity.logoUrl || entity.logo_url || '/src/assets/images/quibdo_alcaldia_logo_1793464458662.jpg'}
                alt={entity.name}
                className="w-16 h-16 rounded-xl bg-white p-1 object-contain border border-slate-700 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                    {entity.sigla || entity.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {entity.entityType || entity.entity_type || 'Municipal'}
                  </span>
                  {entity.active ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Activa
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Inactiva
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">{entity.name}</h1>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                  {entity.description || 'Sin descripción institucional registrada.'}
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-1">
              <span className="text-slate-400 block text-[10px]">Responsable Institucional:</span>
              <strong className="text-slate-100 block">{entity.primaryResponsible || entity.primary_responsible || 'Por asignar'}</strong>
            </div>
          </div>

          {/* Contact Strip */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{entity.address || entity.institutionalAddress || 'Sin dirección física'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{entity.phone || entity.institutionalPhone || 'Sin teléfono'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{entity.email || entity.institutionalEmail || 'Sin correo asignado'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{entity.website || 'Sin sitio web'}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-semibold bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('indicators')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'indicators'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Indicadores de Avance</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios Asociados ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'routes'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rutas Creadas ({routes.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: INDICATORS */}
          {activeTab === 'indicators' && (
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Indicadores Específicos de Avance para {entity.name}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Rutas</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{indicators.totalRoutes}</div>
                </div>

                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Publicadas</span>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{indicators.publishedCount}</div>
                </div>

                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block">Aprobadas</span>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{indicators.approvedCount}</div>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">En Revisión</span>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{indicators.inReviewCount}</div>
                </div>

                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 block">Borradores</span>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{indicators.draftsCount}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <h4 className="font-bold text-amber-950 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Observaciones Técnicas Pendientes de Responder</span>
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300">
                    {indicators.pendingObservationsCount > 0
                      ? `La entidad tiene ${indicators.pendingObservationsCount} observaciones recibidas en rutas devueltas.`
                      : 'No hay observaciones pendientes de respuesta para esta entidad.'}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Compromisos Institucionales Registrados</span>
                  </h4>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    {indicators.pendingCommitmentsCount > 0
                      ? `La entidad registra ${indicators.pendingCommitmentsCount} compromisos activos para el cumplimiento de la Ruta.`
                      : 'Sin compromisos registrados.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS LIST FOR THIS ENTITY */}
          {activeTab === 'users' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Servidores Públicos Asignados a {entity.name} ({users.length})
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Nombre Completo</th>
                      <th className="p-3">Cargo</th>
                      <th className="p-3">Correo Institucional</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          No hay usuarios asignados actualmente a esta entidad.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{u.positionTitle || 'Enlace'}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Activo
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleResetPassword(u)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 ml-auto"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                              <span>Restablecer Acceso</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTES CREATED BY THIS ENTITY */}
          {activeTab === 'routes' && (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Catálogo de Rutas Registradas por {entity.name} ({routes.length})
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Nombre de la Ruta</th>
                      <th className="p-3">Servicio</th>
                      <th className="p-3">Canal</th>
                      <th className="p-3">Pasos</th>
                      <th className="p-3">Última Actualización</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {routes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          Esta entidad no ha creado rutas de atención aún.
                        </td>
                      </tr>
                    ) : (
                      routes.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3">
                            <RouteStatusBadge status={r.status} />
                          </td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{r.name}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{r.serviceName}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{r.channel}</td>
                          <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{r.procedureSteps?.length || 0}</td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(r.updatedAt).toLocaleDateString('es-CO')}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedRouteForModal(r)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ver Contenido</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Route Preview Modal */}
      {selectedRouteForModal && (
        <RoutePreviewModal route={selectedRouteForModal} onClose={() => setSelectedRouteForModal(null)} />
      )}
    </div>
  );
};
