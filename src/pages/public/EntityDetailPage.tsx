import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ArrowLeft,
  ChevronRight,
  Eye,
  FileText,
  Layers,
} from 'lucide-react';
import { Entity, AttentionRoute } from '../../types';
import { api } from '../../services/api';
import { matchEntity, slugify } from '../../utils/slug';
import { QuickViewModal } from '../../components/public/QuickViewModal';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';

export const EntityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [entity, setEntity] = useState<Entity | null>(null);
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewRoute, setQuickViewRoute] = useState<AttentionRoute | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [entitiesList, allRoutes] = await Promise.all([
          api.getEntities(),
          api.getRoutes({ publicOnly: true }),
        ]);

        const matched = matchEntity(slug, entitiesList);
        setEntity(matched || null);

        if (matched) {
          const entityRoutes = allRoutes.filter((r) => r.entityId === matched.id);
          setRoutes(entityRoutes);
        }
      } catch (err) {
        console.error('Error fetching entity detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Entidad No Encontrada
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          La entidad solicitada no se encuentra registrada o ha sido desactivada temporalmente en la plataforma.
        </p>
        <div className="pt-2">
          <Link
            to="/entidades"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Directorio de Entidades</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to="/entidades" className="hover:text-emerald-600 transition-colors">
            Entidades
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">
            {entity.code} - {entity.name}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <PIIWarningBanner compact />

        {/* Back link */}
        <div>
          <Link
            to="/entidades"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Directorio</span>
          </Link>
        </div>

        {/* Entity Profile Header Card */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
              {entity.logoUrl ? (
                <img src={entity.logoUrl} alt={entity.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{entity.code}</span>
                <span aria-hidden="true">·</span>
                <span>{entity.entityType || entity.entity_type || 'Dependencia Municipal'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white">
                {entity.name}
              </h1>
              {entity.description && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed max-w-3xl">
                  {entity.description}
                </p>
              )}
            </div>
          </div>

          {/* Contact and Service Hours Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Sede Principal</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{entity.address || 'Sin dirección física registrada'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Teléfono / PBX</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{entity.phone || 'Sin teléfono'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Correo Electrónico</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{entity.email || 'Sin correo asignado'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block font-medium">Horario de Atención</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{entity.serviceHours || entity.service_hours || entity.hours || 'Lunes a Viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.'}</span>
              </p>
            </div>

            {entity.website && (
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Sitio Web Oficial</span>
                <a
                  href={entity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 hover:underline flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{entity.website}</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Published Routes Section */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Procedimientos Activos
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Rutas Publicadas por esta Entidad ({routes.length})
              </h2>
            </div>

            <Link
              to={`/rutas?entityId=${entity.id}`}
              className="text-xs text-emerald-600 hover:underline font-medium"
            >
              Ver en catálogo
            </Link>
          </div>

          {routes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Esta entidad aún no registra rutas publicadas vigentes en el portal.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route) => {
                const routeSlug = slugify(route.name) || route.id;
                return (
                  <article
                    key={route.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Card Image */}
                      <div className="relative h-36 bg-slate-950 overflow-hidden">
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
                      </div>

                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <span>{route.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{route.channel}</span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                          {route.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {route.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                      <Link
                        to={`/rutas/${routeSlug}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs text-center transition-colors shadow-xs"
                      >
                        Ver ruta completa
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
        </section>
      </div>

      {/* Quick View Modal */}
      {quickViewRoute && (
        <QuickViewModal route={quickViewRoute} onClose={() => setQuickViewRoute(null)} />
      )}
    </div>
  );
};
