import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Shield,
  CheckCircle2,
  FileText,
  Send,
  Lock,
  Building2,
  Layers,
  Image as ImageIcon,
  Clock,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileCheck,
  Check,
} from 'lucide-react';

export const InstitutionalHelpPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<number | null>(1);

  const toggleSection = (id: number) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-3 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Guía Metodológica y Orientación Técnica Oficial</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
          Centro de Ayuda y Manual del Enlace Institucional
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Instrucciones detalladas para la estructuración de rutas de atención integral, gestión del perfil, carga segura de archivos en Supabase y cumplimiento de la normativa de protección de datos personales (PII) en Quibdó.
        </p>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>19 Entidades</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Articulación interinstitucional coordinada por la Alcaldía de Quibdó para la población migrante.
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-sm">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span>Ciclo Dinámico</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Registro de requisitos, documentos y pasos numerados con reordenamiento y tiempos de respuesta.
          </p>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200 text-sm">
            <Lock className="w-4 h-4 text-rose-600" />
            <span>Cero Datos PII</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Prohibición estricta de almacenar cédulas, nombres de beneficiarios o historias clínicas particulares.
          </p>
        </div>
      </div>

      {/* Accordion Guide Sections */}
      <div className="space-y-4">
        {/* Section 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection(1)}
            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <span>Paso a Paso para Crear y Publicar una Ruta de Atención</span>
            </div>
            {openSection === 1 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSection === 1 && (
            <div className="px-6 pb-6 pt-2 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
              <p className="leading-relaxed">
                Cada ruta creada por su entidad debe reflejar con absoluta precisión los trámites y canales disponibles para los ciudadanos. Siga estas fases en el formulario de registro:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fase 1: Datos Institucionales y Categoría</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    Seleccione la categoría temática correcta (ej. <em>Salud y Afiliación</em>, <em>Educación e Inclusión Escolar</em> o <em>Focalización y Sisbén</em>). Indique el nombre oficial del servicio y la población objetivo destinataria.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fase 2: Requisitos y Documentos Dinámicos</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    Añada los requisitos exigidos uno a uno. Puede marcar si un requisito es <strong>Obligatorio</strong> o <strong>Opcional / Subsanable</strong>, e incluir observaciones aclaratorias (ej. <em>"En caso de no poseer documento original, se acepta certificación temporal"</em>).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fase 3: Procedimiento Paso a Paso con Reordenamiento</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    Describa cronológicamente las gestiones que debe realizar el ciudadano. Utilice los botones de <strong>Subir (↑)</strong> y <strong>Bajar (↓)</strong> para ordenar los pasos, asignando el responsable y el tiempo estimado por cada etapa.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fase 4: Canales Oficiales y Verificación de Completitud</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    El sistema verificará automáticamente que no falten campos obligatorios. Una vez completa, podrá hacer clic en <strong>Publicar Ruta</strong> para que aparezca instantáneamente en el portal público de Quibdó.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection(2)}
            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <span>Gestión del Perfil Institucional y Horarios Oficiales</span>
            </div>
            {openSection === 2 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSection === 2 && (
            <div className="px-6 pb-6 pt-2 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
              <p className="leading-relaxed">
                En el módulo <strong>Mi Perfil Institucional</strong> ubicado en el menú lateral:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>Actualice la dirección de su sede principal, teléfono PBX y correo institucional oficial.</li>
                <li>Configure el <strong>Horario de Atención al Público</strong> (ej. <em>Lunes a Viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.</em>). Este horario se sincronizará automáticamente con todas las rutas y fichas de su entidad.</li>
                <li>Suba el logotipo oficial de su entidad en formato PNG o JPG (relación 1:1, máx. 2MB), el cual se almacenará de forma segura en el bucket <code className="font-mono text-emerald-600">logos</code> de Supabase.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection(3)}
            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <span>Administración de Archivos, Galerías e Imágenes</span>
            </div>
            {openSection === 3 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSection === 3 && (
            <div className="px-6 pb-6 pt-2 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
              <p className="leading-relaxed">
                El módulo <strong>Archivos y Multimedia</strong> recopila y sincroniza automáticamente:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>Las imágenes principales cargadas al crear o editar rutas.</li>
                <li>Las fotografías adicionales de la galería institucional de apoyo.</li>
                <li>Los documentos y soportes normativos vinculados a las gestiones de la entidad.</li>
              </ul>
              <p className="text-slate-500 text-[11px] italic">
                Puede copiar enlaces seguros (URL) de cualquier archivo para reutilizarlos o compartirlos en informes técnicos.
              </p>
            </div>
          )}
        </div>

        {/* Section 4 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection(4)}
            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <span>Normativa de Privacidad y Protección de Datos (PII)</span>
            </div>
            {openSection === 4 ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {openSection === 4 && (
            <div className="px-6 pb-6 pt-2 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Aviso Importante de Habeas Data</span>
                </div>
                <p className="leading-relaxed">
                  Esta plataforma es un directorio institucional de <strong>oferta pública y trámites</strong>. Está estrictamente prohibido registrar números de cédula, nombres de beneficiarios particulares, diagnósticos de historias clínicas o direcciones de viviendas privadas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
