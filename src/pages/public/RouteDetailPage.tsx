import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Share2,
  Printer,
  Download,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { AttentionRoute, Entity, SystemConfig } from '../../types';
import { api } from '../../services/api';
import { matchRoute, matchEntity, slugify } from '../../utils/slug';
import { exportRouteToPDF } from '../../utils/exportUtils';
import { ImageLightboxModal } from '../../components/public/ImageLightboxModal';
import { PIIWarningBanner } from '../../components/common/PIIWarningBanner';

interface RouteDetailPageProps {
  config: SystemConfig;
}

export const RouteDetailPage: React.FC<RouteDetailPageProps> = ({ config }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [route, setRoute] = useState<AttentionRoute | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [routesList, entitiesList] = await Promise.all([
          api.getRoutes({ publicOnly: true }),
          api.getEntities(),
        ]);
        setEntities(entitiesList);
        const matched = matchRoute(slug, routesList);
        setRoute(matched || null);
      } catch (err) {
        console.error('Error fetching route detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (route) {
      exportRouteToPDF(route, config);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Proceso de Atención No Encontrado
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          La ruta solicitada no existe, se encuentra en fase de borrador o ha sido despublicada temporalmente por la entidad competente.
        </p>
        <div className="pt-2">
          <Link
            to="/rutas"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo de Procesos</span>
          </Link>
        </div>
      </div>
    );
  }

  // Related Entity object
  const entity = entities.find((e) => e.id === route.entityId);
  const entitySlug = entity ? slugify(entity.code) || entity.id : route.entityId;

  // Gallery items assembly
  const galleryItems = [
    ...(route.mainImageUrl
      ? [{ id: 'main', url: route.mainImageUrl, altText: route.mainImageAlt || route.name, isMain: true }]
      : []),
    ...(route.galleryImages || []),
  ];

  const isExpired =
    route.status === 'Vencida' ||
    (route.nextReviewDate && new Date(route.nextReviewDate) < new Date());

  return (
    <div className="space-y-8 pb-20 print:p-0 print:space-y-4">
      {/* 1. BREADCRUMB */}
      <nav aria-label="Ruta de navegación" className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            to={`/rutas?category=${encodeURIComponent(route.category)}`}
            className="hover:text-emerald-600 transition-colors"
          >
            {route.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            to={`/entidades/${entitySlug}`}
            className="hover:text-emerald-600 transition-colors line-clamp-1"
          >
            {route.entityName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[200px] sm:max-w-xs">
            {route.name}
          </span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <PIIWarningBanner compact />

        {/* 11. ACTION BAR (Compartir, Imprimir, Descargar PDF, Reportar Novedad) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <Link
            to="/rutas"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copiar enlace de esta ruta"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Enlace copiado!' : 'Compartir'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir ficha de la ruta"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Descargar ficha oficial en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Ficha PDF</span>
            </button>

            <Link
              to={`/reportar-informacion?routeId=${route.id}`}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100/50 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reportar Novedad</span>
            </Link>
          </div>
        </div>

        {/* 2. ENCABEZADO DE LA RUTA */}
        <section className="space-y-4">
          {/* Main Visual Image Banner */}
          <div className="relative h-64 sm:h-80 rounded-2xl bg-slate-950 overflow-hidden shadow-md">
            <img
              src={
                route.mainImageUrl ||
                '/quibdo_alcaldia_logo.png'
              }
              alt={route.mainImageAlt || route.name}
              onError={(e) => {
                if (route.mainImageUrl && !e.currentTarget.src.includes('/api/storage/proxy')) {
                  e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(route.mainImageUrl)}`;
                } else {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                }
              }}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Expired warning pill on image */}
            {isExpired && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>Información pendiente de actualización periódica</span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-medium">
                <span>{route.category}</span>
                <span aria-hidden="true">·</span>
                <span>Canal: {route.channel}</span>
                <span aria-hidden="true">·</span>
                <span>Trámite Oficial Quibdó</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                {route.name}
              </h1>

              <div className="text-xs sm:text-sm text-slate-300">
                Servicio: <strong className="text-white">{route.serviceName}</strong>
              </div>
            </div>
          </div>

          {/* Metadata quick row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Entidad Responsable</span>
              <Link
                to={`/entidades/${entitySlug}`}
                className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors line-clamp-1 inline-flex items-center gap-1 mt-0.5"
              >
                <span>{route.entityName}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
              </Link>
            </div>

            <div>
              <span className="text-slate-400 block">Tiempo de Respuesta</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {route.estimatedResponseTime || '3 a 5 días hábiles'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Canal Principal</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {route.channel}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Última Actualización</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {new Date(route.updatedAt || route.createdAt).toLocaleDateString('es-CO')}
              </span>
            </div>
          </div>
        </section>

        {/* 3. RESUMEN: POBLACIÓN OBJETIVO, NECESIDAD, DESCRIPCIÓN */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Resumen Institucional del Proceso
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                Población Destinataria
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
                {route.targetPopulation || 'Población Migrante en Quibdó'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">
                Necesidad que Atiende
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">
                {route.addressedNeed || 'Garantía del derecho fundamental y regularización.'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Descripción Completa del Trámite
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {route.description}
            </p>
          </div>
        </section>

        {/* 4. REQUISITOS (Lista numerada, Obligatorio/Opcional, Observaciones) */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Requisitos para el Ciudadano ({route.requirements?.length || 0})</span>
            </h2>
          </div>

          {route.dynamicRequirements && route.dynamicRequirements.length > 0 ? (
            <ol className="space-y-3">
              {route.dynamicRequirements.map((req, index) => (
                <li
                  key={req.id || index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {req.text}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          req.isObligatory
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {req.isObligatory ? 'Obligatorio' : 'Opcional / Subsanable'}
                      </span>
                    </div>
                    {req.observation && (
                      <p className="text-slate-500 text-[11px] italic">
                        Nota: {req.observation}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : route.requirements && route.requirements.length > 0 ? (
            <ol className="space-y-2">
              {route.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 mt-0.5">{req}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 italic">No se exigen requisitos previos especiales para esta atención.</p>
          )}
        </section>

        {/* 5. DOCUMENTOS SOLICITADOS (Lista, Obligatorio/Opcional, Observaciones) */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Documentos Necesarios ({route.requestedDocuments?.length || 0})</span>
            </h2>
          </div>

          {route.dynamicDocuments && route.dynamicDocuments.length > 0 ? (
            <ul className="space-y-3">
              {route.dynamicDocuments.map((doc, index) => (
                <li
                  key={doc.id || index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {doc.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          doc.isObligatory
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {doc.isObligatory ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </div>
                    {doc.description && (
                      <p className="text-slate-500 text-[11px]">{doc.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : route.requestedDocuments && route.requestedDocuments.length > 0 ? (
            <ul className="space-y-2">
              {route.requestedDocuments.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300"
                >
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No se requiere aportar documentos físicos previos.</p>
          )}
        </section>

        {/* 6. PROCEDIMIENTO PASO A PASO (Línea de tiempo / Pasos numerados) */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Procedimiento Paso a Paso</span>
            </h2>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500/30">
            {((route.dynamicSteps && route.dynamicSteps.length > 0
              ? route.dynamicSteps
              : route.procedureSteps) || []
            ).map((step, idx) => (
              <div key={step.id || idx} className="relative space-y-1.5">
                {/* Step Marker Bubble */}
                <span className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-xs">
                  {idx + 1}
                </span>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    {('estimatedTime' in step && step.estimatedTime) && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{step.estimatedTime}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500">
                    {'responsible' in step && step.responsible && (
                      <span>Responsable: <strong>{step.responsible}</strong></span>
                    )}
                    {'responsibleRole' in step && step.responsibleRole && (
                      <span>Responsable: <strong>{step.responsibleRole}</strong></span>
                    )}
                    {'channel' in step && step.channel && (
                      <span>Canal: <strong>{step.channel}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. CANALES DE ATENCIÓN (Presencial, Teléfono, Correo, Web, WhatsApp, Dirección, Horario) */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Canales Oficiales de Atención</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Atención Presencial</span>
              </div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <p><strong>Dirección:</strong> {entity?.address || entity?.institutionalAddress || route.institutionalAddress || 'Palacio Municipal, Quibdó'}</p>
                <p><strong>Horario:</strong> {entity?.serviceHours || route.serviceHours || 'Lunes a Viernes 8:00 AM - 12:00 PM / 2:00 PM - 5:00 PM'}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Canales Telefónicos y Virtuales</span>
              </div>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Teléfono / PBX: {entity?.phone || entity?.institutionalPhone || route.institutionalPhone || '(604) 671 0000'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Correo Institucional: {entity?.email || entity?.institutionalEmail || route.institutionalEmail || 'contacto@quibdo.gov.co'}</span>
                </p>
                {entity?.website && (
                  <p className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sitio Web: <a href={entity.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">{entity.website}</a></span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 8. ENTIDADES ARTICULADAS */}
        {route.articulatedEntityIds && route.articulatedEntityIds.length > 0 && (
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Entidades Copartícipes y Articuladas</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {route.articulatedEntityIds.map((entId) => {
                const artEntity = entities.find((e) => e.id === entId);
                const entName = artEntity ? artEntity.name : entId;
                const artSlug = artEntity ? slugify(artEntity.code) || artEntity.id : entId;

                return (
                  <Link
                    key={entId}
                    to={`/entidades/${artSlug}`}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {entName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Entidad articulada
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 9. GALERÍA MULTIMEDIA CON LIGHTBOX */}
        {galleryItems.length > 0 && (
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Galería Fotográfica e Infografías Institucionales ({galleryItems.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryItems.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setLightboxOpen(true);
                  }}
                  className="group relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <img
                    src={img.url}
                    alt={img.altText || `Fotografía institucional ${idx + 1}`}
                    onError={(e) => {
                      if (img.url && !e.currentTarget.src.includes('/api/storage/proxy')) {
                        e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(img.url)}`;
                      } else {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                    Ver ampliada
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 10. AVISOS LEGALES Y VIGENCIA */}
        <section className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-5 space-y-2.5 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100 text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Avisos Importantes de Consulta Institucional</span>
          </div>

          <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300">
            <li>
              <strong>Fecha de próxima revisión técnica:</strong> {route.nextReviewDate ? new Date(route.nextReviewDate).toLocaleDateString('es-CO') : 'Semestral según protocolo'}.
            </li>
            <li>
              <strong>Información sujeta a confirmación:</strong> Los requisitos normativos pueden actualizarse conforme a resoluciones del Gobierno Nacional o Municipal. Verifique con la ventanilla única antes de desplazarse.
            </li>
            <li>
              <strong>Protección de datos personales:</strong> La plataforma no almacena historias clínicas, números de cédula ni expedientes confidenciales individuales de los beneficiarios.
            </li>
          </ul>
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <ImageLightboxModal
          images={galleryItems}
          currentIndex={activeImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(newIdx) => setActiveImageIndex(newIdx)}
        />
      )}
    </div>
  );
};
