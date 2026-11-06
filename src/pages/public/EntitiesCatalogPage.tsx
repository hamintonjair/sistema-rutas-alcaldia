import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Filter,
  CheckCircle,
  Shield,
  Layers,
} from 'lucide-react';
import { Entity, AttentionRoute, EntityType } from '../../types';
import { api } from '../../services/api';
import { slugify } from '../../utils/slug';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';

export const EntitiesCatalogPage: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedEntities, fetchedRoutes] = await Promise.all([
          api.getEntities(),
          api.getRoutes({ publicOnly: true }),
        ]);
        setEntities(fetchedEntities);
        setRoutes(fetchedRoutes);
      } catch (err) {
        console.error('Error fetching entities catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const entityTypes: Array<{ label: string; value: string }> = [
    { label: 'Todas las Entidades', value: 'all' },
    { label: 'Municipal', value: 'Municipal' },
    { label: 'Departamental', value: 'Departamental' },
    { label: 'Nacional', value: 'Nacional' },
    { label: 'Órganos de Control', value: 'Órgano de Control' },
    { label: 'Fuerza Pública', value: 'Fuerza Pública' },
    { label: 'Cooperación Internacional', value: 'Cooperación Internacional' },
  ];

  // Route counts by entityId
  const routeCountsByEntity = useMemo(() => {
    return routes.reduce((acc, r) => {
      acc[r.entityId] = (acc[r.entityId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [routes]);

  const filteredEntities = useMemo(() => {
    return entities.filter((ent) => {
      if (!ent.active) return false;

      // Filter by type
      if (selectedType !== 'all') {
        const typeMatch =
          ent.entityType === selectedType ||
          ent.entity_type === selectedType ||
          (selectedType === 'Municipal' && (!ent.entityType || ent.entityType === 'Municipal'));
        if (!typeMatch) return false;
      }

      // Filter by search (name or code)
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchesName = ent.name.toLowerCase().includes(s);
        const matchesCode = ent.code.toLowerCase().includes(s);
        const matchesSigla = ent.sigla ? ent.sigla.toLowerCase().includes(s) : false;
        if (!matchesName && !matchesCode && !matchesSigla) return false;
      }

      return true;
    });
  }, [entities, selectedType, search]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-8 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Mesa Interinstitucional Municipal de Quibdó</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Directorio de Entidades de la Ruta
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Conozca las 19 dependencias municipales, entidades del orden departamental, nacional y agencias cooperantes encargadas de coordinar y prestar los servicios de la ruta para la población migrante en Quibdó.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <PIIWarningBanner compact />

        {/* Search & Type Filter Bar */}
        <div className="space-y-4">
          <div className="relative max-w-2xl">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar entidad por nombre o sigla (Ej: Educación, SISBÉN, Migración Colombia...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>

          {/* Type Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
            {entityTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedType === t.value
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entities Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 text-xs">
            No se encontraron entidades con el filtro ingresado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEntities.map((ent) => {
              const entSlug = slugify(ent.code) || ent.id;
              const routesCount = routeCountsByEntity[ent.id] || 0;

              return (
                <div
                  key={ent.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top: Logo & Sigla */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {ent.logoUrl ? (
                          <img
                            src={ent.logoUrl}
                            alt={ent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors block">
                          {ent.code}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {ent.entityType || ent.entity_type || 'Municipal'}
                        </span>
                      </div>
                    </div>

                    {/* Name & Address */}
                    <div className="space-y-1">
                      <h2 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {ent.name}
                      </h2>

                      {ent.address && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 pt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{ent.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer with Route Count and Action Button */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      <strong>{routesCount}</strong> {routesCount === 1 ? 'ruta publicada' : 'rutas publicadas'}
                    </span>

                    <Link
                      to={`/entidades/${entSlug}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>Ver rutas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
