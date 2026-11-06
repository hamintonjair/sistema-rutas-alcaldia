import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Terminal,
  Calendar,
  Building2,
  RefreshCw,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { AttentionRoute, Entity, RouteState, SystemConfig } from '../../types';
import { api, UserContext } from '../../services/api';
import { RouteStatusBadge } from '../../components/common/RouteStatusBadge';
import { RouteFormModal } from '../../components/institutional/RouteFormModal';
import { RoutePreviewModal } from '../../components/public/RoutePreviewModal';
import { Phase3TestRunnerModal } from '../../components/institutional/Phase3TestRunnerModal';

interface InstitutionalRoutesPageProps {
  userContext: UserContext;
}

export const InstitutionalRoutesPage: React.FC<InstitutionalRoutesPageProps> = ({ userContext }) => {
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // View Preferences
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<AttentionRoute | null>(null);
  const [previewRoute, setPreviewRoute] = useState<AttentionRoute | null>(null);
  const [showPhase3Tests, setShowPhase3Tests] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, e, c] = await Promise.all([
        api.getRoutes({ entityId: userContext.entityId }),
        api.getEntities(),
        api.getConfig(),
      ]);

      // Tenant isolation filter: institutional user ONLY sees their entity routes
      const filteredForUser = r.filter((item) => {
        if (userContext.role === 'institutional' && userContext.entityId) {
          return item.entityId === userContext.entityId;
        }
        return true;
      });

      setRoutes(filteredForUser);
      setEntities(e);
      setConfig(c);
      setEditingRoute((prev) => (prev ? filteredForUser.find((x) => x.id === prev.id) || prev : null));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  // Dynamic route completeness checker
  const calculateRouteIncomplete = (r: AttentionRoute): string[] => {
    const inc: string[] = [];
    if (!r.name?.trim()) inc.push('Nombre de la ruta');
    if (!r.serviceName?.trim()) inc.push('Nombre del servicio');
    if (!r.category?.trim()) inc.push('Categoría');
    if (!r.description?.trim()) inc.push('Descripción institucional');
    const channels = r.channels && r.channels.length > 0 ? r.channels : (r.channel ? [r.channel] : []);
    if (channels.length === 0) inc.push('Mínimo un canal de atención');
    if (!r.institutionalAddress?.trim() && !r.institutionalEmail?.trim()) inc.push('Dirección o Correo institucional');
    return inc;
  };

  const filteredRoutes = routes.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setEditingRoute(null);
    setShowFormModal(true);
  };

  const handleEdit = (r: AttentionRoute) => {
    const fresh = routes.find((item) => item.id === r.id) || r;
    setEditingRoute(fresh);
    setShowFormModal(true);
  };

  const handleTogglePublish = async (r: AttentionRoute) => {
    const isCurrentlyPublished = r.status === 'Publicada';
    const targetStatus: RouteState = isCurrentlyPublished ? 'Borrador' : 'Publicada';

    if (targetStatus === 'Publicada') {
      const inc = calculateRouteIncomplete(r);
      if (inc.length > 0) {
        alert(`Para publicar la ruta debe completar los siguientes campos obligatorios: ${inc.join(', ')}.`);
        return;
      }
    }

    // Optimistically update status in UI immediately
    setRoutes((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: targetStatus, incompleteFields: [], updatedAt: new Date().toISOString() } : item))
    );

    try {
      await api.changeRouteStatus(r.id, targetStatus, `Cambio directo de estado a ${targetStatus}`, userContext);
      await loadData();
    } catch (err: any) {
      // Revert on error
      setRoutes((prev) =>
        prev.map((item) => (item.id === r.id ? { ...item, status: r.status } : item))
      );
      alert(err.message || 'Error al actualizar el estado de la ruta.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Catálogo Institucional
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {userContext.entityName || 'Mi Entidad'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Mis Rutas de Atención Institucional
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Cree, modifique y publique las rutas de atención oficiales de su entidad.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateNew}
              className="px-3.5 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Nueva Ruta</span>
            </button>
          </div>
        </div>

        {/* Dynamic counters */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Mis Rutas</span>
            <span className="text-xl font-bold text-white font-mono">{routes.length}</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">En Borrador</span>
            <span className="text-xl font-bold text-amber-300 font-mono">
              {routes.filter((r) => r.status === 'Borrador').length}
            </span>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] font-bold uppercase text-emerald-400 block">Publicadas</span>
            <span className="text-xl font-bold text-emerald-300 font-mono">
              {routes.filter((r) => r.status === 'Publicada').length}
            </span>
          </div>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, servicio o categoría..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          >
            <option value="all">Todos los Estados</option>
            <option value="Publicada">Publicadas</option>
            <option value="Borrador">Borradores</option>
            <option value="Archivada">Archivadas</option>
          </select>

          {/* Toggle View Mode */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Vista en Cuadrícula de Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Vista en Tabla Administrativa"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content View (Grid or Table) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-semibold text-sm">No se encontraron rutas con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredRoutes.map((r) => {
              const isReadOnly = r.status === 'En revisión' || r.status === 'Publicada';
              const incFields = calculateRouteIncomplete(r);
              const isIncomplete = incFields.length > 0;

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  {/* Card Image Header */}
                  <div className="relative h-40 bg-slate-900 overflow-hidden">
                    <img
                      src={r.mainImageUrl || '/src/assets/images/quibdo_alcaldia_logo_1793464458662.jpg'}
                      alt={r.mainImageAlt || r.name}
                      className="w-full h-full object-cover opacity-70"
                      onError={(e) => {
                        if (r.mainImageUrl && !e.currentTarget.src.includes('/api/storage/proxy')) {
                          e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(r.mainImageUrl)}`;
                        }
                      }}
                    />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-xs font-mono uppercase">
                          {r.category}
                        </span>
                        {r.galleryImages && r.galleryImages.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 backdrop-blur-xs flex items-center gap-1" title={`${r.galleryImages.length} fotografías en galería`}>
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            <span>{r.galleryImages.length} fotos</span>
                          </span>
                        )}
                      </div>
                      <RouteStatusBadge status={r.status} />
                    </div>

                    {isIncomplete && (
                      <div className="absolute bottom-2 left-3 right-3 bg-amber-950/90 text-amber-200 text-[10px] px-2.5 py-1 rounded-md font-semibold border border-amber-700/60 backdrop-blur-xs flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                        <span className="truncate">Campos requeridos: {incFields.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3 flex-1">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        {r.serviceName}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                        {r.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-400 font-sans">Actualizado:</span>
                        <span>{new Date(r.updatedAt).toLocaleDateString('es-CO')}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-400 font-sans">Próxima Revisión:</span>
                        <span>{r.nextReviewDate ? new Date(r.nextReviewDate).toLocaleDateString('es-CO') : 'Pendiente'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewRoute(r)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                      title="Ver previsualización pública"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Previsualizar</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleTogglePublish(r)}
                        disabled={r.status !== 'Publicada' && isIncomplete}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs ${
                          r.status === 'Publicada'
                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40'
                        }`}
                        title={
                          r.status === 'Publicada'
                            ? 'Pasar a borrador'
                            : isIncomplete
                            ? 'Complete los campos obligatorios antes de publicar'
                            : 'Publicar directamente'
                        }
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{r.status === 'Publicada' ? 'Despublicar' : 'Publicar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Nombre de la Ruta</th>
                  <th className="p-3.5">Servicio</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Última Modificación</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <RouteStatusBadge status={r.status} />
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">{r.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{r.serviceName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">{r.category}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {new Date(r.updatedAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setPreviewRoute(r)}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
                      >
                        Vista previa
                      </button>
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleTogglePublish(r)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                          r.status === 'Publicada'
                            ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {r.status === 'Publicada' ? 'Despublicar' : 'Publicar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Route Form Modal */}
      {showFormModal && (
        <RouteFormModal
          route={editingRoute}
          entities={entities}
          config={config || ({} as any)}
          userContext={userContext}
          onClose={() => setShowFormModal(false)}
          onSaveSuccess={loadData}
        />
      )}

      {/* Route Public Preview Modal */}
      {previewRoute && <RoutePreviewModal route={previewRoute} onClose={() => setPreviewRoute(null)} />}

      {/* Phase 3 Test Runner Modal */}
      {showPhase3Tests && <Phase3TestRunnerModal onClose={() => setShowPhase3Tests(false)} />}
    </div>
  );
};
