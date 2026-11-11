import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Building2,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FileText,
  MapPin,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { AttentionRoute, Entity, SystemConfig } from '../../types';
import { api } from '../../services/api';
import { RouteDetailModal } from './RouteDetailModal';
import { PIIWarningBanner } from '../common/PIIWarningBanner';

interface PublicPortalProps {
  config: SystemConfig;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ config }) => {
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<AttentionRoute | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPopulation, setSelectedPopulation] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');

  const loadPublicData = async () => {
    setLoading(true);
    try {
      const [fetchedRoutes, fetchedEntities] = await Promise.all([
        api.getRoutes({
          publicOnly: true, // STRICTLY PUBLIC APPROVED & PUBLISHED ROUTES
          search,
          entityId: selectedEntityId,
          category: selectedCategory,
          population: selectedPopulation,
          channel: selectedChannel,
        }),
        api.getEntities(),
      ]);
      setRoutes(fetchedRoutes);
      setEntities(fetchedEntities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();
  }, [search, selectedEntityId, selectedCategory, selectedPopulation, selectedChannel]);

  const resetFilters = () => {
    setSearch('');
    setSelectedEntityId('');
    setSelectedCategory('');
    setSelectedPopulation('');
    setSelectedChannel('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Alcaldía Municipal de Quibdó - Chocó</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-tight text-white max-w-3xl">
            Ruta Estratégica para la Atención Integral de la Población Refugiada y Migrante en Quibdó
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Portal institucional de consulta ciudadana para acceder a los servicios, requisitos, canales de atención y procedimientos oficiales aprobados por las entidades públicas del Municipio de Quibdó.
          </p>

          {/* Search Input Box */}
          <div className="pt-2 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por servicio, trámite, necesidad o entidad (Ej: Matrícula, Salud, Sisbén, PPT...)"
                className="w-full pl-12 pr-4 py-3 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-xs text-slate-500 hover:text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded-md"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* PII Notice */}
        <PIIWarningBanner compact />

        {/* Filter Controls Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filtros de Búsqueda Institucional</span>
            </div>

            {(selectedEntityId || selectedCategory || selectedPopulation || selectedChannel || search) && (
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restablecer Filtros</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Filter 1: Entidad (All 19) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Entidad Responsable ({entities.length}):
              </label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Todas las Entidades (19)</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Categoría */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Categoría del Servicio:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Todas las Categorías</option>
                {(config?.categories || []).map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Población Objetivo */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Población Objetivo:
              </label>
              <select
                value={selectedPopulation}
                onChange={(e) => setSelectedPopulation(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Cualquier Población</option>
                {(config?.targetPopulations || []).map((pop, idx) => (
                  <option key={idx} value={pop}>
                    {pop}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: Canal de Atención */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Canal de Atención:
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Todos los Canales</option>
                {(config?.channels || []).map((ch, idx) => (
                  <option key={idx} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Rutas de Atención Aprobadas y Publicadas ({routes.length})
          </div>
          <span className="text-xs text-slate-500">
            Únicamente información verificada e institucional
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Cargando rutas de atención aprobadas...</p>
          </div>
        ) : routes.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3 max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No se encontraron rutas aprobadas con estos criterios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Intente borrando los términos de búsqueda o seleccionando otra entidad o categoría.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Ver todas las rutas publicadas
            </button>
          </div>
        ) : (
          /* Routes Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 truncate">
                      {route.entityName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                      {route.channel}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {route.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {route.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate"><strong>Servicio:</strong> {route.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span><strong>Tiempo de Respuesta:</strong> {route.estimatedResponseTime}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {route.procedureSteps?.length || 0} pasos • {route.requirements?.length || 0} requisitos
                  </span>

                  <button
                    onClick={() => setSelectedRoute(route)}
                    className="font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Ver Ruta Completa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRoute && (
        <RouteDetailModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          config={config}
        />
      )}
    </div>
  );
};
