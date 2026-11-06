import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  CheckCircle2,
  Building2,
  Globe,
  Upload,
  Terminal,
  Database,
  Download,
  Server,
  Key,
  FolderArchive,
  RefreshCw,
  Search,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { exportToWordDoc } from '../../utils/exportUtils';

interface ManualSection {
  id: string;
  title: string;
  icon: any;
  audience: string;
  badgeColor: string;
  summary: string;
  contentHtml: string;
}

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('admin');
  const [searchQuery, setSearchQuery] = useState('');

  const MANUALS: ManualSection[] = [
    {
      id: 'admin',
      title: 'Manual del Administrador General',
      icon: Shield,
      audience: 'Administrador del Sistema',
      badgeColor: 'bg-emerald-600 text-white',
      summary: 'Guía de gestión de entidades, asignación de usuarios institucionales, parámetros del sistema y bitácora de auditoría.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Roles y Responsabilidades</h2>
        <p style="font-size:13px; color:#334155;">El Administrador General ejerce el control total de la plataforma. Sus funciones exclusivas son:</p>
        <ul style="font-size:13px; color:#334155; line-height:1.6;">
          <li>Crear, editar, activar y desactivar entidades de la mesa técnica de Quibdó (19 entidades base).</li>
          <li>Crear y administrar usuarios institucionales asignándolos a una única entidad.</li>
          <li>Restablecer contraseñas y emitir claves temporales.</li>
          <li>Configurar parámetros globales (fecha de reunión inicial, plazo límite de observaciones).</li>
          <li>Consultar la bitácora inmutable de auditoría del sistema y descargar reportes consolidados.</li>
        </ul>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Gestión de Entidades (/admin/entidades)</h2>
        <p style="font-size:13px; color:#334155;">Para crear una nueva entidad ingrese al panel administrativo, especifique nombre completo, sigla, tipo (Municipal, Departamental, Nacional, etc.), correo y teléfono institucional. Si una entidad es desactivada, sus usuarios no podrán crear nuevas rutas.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">3. Gestión de Usuarios (/admin/usuarios)</h2>
        <p style="font-size:13px; color:#334155;">Todo usuario institucional debe estar vinculado estrictamente a su entidad (Regula Single-Tenant User). Ningún usuario institucional puede pertenecer a dos entidades simultáneamente.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">4. Bitácora de Auditoría (/admin/auditoria)</h2>
        <p style="font-size:13px; color:#334155;">Cada acción realizada en la plataforma genera un registro con fecha, hora, usuario, rol, entidad, módulo, registro afectado y valores anteriores/nuevos.</p>
      `,
    },
    {
      id: 'coordinator',
      title: 'Manual del Coordinador de la Ruta',
      icon: CheckCircle2,
      audience: 'Coordinador Técnico',
      badgeColor: 'bg-blue-600 text-white',
      summary: 'Procedimiento de revisión técnica, devolución con observaciones, aprobación y publicación oficial de rutas.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Flujo de Revisión (/coordinacion/revision)</h2>
        <p style="font-size:13px; color:#334155;">El Coordinador supervisa transversalmente todas las entidades. Flujo técnico obligatorio:</p>
        <ol style="font-size:13px; color:#334155; line-height:1.6;">
          <li><b>Borrador &rarr; Enviada a revisión:</b> La entidad radica la propuesta.</li>
          <li><b>En revisión &rarr; Devuelta para ajustes:</b> Si requiere correcciones, el Coordinador agrega un comentario técnico obligatorio explicando el ajuste.</li>
          <li><b>En revisión &rarr; Aprobada:</b> Cuando cumple con todos los requisitos y pasos.</li>
          <li><b>Aprobada &rarr; Publicada:</b> Se hace pública en el catálogo ciudadano.</li>
        </ol>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Matriz de Compromisos y Observaciones</h2>
        <p style="font-size:13px; color:#334155;">Monitoreo de observaciones interinstitucionales y seguimiento a compromisos con alertas de vencimiento automático.</p>
      `,
    },
    {
      id: 'institutional',
      title: 'Manual del Usuario Institucional',
      icon: Building2,
      audience: 'Puntos de Enlace de las 19 Entidades',
      badgeColor: 'bg-purple-600 text-white',
      summary: 'Registro de rutas, gestión de requisitos, canales de atención, observaciones y cumplimiento de compromisos.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Espacio Privado Institucional (/mi-entidad)</h2>
        <p style="font-size:13px; color:#334155;">Aislamiento estricto de datos: cada entidad accede exclusivamente a sus propias rutas, borradores, observaciones y compromisos.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Registro y Edición de Mis Rutas (/mi-entidad/rutas)</h2>
        <ul style="font-size:13px; color:#334155; line-height:1.6;">
          <li>Crear la ruta completando datos del servicio, población objetivo, horarios y canales.</li>
          <li>Cargar la imagen principal vinculada y configurar el texto alternativo accesibilidad.</li>
          <li>Definir requisitos y documentos dinámicos con marca de obligatoriedad.</li>
          <li>Estructurar los pasos procedimentales ordenados cronológicamente.</li>
          <li>Enviar a revisión técnica. Un usuario institucional nunca publica autónomamente.</li>
        </ul>
      `,
    },
    {
      id: 'public',
      title: 'Manual del Portal Público Ciudadano',
      icon: Globe,
      audience: 'Ciudadanía y Población Migrante',
      badgeColor: 'bg-emerald-700 text-white',
      summary: 'Guía de navegación del catálogo abierto, búsqueda por necesidad, descarga de fichas PDF e impresiones.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Búsqueda y Navegación (/rutas)</h2>
        <p style="font-size:13px; color:#334155;">La ciudadanía puede buscar rutas de atención pública por palabra clave, entidad, categoría temática o canal de atención.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Fichas Técnicas Oficiales (/rutas/[slug])</h2>
        <p style="font-size:13px; color:#334155;">Cada ruta cuenta con una página web independiente compartible con requisitos, documentos, mapa, pasos y botón de descarga de la ficha PDF oficial limpia de anotaciones reservadas.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">3. Participación y Reporte Ciudadano</h2>
        <p style="font-size:13px; color:#334155;">Permite a los usuarios señalar horarios desactualizados o inconsistencias sin solicitar información sensible ni credenciales.</p>
      `,
    },
    {
      id: 'media',
      title: 'Manual de Carga de Imágenes y Archivos',
      icon: Upload,
      audience: 'Cargadores y Comunicaciones',
      badgeColor: 'bg-amber-600 text-white',
      summary: 'Política de formatos, dimensiones, accesibilidad WCAG 2.1 AA, escaneo preventivo de Habeas Data y protección de menores.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Requisitos Técnicos y Límites</h2>
        <ul style="font-size:13px; color:#334155; line-height:1.6;">
          <li><b>Imágenes:</b> Formatos JPG, PNG, WebP, SVG. Peso máximo 5 MB.</li>
          <li><b>Documentos & Evidencias:</b> Formatos PDF, DOCX, XLSX. Peso máximo 10 MB.</li>
          <li><b>Prohibidos:</b> Archivos ejecutables (.exe, .bat, .sh) o comprimidos sin firma.</li>
        </ul>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Accesibilidad Obligatoria (Alt Text)</h2>
        <p style="font-size:13px; color:#334155;">Toda imagen requiere un texto alternativo objetivo de al menos 5 caracteres para usuarios con lectores de pantalla.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">3. Protección de Datos Sensibles (Ley 1581 / Habeas Data)</h2>
        <p style="font-size:13px; color:#334155;">El sistema escanea automáticamente los nombres y descripciones. Si detecta cédulas, historias clínicas o menores, exige certificación de autorización firmada.</p>
      `,
    },
    {
      id: 'technical',
      title: 'Manual Técnico y de Despliegue',
      icon: Terminal,
      audience: 'Ingeniería, DevOps y Administradores de Infraestructura',
      badgeColor: 'bg-slate-900 text-white',
      summary: 'Modelo de datos, variables de entorno, comandos de instalación, despliegue, copias de seguridad y restauración.',
      contentHtml: `
        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:10px;">1. Arquitectura y Stack</h2>
        <p style="font-size:13px; color:#334155;">Plataforma Full-Stack React + Vite + Node.js (Express) con persistencia JSON inmutable y almacenamiento por entidad.</p>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">2. Comandos de Instalación y Despliegue</h2>
        <pre style="background:#0f172a; color:#38bdf8; padding:12px; border-radius:8px; font-size:12px; overflow-x:auto;">
# Instalación de dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
        </pre>

        <h2 style="font-size:18px; font-weight:bold; color:#0f172a; margin-top:20px;">3. Copias de Seguridad y Restauración</h2>
        <p style="font-size:13px; color:#334155;">La base de datos reside en <code>data/db.json</code>. Para realizar copias de seguridad:</p>
        <pre style="background:#0f172a; color:#38bdf8; padding:12px; border-radius:8px; font-size:12px; overflow-x:auto;">
# Backup manual
cp data/db.json backups/db_backup_$(date +%Y%m%d).json

# Restauración
cp backups/db_backup_YYYYMMDD.json data/db.json
        </pre>
      `,
    },
  ];

  const handleDownloadDoc = (manual: ManualSection) => {
    exportToWordDoc(
      `Manual_${manual.id}_Quibdo.doc`,
      manual.title,
      `Plataforma Oficial de Rutas de Atención - Alcaldía de Quibdó · ${manual.audience}`,
      manual.contentHtml
    );
  };

  const filteredManuals = MANUALS.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.audience.toLowerCase().includes(q)
    );
  });

  const selectedManual = MANUALS.find((m) => m.id === activeTab) || MANUALS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            Centro Documental Oficial & Manuales Institucionales
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
            Manuales Operativos, Guías Técnicas y Políticas del Sistema
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Documentación técnica estructurada para la administración, coordinación, operación institucional y consulta ciudadana de la Ruta de Atención a Población Migrante en Quibdó.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar en el centro de manuales (ej. copia de seguridad, alt text, aprobación...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent text-slate-900 dark:text-white outline-none"
        />
      </div>

      {/* Main Grid Navigation + Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Manual Cards Navigation */}
        <div className="lg:col-span-4 space-y-3">
          {filteredManuals.map((manual) => {
            const Icon = manual.icon;
            const isSelected = manual.id === activeTab;

            return (
              <div
                key={manual.id}
                onClick={() => setActiveTab(manual.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${manual.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {manual.title}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-600 rotate-90' : 'text-slate-400'}`} />
                </div>

                <span className="inline-block text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  Público: {manual.audience}
                </span>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {manual.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Manual Viewer Content */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mb-2 ${selectedManual.badgeColor}`}>
                {selectedManual.audience}
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {selectedManual.title}
              </h2>
            </div>

            <button
              onClick={() => handleDownloadDoc(selectedManual)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs shrink-0"
            >
              <Download className="w-4 h-4" />
              Descargar Manual (.doc)
            </button>
          </div>

          {/* Render Manual Content HTML */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectedManual.contentHtml }}
          />
        </div>
      </div>
    </div>
  );
};
