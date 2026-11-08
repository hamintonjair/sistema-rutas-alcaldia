import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  Building2,
  Clock,
  ArrowRight,
  Layers,
  Calendar,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { AttentionRoute, Entity, SystemConfig } from '../../types';
import { api } from '../../services/api';
import { QuickViewModal } from '../../components/public/QuickViewModal';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';
import { slugify } from '../../utils/slug';

interface RoutesCatalogPageProps {
  config: SystemConfig;
}

export const RoutesCatalogPage: React.FC<RoutesCatalogPageProps> = ({ config }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Sync
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialEntity = searchParams.get('entityId') || '';
  const initialChannel = searchParams.get('channel') || '';
  const initialPopulation = searchParams.get('population') || '';

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedEntityId, setSelectedEntityId] = useState(initialEntity);
  const [selectedChannel, setSelectedChannel] = useState(initialChannel);
  const [selectedPopulation, setSelectedPopulation] = useState(initialPopulation);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('');

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Data & Loading States
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick View Modal
  const [quickViewRoute, setQuickViewRoute] = useState<AttentionRoute | null>(null);

  // Pagination / Incremental loading
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search effect & fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sync search query parameter
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedEntityId) params.entityId = selectedEntityId;
      if (selectedChannel) params.channel = selectedChannel;
      if (selectedPopulation) params.population = selectedPopulation;
      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedEntityId, selectedChannel, selectedPopulation]);

  // Load public data
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRoutes, fetchedEntities] = await Promise.all([
        api.getRoutes({
          publicOnly: true, // ONLY PUBLISHED ROUTES
          search,
          category: selectedCategory,
          entityId: selectedEntityId,
          channel: selectedChannel,
          population: selectedPopulation,
        }),
        api.getEntities(),
      ]);
      setRoutes(fetchedRoutes);
      setEntities(fetchedEntities);
    } catch (err) {
      console.error('Error fetching routes catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [search, selectedCategory, selectedEntityId, selectedChannel, selectedPopulation]);

  // Client-side additional filters (response time, etc.)
  const filteredRoutes = useMemo(() => {
    let result = [...routes];

    if (selectedTimeFilter) {
      if (selectedTimeFilter === 'inmediato') {
        result = result.filter((r) =>
          r.estimatedResponseTime.toLowerCase().includes('inmediat') ||
          r.estimatedResponseTime.toLowerCase().includes('mismo día') ||
          r.estimatedResponseTime.toLowerCase().includes('15') ||
          r.estimatedResponseTime.toLowerCase().includes('minut')
        );
      } else if (selectedTimeFilter === '1-3dias') {
        result = result.filter((r) =>
          r.estimatedResponseTime.includes('1') ||
          r.estimatedResponseTime.includes('2') ||
          r.estimatedResponseTime.includes('3')
        );
      } else if (selectedTimeFilter === 'mas-dias') {
        result = result.filter((r) =>
          r.estimatedResponseTime.includes('5') ||
          r.estimatedResponseTime.includes('8') ||
          r.estimatedResponseTime.includes('10') ||
          r.estimatedResponseTime.includes('15')
        );
      }
    }

    return result;
  }, [routes, selectedTimeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active filters count
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedEntityId ? 1 : 0) +
    (selectedChannel ? 1 : 0) +
    (selectedPopulation ? 1 : 0) +
    (selectedTimeFilter ? 1 : 0) +
    (search ? 1 : 0);

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedEntityId('');
    setSelectedChannel('');
    setSelectedPopulation('');
    setSelectedTimeFilter('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Layers className="w-4 h-4" />
            <span>Catálogo Oficial de Procesos · Municipio de Quibdó</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Procesos de Atención Institucional Aprobados
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Consulte y filtre los procesos vigentes y aprobados para la población migrante en Quibdó. Toda la información ha sido validada directamente por las 19 entidades competentes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <PIIWarningBanner compact />

        {/* Search Bar & Mobile Filter Trigger Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por servicio, trámite, necesidad, entidad o palabras clave..."
              className="w-full pl-10 pr-9 py-2 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        {/* Main Grid: Sidebar Filters + Route Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* DESKTOP FILTERS SIDEBAR */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filtros de Búsqueda</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar ({activeFiltersCount})</span>
                  </button>
                )}
              </div>

              {/* 1. Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Categoría del Servicio
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todas las categorías</option>
                  {(config?.categories || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Entity Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Entidad Responsable
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todas las entidades ({entities.length})</option>
                  {(entities || []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.code} - {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Target Population Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Población Objetivo
                </label>
                <select
                  value={selectedPopulation}
                  onChange={(e) => setSelectedPopulation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todas las poblaciones</option>
                  {(config?.targetPopulations || []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Channel Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Canal de Atención
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Todos los canales</option>
                  {(config?.channels || []).map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Response Time Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Tiempo Estimado de Respuesta
                </label>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      checked={selectedTimeFilter === ''}
                      onChange={() => setSelectedTimeFilter('')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Cualquier tiempo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      checked={selectedTimeFilter === 'inmediato'}
                      onChange={() => setSelectedTimeFilter('inmediato')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Inmediato o el mismo día</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      checked={selectedTimeFilter === '1-3dias'}
                      onChange={() => setSelectedTimeFilter('1-3dias')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>1 a 3 días hábiles</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="timeFilter"
                      checked={selectedTimeFilter === 'mas-dias'}
                      onChange={() => setSelectedTimeFilter('mas-dias')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Mayor a 3 días</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* ROUTE CARDS GRID */}
          <main className="lg:col-span-3 space-y-6">
            {/* Results count & active query badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Mostrando <strong>{filteredRoutes.length}</strong> {filteredRoutes.length === 1 ? 'proceso aprobado' : 'procesos aprobados'}
              </span>

              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Filtros activos: {activeFiltersCount}</span>
                  <button
                    onClick={resetAllFilters}
                    className="text-emerald-600 hover:underline font-medium"
                  >
                    Restablecer
                  </button>
                </div>
              )}
            </div>

            {/* Loading Skeletons */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-pulse"
                  >
                    <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredRoutes.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No se encontraron procesos con los criterios seleccionados
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Intente buscar con otros términos, seleccionar otra entidad o restablecer los filtros aplicados.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              /* Grid of Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedRoutes.map((route) => {
                  const routeSlug = slugify(route.name) || route.id;
                  const isExpired = route.status === 'Vencida' || (route.nextReviewDate && new Date(route.nextReviewDate) < new Date());

                  return (
                    <article
                      key={route.id}
                      className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      <div>
                        {/* Card Image */}
                        <div className="relative h-40 bg-slate-950 overflow-hidden">
                          <img
                            src={
                              route.mainImageUrl ||
                              '/quibdo_alcaldia_logo.png'
                            }
                            alt={route.mainImageAlt || route.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                            }}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          {/* Entity Name Banner */}
                          <div className="absolute bottom-2 left-3 right-3 text-white">
                            <span className="text-[11px] font-medium text-emerald-300 block line-clamp-1">
                              {route.entityName}
                            </span>
                          </div>

                          {/* Expired / Update Notice if applicable */}
                          {isExpired && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                              <AlertTriangle className="w-3 h-3" />
                              <span>En revisión periódica</span>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Quiet metadata line */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span className="line-clamp-1">{route.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{route.channel}</span>
                          </div>

                          <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                            {route.name}
                          </h2>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            {route.description}
                          </p>

                          {/* Indicators info */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Respuesta: <strong>{route.estimatedResponseTime || '3 a 5 días'}</strong></span>
                              <span>{route.procedureSteps?.length || 0} pasos · {route.requirements?.length || 0} req.</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="truncate max-w-[180px]">Horario: {route.serviceHours || 'Lunes a Viernes 8:00 AM - 12:00 PM / 2:00 PM - 5:00 PM'}</span>
                              <span>Actualizada: {new Date(route.updatedAt || route.createdAt).toLocaleDateString('es-CO')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                        <Link
                          to={`/rutas/${routeSlug}`}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs text-center transition-colors shadow-xs"
                        >
                          Ver proceso completo
                        </Link>
                        <button
                          type="button"
                          onClick={() => setQuickViewRoute(route)}
                          className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Vista rápida</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-end lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filtros ({activeFiltersCount})</span>
              </span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Todas las categorías</option>
                {(config?.categories || []).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Entity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Entidad
              </label>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Todas las entidades</option>
                {(entities || []).map((e) => (
                  <option key={e.id} value={e.id}>{e.code} - {e.name}</option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Canal
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="">Todos los canales</option>
                {(config?.channels || []).map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs text-center"
              >
                Ver resultados ({filteredRoutes.length})
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium text-center"
                >
                  Restablecer filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewRoute && (
        <QuickViewModal route={quickViewRoute} onClose={() => setQuickViewRoute(null)} />
      )}
    </div>
  );
};
