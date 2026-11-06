import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Save,
  Upload,
  MapPin,
  Globe,
  Mail,
  Phone,
  Clock,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Info,
  Shield,
  FileCheck,
  Image as ImageIcon,
  Check,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { api, UserContext } from '../../services/api';
import { Entity } from '../../types';

interface InstitutionalProfilePageProps {
  userContext: UserContext;
}

export const InstitutionalProfilePage: React.FC<InstitutionalProfilePageProps> = ({ userContext }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(userContext.entityId || '');
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable Profile fields
  const [name, setName] = useState('');
  const [sigla, setSigla] = useState('');
  const [primaryResponsible, setPrimaryResponsible] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [serviceHours, setServiceHours] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Initial loading
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const allEntities = await api.getEntities();
        setEntities(allEntities);

        let targetId = userContext.entityId;
        if (!targetId && allEntities.length > 0) {
          targetId = allEntities[0].id;
        }
        if (targetId) {
          setSelectedEntityId(targetId);
          await loadEntity(targetId);
        }
      } catch (err: any) {
        console.error('Error loading initial entities:', err);
        setErrorMessage('No se pudieron cargar los datos iniciales de las entidades.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userContext]);

  const loadEntity = async (id: string) => {
    try {
      const data = await api.getEntityDetail(id);
      const ent = data.entity;
      setEntity(ent);
      setName(ent.name || '');
      setSigla(ent.sigla || ent.code || '');
      setPrimaryResponsible(ent.primaryResponsible || ent.primary_responsible || '');
      setDescription(ent.description || '');
      setAddress(ent.address || ent.institutionalAddress || '');
      setPhone(ent.phone || ent.institutionalPhone || '');
      setEmail(ent.email || ent.institutionalEmail || '');
      setWebsite(ent.website || '');
      setServiceHours(ent.serviceHours || ent.service_hours || ent.hours || ent.general_hours || 'Lunes a Viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.');
      setLogoPreview(ent.logoUrl || ent.logo_url || '');
    } catch (err) {
      console.error('Error fetching entity detail:', err);
    }
  };

  const handleEntityChange = async (newId: string) => {
    setSelectedEntityId(newId);
    setLoading(true);
    await loadEntity(newId);
    setLoading(false);
  };

  // Logo file upload with live preview and upload to Supabase Storage (bucket 'logos')
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('El tamaño del logo debe ser menor a 2MB (se recomienda 512x512 píxeles en formato PNG, JPG o WEBP).');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Solo se admiten formatos de imagen válidos (PNG, JPG, JPEG, WEBP o SVG).');
      return;
    }

    setUploadingLogo(true);
    setUploadSuccess(false);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const resultStr = reader.result as string;
      const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
      
      // Immediate local preview
      setLogoPreview(resultStr);

      try {
        const response = await fetch('/api/media/upload-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userContext.id,
            'x-user-name': userContext.name,
            'x-user-role': userContext.role,
            'x-entity-id': selectedEntityId || userContext.entityId || '',
          },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            mimeType: file.type,
            entityId: selectedEntityId || userContext.entityId,
          }),
        });

        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || 'Error al guardar el logo en Supabase Storage.');
        }

        const newLogoUrl = resData.logoUrl || resData.url;
        if (newLogoUrl) {
          setLogoPreview(newLogoUrl);
          if (entity) {
            setEntity({
              ...entity,
              logoUrl: newLogoUrl,
              logo_url: newLogoUrl,
            });
          }
        }
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err: any) {
        console.error('Error uploading logo:', err);
        setErrorMessage(err.message || 'Error al subir el logo institucional a Supabase Storage.');
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity && !selectedEntityId) return;

    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const targetId = entity ? entity.id : selectedEntityId;
      const updated = await api.updateEntity(
        targetId,
        {
          name,
          sigla,
          primaryResponsible,
          description,
          address,
          phone,
          email,
          website,
          serviceHours,
          service_hours: serviceHours,
          hours: serviceHours,
          logoUrl: logoPreview,
          logo_url: logoPreview,
        },
        userContext
      );

      setEntity(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error updating entity profile:', err);
      setErrorMessage(err.message || 'Error al guardar los datos del perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Cargando expediente del Perfil Institucional...</span>
      </div>
    );
  }

  const isPrivileged = userContext.role === 'admin' || userContext.role === 'coordinator';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-3 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-800 font-mono">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Módulo: Perfil Institucional</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
              <span>{name || entity?.name || 'Perfil Institucional'}</span>
              {(sigla || entity?.sigla || entity?.code) && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                  {sigla || entity?.sigla || entity?.code}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Gestione directamente la identidad oficial, canales de contacto institucional, horarios de atención y el logo oficial que se publicará en el catálogo y en las rutas de atención ciudadana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/mi-entidad/ayuda"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-700 shadow-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Centro de Ayuda</span>
            </Link>

            {/* Privileged Entity Selector */}
            {isPrivileged && entities.length > 0 && (
              <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Seleccionar Entidad para Administrar:
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => handleEntityChange(e.target.value)}
                  className="w-full text-xs bg-slate-900 text-white rounded-lg p-2 border border-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} ({ent.sigla || ent.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Perfil institucional actualizado y sincronizado exitosamente con la base de datos!</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Logo institucional subido correctamente a Supabase Storage (bucket <strong>logos</strong>) y asignado al perfil.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Basic Info */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Identidad y Denominación Oficial</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Nombre Completo de la Entidad:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Sigla / Código:
                  </label>
                  <input
                    type="text"
                    value={sigla}
                    onChange={(e) => setSigla(e.target.value.toUpperCase())}
                    placeholder="Ej: SISBEN"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Servidor Responsable Principal / Enlace:
                  </label>
                  <input
                    type="text"
                    value={primaryResponsible}
                    onChange={(e) => setPrimaryResponsible(e.target.value)}
                    placeholder="Ej: Lic. Carlos Andrés Murillo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tipo de Entidad:
                  </label>
                  <input
                    type="text"
                    value={entity?.entityType || entity?.entity_type || 'Municipal'}
                    disabled
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Descripción Funcional Institucional:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describa el alcance misional y las competencias institucionales de su entidad en la atención a la población migrante..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Channels & Location */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Canales de Contacto y Ubicación</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dirección Institucional:</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Carrera 2 # 24-40, Quibdó, Chocó"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono Institucional / PBX:</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: (604) 671 0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correo Electrónico Oficial:</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@quibdo.gov.co"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sitio Web Oficial:</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.quibdo.gov.co"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Horario de Atención al Público:</span>
                  </label>
                  <input
                    type="text"
                    value={serviceHours}
                    onChange={(e) => setServiceHours(e.target.value)}
                    placeholder="Lunes a Viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: Standard Logo Upload & Live Preview Cards */}
          <div className="space-y-6">
            {/* Logo Upload Card with Standard Size & Live Preview */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Logo Oficial de la Entidad</span>
              </h2>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Suba el escudo o logotipo institucional. Se almacena en la nube en el bucket <strong className="font-mono text-slate-700 dark:text-slate-300">logos</strong> de Supabase.
              </p>

              {/* Clarification Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Nota de gestión institucional:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  Solo debe subir la imagen del logo <strong>en caso de que otro usuario de su entidad no lo haya cargado previamente</strong> o si requiere actualizar el logo oficial existente.
                </p>
              </div>

              {/* Standard 1:1 Live Preview Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Previsualización del Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                    Formato Estándar Recomendado
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Aspecto 1:1 · 512×512 px · Máx. 2MB
                  </span>
                </div>

                <label className="w-full">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                  <span className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Subiendo a Supabase...' : 'Seleccionar Nuevo Logo'}</span>
                  </span>
                </label>
              </div>

              {/* Storage Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ruta de Almacenamiento Supabase</span>
                </div>
                <p className="text-[10px] font-mono break-all text-slate-600 dark:text-slate-400">
                  bucket: <strong>logos</strong>
                </p>
                {logoPreview && logoPreview.startsWith('http') && (
                  <a
                    href={logoPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1 font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver archivo en Supabase Storage</span>
                  </a>
                )}
              </div>
            </div>

            {/* Public Card Mockup Preview */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Previsualización en Portal Ciudadano
              </span>
              
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/50 p-1.5 flex items-center justify-center border border-slate-200 dark:border-slate-600 shrink-0">
                    <img
                      src={logoPreview || '/quibdo_alcaldia_logo.png'}
                      alt={name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/quibdo_alcaldia_logo.png';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                      {sigla || 'ENTIDAD'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {name || 'Nombre de la Entidad'}
                    </h3>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {entity?.entityType || 'Municipal'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {description || 'Sin descripción funcional institucional registrada.'}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate max-w-[150px]">{address || 'Quibdó, Chocó'}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guía Técnica y Centro de Ayuda Callout */}
        <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h4 className="font-serif font-bold text-sm text-emerald-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              ¿Tiene dudas sobre los requisitos o la protección de datos?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consulte la Guía Metodológica y el Manual del Enlace Institucional para conocer los lineamientos oficiales de estructuración de rutas, carga segura de logos y cumplimiento de la normativa PII.
            </p>
          </div>
          <Link
            to="/mi-entidad/ayuda"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <span>Ver Centro de Ayuda Completo</span>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-4 z-30 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 hidden sm:block">
            <span>Última sincronización: </span>
            <strong className="text-slate-700 dark:text-slate-300">
              {entity?.updatedAt || entity?.updated_at ? new Date((entity.updatedAt || entity.updated_at) as string).toLocaleString() : 'Hoy'}
            </strong>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Guardando en Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios del Perfil</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
