import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  FileText,
  UserCheck,
  Users,
  Compass,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Briefcase,
  Home,
  Scale,
} from 'lucide-react';
import { AttentionRoute, Entity, SystemConfig } from '../../types';
import { api } from '../../services/api';
import { QuickViewModal } from '../../components/public/QuickViewModal';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';
import { slugify } from '../../utils/slug';

interface PublicHomePageProps {
  config: SystemConfig;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({ config }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewRoute, setQuickViewRoute] = useState<AttentionRoute | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedRoutes, fetchedEntities] = await Promise.all([
          api.getRoutes({ publicOnly: true }),
          api.getEntities(),
        ]);
        setRoutes(fetchedRoutes);
        setEntities(fetchedEntities);
      } catch (err) {
        console.error('Error fetching public home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/rutas?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/rutas');
    }
  };

  // Thematic Category mapping with icons
  const categoryIcons: Record<string, any> = {
    'Educación e Inclusión Escolar': GraduationCap,
    'Salud y Afiliación al SGSSS': HeartPulse,
    'Protección de Niñez y Familia': ShieldCheck,
    'Regularización y ETPV': UserCheck,
    'Focalización y Sisbén': FileText,
    'Orientación Jurídica y DDHH': Scale,
    'Asistencia Humanitaria Inmediata': Users,
    'Empleabilidad y Formación SENA': Briefcase,
    'Hábitat y Vivienda Dignas': Home,
  };

  // Compute published routes count per category
  const categoryCounts = config.categories.reduce((acc, cat) => {
    acc[cat] = routes.filter((r) => r.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Featured routes (take up to 3 published routes)
  const featuredRoutes = routes.slice(0, 3);

  // Formatted date of last general update
  const latestUpdate = routes.length > 0
    ? new Date(Math.max(...routes.map((r) => new Date(r.updatedAt || r.createdAt).getTime())))
    : new Date();
  const formattedUpdate = latestUpdate.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION WITH INSTITUTIONAL HEADER & SEARCH */}
      <section className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10 space-y-6">
          {/* Institutional badge & jurisdiction */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Alcaldía Municipal de Quibdó · Departamento del Chocó</span>
          </div>

          {/* 2. Official Platform Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-white leading-tight max-w-4xl">
            Ruta Estratégica para la Atención Integral de la Población Migrante
          </h1>

          {/* 3. Brief Citizen Explanation */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Portal oficial y centralizado de la institucionalidad de Quibdó para conocer cómo acceder a salud, matrícula escolar, regularización migratoria, Sisbén, protección de la niñez y derechos fundamentales. Consulta requisitos, sedes, canales y pasos sin intermediarios.
          </p>

          {/* 4. Main Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl pt-2">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 absolute left-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="¿Qué servicio o trámite buscas? (Ej: Cupo escolar, Sisbén, PPT, Salud...)"
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <span>Buscar rutas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
              <span className="font-medium text-slate-300">Búsquedas frecuentes:</span>
              {['Matrícula escolar', 'Afiliación a EPS', 'Sisbén IV', 'PPT Migración', 'Vacunación'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/rutas?search=${encodeURIComponent(tag)}`)}
                  className="hover:text-emerald-300 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* 10. Data Protection Notice */}
        <PIIWarningBanner compact />

        {/* 6. QUICK ACCESS CITIZEN TRÁMITES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Orientación Prioritaria
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Accesos Rápidos a Trámites Esenciales
              </h2>
            </div>
            <Link
              to="/rutas"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todas las rutas ({routes.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/rutas?category=Salud y Afiliación al SGSSS"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Salud y Urgencias
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Acceso a EPS del régimen subsidiado, atención de urgencias vitales y control prenatal.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-4 inline-flex items-center gap-1">
                Consultar requisitos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/rutas?category=Educación e Inclusión Escolar"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Cupos Escolares
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Matrícula sin barreras para niños, niñas y adolescentes en colegios oficiales de Quibdó.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-4 inline-flex items-center gap-1">
                Consultar requisitos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/rutas?category=Focalización y Sisbén"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Sisbén IV
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Solicitud de encuesta socioeconómica municipal y asignación de grupo poblacional.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-4 inline-flex items-center gap-1">
                Consultar requisitos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              to="/rutas?category=Regularización y ETPV"
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    Regularización PPT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    Estatuto Temporal de Protección (ETPV), entrega de documentos y biometría en Quibdó.
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-4 inline-flex items-center gap-1">
                Consultar requisitos <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </section>

        {/* 5. THEMATIC ATTENTION CATEGORIES */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Áreas de Atención Institucional
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              Consulta por Categoría de Servicio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Las entidades públicas del municipio de Quibdó organizan sus procedimientos de atención en 9 ejes temáticos prioritarios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.categories.map((category) => {
              const Icon = categoryIcons[category] || Compass;
              const count = categoryCounts[category] || 0;

              return (
                <Link
                  key={category}
                  to={`/rutas?category=${encodeURIComponent(category)}`}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all flex items-start gap-3.5 group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {category}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{count} {count === 1 ? 'ruta aprobada' : 'rutas aprobadas'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 7. FEATURED PUBLISHED ROUTES */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Procedimientos Oficiales
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Rutas Destacadas de Atención
              </h2>
            </div>
            <Link
              to="/rutas"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explorar catálogo completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : featuredRoutes.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              Actualmente no hay rutas públicas destacadas disponibles.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRoutes.map((route) => {
                const routeSlug = slugify(route.name) || route.id;
                return (
                  <article
                    key={route.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    {/* Route Image */}
                    <div className="relative h-40 bg-slate-950 overflow-hidden">
                      <img
                        src={
                          route.mainImageUrl ||
                          '/src/assets/images/quibdo_alcaldia_logo_1793464458662.jpg'
                        }
                        alt={route.mainImageAlt || route.name}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <span className="text-[11px] font-medium text-emerald-300 block line-clamp-1">
                          {route.entityName}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Quiet metadata line */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="line-clamp-1">{route.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{route.channel}</span>
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                          {route.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {route.description}
                        </p>
                      </div>

                      {/* Key Indicators */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Tiempo: <strong>{route.estimatedResponseTime || 'Inmediato'}</strong></span>
                        <span>{route.requirements?.length || 0} requisitos</span>
                      </div>

                      {/* Actions */}
                      <div className="pt-1 flex items-center gap-2">
                        <Link
                          to={`/rutas/${routeSlug}`}
                          className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs text-center transition-colors shadow-xs"
                        >
                          Ver ruta completa
                        </Link>
                        <button
                          type="button"
                          onClick={() => setQuickViewRoute(route)}
                          className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                        >
                          Vista rápida
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 8. PARTICIPATING INSTITUTIONS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Mesa Interinstitucional
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                Entidades Participantes de la Ruta
              </h2>
            </div>
            <Link
              to="/entidades"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Ver todas las entidades ({entities.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {entities.slice(0, 12).map((entity) => (
              <Link
                key={entity.id}
                to={`/entidades/${slugify(entity.code) || entity.id}`}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 overflow-hidden">
                  {entity.logoUrl ? (
                    <img src={entity.logoUrl} alt={entity.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {entity.code}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {entity.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 9. MUNICIPAL CONTACT INFORMATION & 11. LAST GENERAL UPDATE */}
        <section className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Municipal Seat */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>Alcaldía Municipal de Quibdó</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Secretaría de Gobierno y Secretaría Coordinadora de la Ruta de Atención a Población Migrante.
              </p>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Carrera 2 No. 24-45, Palacio Municipal, Quibdó - Chocó</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PBX Municipal: (604) 671 0000 · Línea Gratuita: 01 8000 910 120</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>contacto@quibdo-choco.gov.co</span>
                </div>
              </div>
            </div>

            {/* Column 2: Service Hours & Schedule */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Horario General de Atención</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1.5">
                <p><strong>Lunes a Viernes:</strong></p>
                <p>8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.</p>
                <p className="text-slate-400 text-[11px] pt-1">
                  Atención prioritaria para mujeres gestantes, personas con discapacidad y adultos mayores.
                </p>
              </div>
            </div>

            {/* Column 3: Platform Transparency & 11. General Update Date */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Calendar className="w-4 h-4" />
                <span>Vigencia y Actualización</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  <strong>Última actualización general:</strong> {formattedUpdate}
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Las rutas y requisitos son actualizados periódicamente por los enlaces institucionales acreditados ante el Municipio de Quibdó.
                </p>
                <div className="pt-1">
                  <Link
                    to="/reportar-informacion"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 underline font-medium"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>¿Información desactualizada? Reportar novedad</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      {quickViewRoute && (
        <QuickViewModal route={quickViewRoute} onClose={() => setQuickViewRoute(null)} />
      )}
    </div>
  );
};
