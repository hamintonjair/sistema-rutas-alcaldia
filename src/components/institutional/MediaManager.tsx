import React, { useState, useEffect, useMemo } from 'react';
import {
  Image as ImageIcon,
  FileText,
  Shield,
  Lock,
  Eye,
  Trash2,
  Edit2,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  LayoutGrid,
  List,
  FileCheck,
  FolderArchive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { MediaFileModel, MediaFileType, AttentionRoute, Entity } from '../../types';
import { api, UserContext } from '../../services/api';

interface MediaManagerProps {
  userContext: UserContext;
  scope?: 'institutional' | 'coordinator' | 'admin';
  routes?: AttentionRoute[];
  entities?: Entity[];
}

const FILE_TYPE_LABELS: Record<MediaFileType, { label: string; icon: any; color: string }> = {
  logo_entidad: { label: 'Logo de entidad', icon: ImageIcon, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
  portada_entidad: { label: 'Imagen de portada', icon: ImageIcon, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  imagen_principal_ruta: { label: 'Imagen principal de ruta', icon: ImageIcon, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  galeria_ruta: { label: 'Galería de ruta', icon: ImageIcon, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800' },
  documento_institucional: { label: 'Documento institucional', icon: FileText, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  evidencia_compromiso: { label: 'Evidencia de compromiso', icon: FileCheck, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  soporte_revision: { label: 'Soporte para revisión', icon: FolderArchive, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
};

export const MediaManager: React.FC<MediaManagerProps> = ({
  userContext,
  scope = 'institutional',
  routes = [],
  entities = [],
}) => {
  const [files, setFiles] = useState<MediaFileModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & display state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'public' | 'private'>('all');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeletedAdmin, setShowDeletedAdmin] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFileModel | null>(null);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<MediaFileModel | null>(null);
  const [deletingError, setDeletingError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Accessible Lightbox / Viewer
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  // Upload Form State
  const [uploadOriginalName, setUploadOriginalName] = useState('');
  const [uploadType, setUploadType] = useState<MediaFileType>('imagen_principal_ruta');
  const [uploadMimeType, setUploadMimeType] = useState('image/webp');
  const [uploadSize, setUploadSize] = useState<number>(1024 * 350);
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadEntityId, setUploadEntityId] = useState(userContext.entityId || 'ent-1');
  const [uploadRouteId, setUploadRouteId] = useState('');
  const [uploadAcknowledgedPrivacy, setUploadAcknowledgedPrivacy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);

  // Load files
  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (scope === 'institutional' && userContext.entityId) {
        params.entityId = userContext.entityId;
      }
      if (showDeletedAdmin && userContext.role === 'admin') {
        params.includeDeleted = true;
      }
      const data = await api.getMediaFiles(params, userContext);
      setFiles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error cargando archivos y multimedia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [userContext, showDeletedAdmin]);

  // Client-side sensitive data scanner for upload form
  const privacyAnalysis = useMemo(() => {
    const flags: string[] = [];
    const textToScan = `${uploadOriginalName} ${uploadDescription} ${uploadAltText}`.toLowerCase();

    if (/\b(c[eé]dula|cc\b|tarjeta de identidad|t\.i\b|pasaporte|documento de identidad|registro civil|nui|dni)\b/i.test(textToScan)) {
      flags.push('Posible documento de identificación personal (Cédula / TI / Pasaporte / Registro Civil)');
    }
    if (/\b(historia cl[ií]nica|diagn[oó]stico|epicrisis|examen m[eé]dico|f[oó]rmula m[eé]dica|paciente|vih|salud mental|patolog[ií]a)\b/i.test(textToScan)) {
      flags.push('Posible dato de salud o historia clínica reservada');
    }
    if (/\b(menor|niñ[oa]|infante|adolescente|infancia|rostro identificable)\b/i.test(textToScan)) {
      flags.push('Presencia o referencia a menores de edad o rostros identificables sin anonimización');
    }
    if (/\b(direcci[oó]n particular|residencia privada|barrio residencial|celular personal|tel[eé]fono personal|casa particular)\b/i.test(textToScan)) {
      flags.push('Posible dirección domiciliaria o contacto personal reservado');
    }
    if (/\b(pantallazo|captura de pantalla|whatsapp|chat privado|extracto|banco|cuenta bancaria|clave|contraseña)\b/i.test(textToScan)) {
      flags.push('Captura de pantalla con posibles comunicaciones privadas o datos bancarios');
    }

    return {
      hasRisk: flags.length > 0,
      flags,
    };
  }, [uploadOriginalName, uploadDescription, uploadAltText]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      // Type filter
      if (selectedType !== 'all' && f.type !== selectedType) return false;

      // Visibility filter
      if (selectedVisibility === 'public' && !f.isPublic) return false;
      if (selectedVisibility === 'private' && f.isPublic) return false;

      // Entity filter (for coordinator/admin)
      if (selectedEntityId !== 'all' && f.entityId !== selectedEntityId) return false;

      // Route filter
      if (selectedRouteId !== 'all' && f.routeId !== selectedRouteId) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          f.originalName.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.altText && f.altText.toLowerCase().includes(q)) ||
          f.entityName.toLowerCase().includes(q) ||
          (f.routeName && f.routeName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [files, selectedType, selectedVisibility, selectedEntityId, selectedRouteId, searchQuery]);

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = useMemo(() => {
    return filteredFiles.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredFiles, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedVisibility, selectedEntityId, selectedRouteId, searchQuery]);

  // Handle fake or real file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadOriginalName(file.name);
      setUploadMimeType(file.type || 'application/octet-stream');
      setUploadSize(file.size);

      // Auto-detect recommended type
      if (file.type.startsWith('image/')) {
        if (!uploadType.startsWith('logo') && !uploadType.startsWith('portada') && !uploadType.startsWith('imagen') && !uploadType.startsWith('galeria')) {
          setUploadType('imagen_principal_ruta');
        }
      } else {
        setUploadType('documento_institucional');
      }
    }
  };

  // Keyboard navigation for accessible lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredFiles.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredFiles.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredFiles.length]);

  // Copy secure URL
  const handleCopySecureUrl = (file: MediaFileModel) => {
    navigator.clipboard.writeText(window.location.origin + file.secureUrl);
    setCopiedUrlId(file.id);
    setTimeout(() => setCopiedUrlId(null), 2500);
  };

  // Submit Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setIsSubmittingUpload(true);

    try {
      const isImg = uploadMimeType.startsWith('image/') || ['logo_entidad', 'portada_entidad', 'imagen_principal_ruta', 'galeria_ruta'].includes(uploadType);
      if (isImg && (!uploadAltText || uploadAltText.trim().length < 5)) {
        throw new Error('El texto alternativo (alt text) es obligatorio para toda imagen y debe tener mínimo 5 caracteres.');
      }
      if (!uploadDescription || uploadDescription.trim().length < 10) {
        throw new Error('La descripción institucional es obligatoria y debe tener al menos 10 caracteres.');
      }
      if (privacyAnalysis.hasRisk && !uploadAcknowledgedPrivacy) {
        throw new Error('Debe certificar la autorización de Habeas Data antes de subir este archivo.');
      }

      const res = await api.uploadMediaFile(
        {
          originalName: uploadOriginalName.trim(),
          type: uploadType,
          mimeType: uploadMimeType,
          size: uploadSize,
          altText: uploadAltText.trim(),
          description: uploadDescription.trim(),
          entityId: scope === 'institutional' ? userContext.entityId : uploadEntityId,
          routeId: uploadRouteId || undefined,
          userAcknowledgedHabeasData: uploadAcknowledgedPrivacy,
        },
        userContext
      );

      setSuccessMsg(`Archivo "${res.file.originalName}" cargado correctamente.`);
      setShowUploadModal(false);
      resetUploadForm();
      loadFiles();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setUploadError(err.message || 'Error al cargar el archivo.');
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const resetUploadForm = () => {
    setUploadOriginalName('');
    setUploadType('imagen_principal_ruta');
    setUploadMimeType('image/webp');
    setUploadSize(1024 * 400);
    setUploadAltText('');
    setUploadDescription('');
    setUploadRouteId('');
    setUploadAcknowledgedPrivacy(false);
    setUploadError(null);
  };

  // Submit Edit Metadata
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    setEditingError(null);

    try {
      const isImg = editingFile.mimeType.startsWith('image/');
      if (isImg && (!editingFile.altText || editingFile.altText.trim().length < 5)) {
        setEditingError('El texto alternativo es obligatorio para imágenes (mínimo 5 caracteres).');
        return;
      }
      if (!editingFile.description || editingFile.description.trim().length < 10) {
        setEditingError('La descripción es obligatoria (mínimo 10 caracteres).');
        return;
      }

      await api.updateMediaFile(
        editingFile.id,
        {
          altText: editingFile.altText,
          description: editingFile.description,
        },
        userContext
      );

      setSuccessMsg(`Metadatos de "${editingFile.originalName}" actualizados correctamente.`);
      setEditingFile(null);
      loadFiles();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setEditingError(err.message || 'Error al actualizar metadatos.');
    }
  };

  // Submit Soft Delete
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingFile) return;
    setDeletingError(null);

    try {
      await api.deleteMediaFile(deletingFile.id, deleteReason.trim() || 'Eliminación lógica estándar', userContext);
      setSuccessMsg(`Archivo "${deletingFile.originalName}" eliminado lógicamente.`);
      setDeletingFile(null);
      setDeleteReason('');
      loadFiles();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setDeletingError(err.message || 'Error al eliminar el archivo.');
    }
  };

  const activeCount = files.filter((f) => f.status === 'active').length;
  const publicCount = files.filter((f) => f.status === 'active' && f.isPublic).length;
  const privateCount = files.filter((f) => f.status === 'active' && !f.isPublic).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Gestión Segura de Archivos y Multimedia Institucional
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Almacenamiento organizado, control estricto de visibilidad, accesibilidad con texto alternativo y protección de datos sensibles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetUploadForm();
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              Cargar archivo institucional
            </button>

            <button
              onClick={loadFiles}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Recargar archivos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block">Total archivos activos</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{activeCount}</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <span className="text-emerald-700 dark:text-emerald-400 block font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Públicos (Ciudadanos)
            </span>
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">{publicCount}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
            <span className="text-amber-700 dark:text-amber-400 block font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Privados Institucionales
            </span>
            <span className="text-base font-bold text-amber-800 dark:text-amber-300">{privateCount}</span>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <span className="text-indigo-700 dark:text-indigo-400 block font-medium">Accesibilidad WCAG 2.1</span>
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">100% con Alt-Text</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, alt-text o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">Todos los tipos de archivo</option>
              <option value="logo_entidad">Logos de entidad</option>
              <option value="portada_entidad">Imágenes de portada</option>
              <option value="imagen_principal_ruta">Imágenes principales de ruta</option>
              <option value="galeria_ruta">Galerías de ruta</option>
              <option value="documento_institucional">Documentos institucionales</option>
              <option value="evidencia_compromiso">Evidencias de compromiso</option>
              <option value="soporte_revision">Soportes de revisión</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">Todas las visibilidades</option>
              <option value="public">Solo archivos públicos (Ciudadanos)</option>
              <option value="private">Solo archivos privados institucionales</option>
            </select>
          </div>

          {/* Route Filter */}
          <div>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">Todas las rutas asociadas</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.length > 35 ? r.name.substring(0, 35) + '...' : r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode toggle & Admin controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Mostrando <strong>{filteredFiles.length}</strong> de {files.length} archivos
            </span>

            {userContext.role === 'admin' && (
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs ml-4 font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showDeletedAdmin}
                  onChange={(e) => setShowDeletedAdmin(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Ver archivos eliminados lógicamente (Auditoría)
              </label>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Files Presentation */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Cargando catálogo institucional de archivos...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <FolderArchive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No se encontraron archivos</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hay elementos que coincidan con los filtros aplicados. Puede cargar nuevos archivos institucionales o ajustar los criterios de búsqueda.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedFiles.map((file) => {
              const globalIdx = filteredFiles.findIndex((f) => f.id === file.id);
              const isImage = file.mimeType.startsWith('image/');
              const typeMeta = FILE_TYPE_LABELS[file.type] || {
                label: file.type,
                icon: FileText,
                color: 'text-slate-600 bg-slate-50 border-slate-200',
              };
              const TypeIcon = typeMeta.icon;

              return (
                <div
                  key={file.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border transition-shadow hover:shadow-md flex flex-col overflow-hidden ${
                    file.status === 'deleted'
                      ? 'border-red-300 dark:border-red-900/50 bg-red-50/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Thumbnail / Preview Area */}
                  <div
                    onClick={() => setLightboxIndex(globalIdx)}
                    className="h-36 bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center cursor-pointer group overflow-hidden border-b border-slate-100 dark:border-slate-800"
                  >
                    {isImage ? (
                      <img
                        src={file.thumbnailUrl || file.secureUrl}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <FileText className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                          {file.originalName.split('.').pop() || 'DOC'}
                        </span>
                      </div>
                    )}

                    {/* Visibility Tag */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {file.isPublic ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                          <Shield className="w-3 h-3" />
                          Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
                          <Lock className="w-3 h-3" />
                          Privado
                        </span>
                      )}

                      {file.status === 'deleted' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                          Eliminado
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                      <span className="text-xs font-medium flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md">
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </span>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Type badge */}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${typeMeta.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeMeta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{file.sizeFormatted}</span>
                      </div>

                      {/* File Name */}
                      <h4
                        className="text-xs font-bold text-slate-900 dark:text-white truncate"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </h4>

                      {/* Alt Text (Required for accessibility) */}
                      {isImage && (
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md border border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">Texto alternativo (Alt):</span>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-2 italic" title={file.altText}>
                            "{file.altText || 'Sin texto alternativo'}"
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2" title={file.description}>
                        {file.description}
                      </p>

                      {/* Associated Route */}
                      {file.routeName && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                          <strong>Ruta:</strong> {file.routeName}
                        </p>
                      )}
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleCopySecureUrl(file)}
                        className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors text-[11px]"
                        title="Copiar URL segura"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedUrlId === file.id ? 'Copiada' : 'URL'}
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        {(userContext.role === 'admin' || (userContext.role === 'institutional' && userContext.entityId === file.entityId)) && file.status === 'active' && (
                          <button
                            onClick={() => setEditingFile({ ...file })}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
                            title="Editar texto alternativo y descripción"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Download Link */}
                        <a
                          href={`/api/media/${file.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>

                        {/* Soft Delete */}
                        {(userContext.role === 'admin' || (userContext.role === 'institutional' && userContext.entityId === file.entityId)) && file.status === 'active' && (
                          <button
                            onClick={() => setDeletingFile(file)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                            title="Eliminar lógicamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Archivo / Miniatura</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Visibilidad</th>
                  <th className="py-3 px-4">Texto Alternativo (Alt)</th>
                  <th className="py-3 px-4">Entidad / Ruta</th>
                  <th className="py-3 px-4">Tamaño</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFiles.map((file, idx) => {
                  const isImage = file.mimeType.startsWith('image/');
                  const typeMeta = FILE_TYPE_LABELS[file.type] || {
                    label: file.type,
                    icon: FileText,
                    color: 'text-slate-600 bg-slate-50 border-slate-200',
                  };

                  return (
                    <tr
                      key={file.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        file.status === 'deleted' ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div
                          onClick={() => setLightboxIndex(idx)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {isImage ? (
                              <img
                                src={file.thumbnailUrl || file.secureUrl}
                                alt={file.altText || file.originalName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white block group-hover:text-emerald-600 transition-colors">
                              {file.originalName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Subido por {file.uploadedByUserName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${typeMeta.color}`}>
                          {typeMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {file.isPublic ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <Shield className="w-3 h-3" />
                            Público
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Lock className="w-3 h-3" />
                            Privado
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {file.altText ? (
                          <span className="text-slate-600 dark:text-slate-400 italic line-clamp-2" title={file.altText}>
                            "{file.altText}"
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A (Documento)</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                          {file.entityName}
                        </span>
                        {file.routeName && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block truncate max-w-[180px]">
                            {file.routeName}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500">{file.sizeFormatted}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopySecureUrl(file)}
                            className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                            title="Copiar URL segura"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {(userContext.role === 'admin' || (userContext.role === 'institutional' && userContext.entityId === file.entityId)) && file.status === 'active' && (
                            <button
                              onClick={() => setEditingFile({ ...file })}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
                              title="Editar texto alternativo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          <a
                            href={`/api/media/${file.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          {(userContext.role === 'admin' || (userContext.role === 'institutional' && userContext.entityId === file.entityId)) && file.status === 'active' && (
                            <button
                              onClick={() => setDeletingFile(file)}
                              className="p-1 text-slate-500 hover:text-red-600 rounded transition-colors"
                              title="Eliminar lógicamente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-slate-500">
            Mostrando página <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> de <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> ({filteredFiles.length} archivos en total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 font-semibold"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 font-semibold"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ACCESSIBLE LIGHTBOX / VIEWER MODAL */}
      {lightboxIndex !== null && filteredFiles[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualizador accesible de archivos institucionales"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          {(() => {
            const currentFile = filteredFiles[lightboxIndex];
            const isImage = currentFile.mimeType.startsWith('image/');

            return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700">
                {/* Header */}
                <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-mono text-emerald-400 shrink-0">
                      [{lightboxIndex + 1} / {filteredFiles.length}]
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold truncate text-white max-w-[140px] xs:max-w-xs sm:max-w-md" title={currentFile.originalName}>
                      {currentFile.originalName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopySecureUrl(currentFile)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                      title="Copiar URL segura"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{copiedUrlId === currentFile.id ? '¡URL Copiada!' : 'Copiar URL'}</span>
                    </button>

                    <a
                      href={`/api/media/${currentFile.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                      title="Descargar archivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setLightboxIndex(null)}
                      className="p-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shrink-0 transition-colors cursor-pointer shadow-sm"
                      title="Cerrar (Escape)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Media Container with Previous/Next Arrows */}
                <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[350px] max-h-[520px] overflow-hidden">
                  {/* Prev Button */}
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredFiles.length - 1))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full transition-colors z-10"
                    title="Anterior (Flecha izquierda)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Main Display */}
                  {isImage ? (
                    <img
                      src={currentFile.secureUrl}
                      alt={currentFile.altText || currentFile.originalName}
                      className="max-w-full max-h-[500px] object-contain p-2"
                    />
                  ) : (
                    <div className="p-8 text-center text-white space-y-4">
                      <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
                      <div>
                        <h4 className="text-base font-bold">{currentFile.originalName}</h4>
                        <p className="text-xs text-slate-400 mt-1">{currentFile.description}</p>
                      </div>
                      <a
                        href={`/api/media/${currentFile.id}/stream`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir documento en pestaña nueva
                      </a>
                    </div>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setLightboxIndex((prev) => (prev !== null && prev < filteredFiles.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full transition-colors z-10"
                    title="Siguiente (Flecha derecha)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Metadata & Accessibility Info */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {currentFile.isPublic ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                          <Shield className="w-3 h-3" />
                          Acceso Ciudadano Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-800">
                          <Lock className="w-3 h-3" />
                          Privado Institucional (Protegido contra acceso directo)
                        </span>
                      )}
                      <span className="text-slate-500 font-medium">Entidad: {currentFile.entityName}</span>
                    </div>

                    <span className="text-slate-400 font-mono">
                      {currentFile.sizeFormatted} · Subido el {new Date(currentFile.uploadedAt).toLocaleDateString('es-CO')}
                    </span>
                  </div>

                  {isImage && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Texto alternativo para lectores de pantalla:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                        "{currentFile.altText}"
                      </p>
                    </div>
                  )}

                  <p className="text-slate-600 dark:text-slate-400">{currentFile.description}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Cargar Archivo Institucional Seguro
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File input / dropzone */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccionar archivo desde el equipo
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.webp,.svg,.pdf,.docx,.xlsx"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Permitidos: JPG, PNG, WebP, SVG (máx 5MB) | PDF, DOCX, XLSX (máx 10MB).
                </span>
              </div>

              {/* Original Name Input */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del archivo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. circular-014-matricula-escolar-2026.pdf"
                  value={uploadOriginalName}
                  onChange={(e) => setUploadOriginalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Type Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de archivo institucional *
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as MediaFileType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="logo_entidad">Logo de entidad (Público)</option>
                  <option value="portada_entidad">Imagen de portada (Pública)</option>
                  <option value="imagen_principal_ruta">Imagen principal de ruta (Pública solo si ruta está aprobada)</option>
                  <option value="galeria_ruta">Galería de ruta (Pública solo si ruta está aprobada)</option>
                  <option value="documento_institucional">Documento institucional (Privado)</option>
                  <option value="evidencia_compromiso">Evidencia de compromiso (Privado)</option>
                  <option value="soporte_revision">Soporte para revisión técnica (Privado)</option>
                </select>
              </div>

              {/* Alt Text (Required if image) */}
              {['logo_entidad', 'portada_entidad', 'imagen_principal_ruta', 'galeria_ruta'].includes(uploadType) && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 space-y-1">
                  <label className="block font-bold text-emerald-900 dark:text-emerald-300">
                    Texto alternativo (Alt-Text) * <span className="font-normal text-[11px] text-emerald-700 dark:text-emerald-400">(Obligatorio por Accesibilidad WCAG 2.1 AA)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Describa de forma objetiva lo que muestra la imagen..."
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                    Mínimo 5 caracteres. No use frases decorativas vacías como "imagen" o "foto".
                  </span>
                </div>
              )}

              {/* Description (Required) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción del archivo * (Mínimo 10 caracteres)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explique el propósito institucional y contexto de este archivo..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Associated Route (Optional) */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ruta de atención vinculada (Opcional)
                </label>
                <select
                  value={uploadRouteId}
                  onChange={(e) => setUploadRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin vincular a ruta específica</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* HABEAS DATA & PRIVACY WARNING SCANNER */}
              {privacyAnalysis.hasRisk ? (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Alerta de Protección de Datos Personales (Habeas Data & Infancia)
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    El sistema detectó posibles indicios de datos personales sensibles o sujetos a reserva legal:
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-amber-900 dark:text-amber-200 space-y-0.5">
                    {privacyAnalysis.flags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>

                  <label className="flex items-start gap-2 pt-2 border-t border-amber-200 dark:border-amber-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadAcknowledgedPrivacy}
                      onChange={(e) => setUploadAcknowledgedPrivacy(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium leading-tight">
                      Certifico bajo la gravedad de juramento que este archivo cuenta con consentimiento previo y expreso conforme a la Ley 1581 de 2012 y directrices del ICBF, y que NO contiene datos sensibles no autorizados.
                    </span>
                  </label>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verificación automática de Habeas Data: Sin indicios de datos sensibles detectados.</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingUpload}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingUpload ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Cargando archivo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Confirmar Carga
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT METADATA MODAL */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Editar Metadatos de Archivo
              </h3>
              <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block">Archivo:</span>
                <span className="font-bold text-slate-800 dark:text-white">{editingFile.originalName}</span>
              </div>

              {editingFile.mimeType.startsWith('image/') && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Texto alternativo (Alt-Text) * <span className="font-normal text-slate-400">(Obligatorio)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFile.altText || ''}
                    onChange={(e) => setEditingFile({ ...editingFile, altText: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Garantiza que personas con discapacidad visual entiendan el contenido mediante lectores de pantalla.
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción institucional * (Mínimo 10 caracteres)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingFile.description}
                  onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deletingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Eliminar Archivo (Baja Lógica)</h3>
                <span className="text-xs text-slate-500">Trazabilidad institucional</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Está seguro de eliminar lógicamente el archivo <strong>"{deletingFile.originalName}"</strong>? El archivo dejará de ser visible para los usuarios y la ciudadanía, pero se mantendrá el registro de auditoría.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motivo institucional de la eliminación:
              </label>
              <textarea
                rows={2}
                placeholder="ej. Reemplazo por documento actualizado con resolución 2026..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFile(null)}
                className="px-4 py-2 text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
