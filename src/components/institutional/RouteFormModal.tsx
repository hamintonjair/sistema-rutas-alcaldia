import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  Send,
  CheckCircle2,
  Building2,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  FileText,
  Eye,
  Check,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  AttentionRoute,
  Entity,
  RouteState,
  SystemConfig,
  DynamicRequirement,
  DynamicDocument,
  DynamicStep,
  RouteImage,
} from '../../types';
import { api, UserContext } from '../../services/api';
import { PIIWarningBanner } from '../common/PIIWarningBanner';
import { RoutePreviewModal } from '../public/RoutePreviewModal';

interface RouteFormModalProps {
  route?: AttentionRoute | null;
  entities: Entity[];
  config: SystemConfig;
  userContext: UserContext;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  route,
  entities,
  config,
  userContext,
  onClose,
  onSaveSuccess,
}) => {
  const isEditing = !!route;
  const initialEntityId = route?.entityId || userContext.entityId || entities[0]?.id || 'ent-1';
  const initialEntity = entities.find((e) => e.id === initialEntityId);

  // Basic Fields
  const [name, setName] = useState(route?.name || '');
  const [serviceName, setServiceName] = useState(route?.serviceName || '');
  const [entityId, setEntityId] = useState(initialEntityId);
  const [category, setCategory] = useState(route?.category || (config?.categories && config.categories[0]) || 'Educación e Inclusión Escolar');
  const [description, setDescription] = useState(route?.description || '');
  const [targetPopulation, setTargetPopulation] = useState(
    route?.targetPopulation || (config?.targetPopulations && config.targetPopulations[0]) || 'Niñez y Adolescencia Migrante'
  );
  const [addressedNeed, setAddressedNeed] = useState(route?.addressedNeed || '');

  // Multi Channels Selection
  const AVAILABLE_CHANNELS = [
    'Presencial',
    'Telefónico',
    'Correo electrónico',
    'Formulario web',
    'WhatsApp institucional',
    'Portal institucional',
    'Remisión interinstitucional',
  ];

  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    route?.channels?.length
      ? route.channels
      : route?.channel
      ? [route.channel]
      : ['Presencial', 'Telefónico']
  );

  // Contact Info (prioritizing entity official contact information)
  const [institutionalAddress, setInstitutionalAddress] = useState(
    route?.institutionalAddress || initialEntity?.address || initialEntity?.institutionalAddress || ''
  );
  const [institutionalPhone, setInstitutionalPhone] = useState(
    route?.institutionalPhone || initialEntity?.phone || initialEntity?.institutionalPhone || ''
  );
  const [institutionalEmail, setInstitutionalEmail] = useState(
    route?.institutionalEmail && !route.institutionalEmail.includes('outlook.com') && !route.institutionalEmail.includes('gmail.com')
      ? route.institutionalEmail
      : initialEntity?.email || initialEntity?.institutionalEmail || ''
  );
  const [serviceHours, setServiceHours] = useState(
    route?.serviceHours || 'Lunes a Viernes 8:00 AM - 12:00 PM / 2:00 PM - 5:00 PM'
  );
  const [estimatedResponseTime, setEstimatedResponseTime] = useState(route?.estimatedResponseTime || '3 a 5 días hábiles');

  // Dynamic Requirements
  const [dynamicRequirements, setDynamicRequirements] = useState<DynamicRequirement[]>(
    route?.dynamicRequirements?.length
      ? route.dynamicRequirements
      : route?.requirements?.length
      ? route.requirements.map((r, i) => ({
          id: `req-${i}`,
          text: r,
          order: i + 1,
          isObligatory: true,
          observation: '',
        }))
      : [
          {
            id: 'req-1',
            text: 'Documento de identificación vigente (PPT, Cédula o Certificado de trámite)',
            order: 1,
            isObligatory: true,
            observation: 'Se acepta copia digital legible en ventanilla.',
          },
        ]
  );

  // Dynamic Documents
  const [dynamicDocuments, setDynamicDocuments] = useState<DynamicDocument[]>(
    route?.dynamicDocuments?.length
      ? route.dynamicDocuments
      : route?.requestedDocuments?.length
      ? route.requestedDocuments.map((d, i) => ({
          id: `doc-${i}`,
          name: d,
          description: '',
          isObligatory: true,
          observation: '',
        }))
      : [
          {
            id: 'doc-1',
            name: 'Formulario Único de Solicitud Institucional',
            description: 'Diligenciado y firmado en la dependencia.',
            isObligatory: true,
            observation: '',
          },
        ]
  );

  // Dynamic Steps
  const [dynamicSteps, setDynamicSteps] = useState<DynamicStep[]>(
    route?.dynamicSteps?.length
      ? route.dynamicSteps
      : route?.procedureSteps?.length
      ? route.procedureSteps.map((s, i) => ({
          id: s.id || `step-${i}`,
          stepNumber: s.stepNumber || i + 1,
          title: s.title,
          description: s.description,
          channel: s.channel || 'Presencial',
          estimatedTime: s.estimatedTime || '20 minutos',
          responsible: s.responsibleRole || 'Servidor Público de Ventanilla',
          order: i + 1,
        }))
      : [
          {
            id: 'step-1',
            stepNumber: 1,
            title: 'Radicación de la Solicitud e Ingreso Institucional',
            description: 'El ciudadano presenta la solicitud y los requisitos en la ventanilla de atención.',
            channel: 'Presencial',
            estimatedTime: '30 minutos',
            responsible: 'Enlace de Atención al Ciudadano',
            order: 1,
          },
        ]
  );

  // Helper for initial gallery images with fallback for SISBEN route
  const getInitialGallery = (r?: AttentionRoute | null): RouteImage[] => {
    if (r?.galleryImages && r.galleryImages.length > 0) {
      return r.galleryImages;
    }
    if (r?.id === 'rut-1793658992695' || r?.name?.toLowerCase().includes('educacion a la poblacion migrante')) {
      return [
        {
          id: 'img-1793841437452',
          url: 'https://njgrdfirekirpepzsltm.supabase.co/storage/v1/object/public/imagen/img_1793841437452_wschd.png',
          altText: 'Atención y orientación institucional en ventanilla SISBÉN',
          description: 'Fotografía oficial de la sede de atención',
          order: 1,
        },
        {
          id: 'img-1793841437469',
          url: 'https://njgrdfirekirpepzsltm.supabase.co/storage/v1/object/public/imagen/img_1793841437469_dfdj1.png',
          altText: 'Acompañamiento a la niñez y familias migrantes',
          description: 'Atención personalizada para acceso a servicios educativos',
          order: 2,
        },
      ];
    }
    return [];
  };

  // Images & Media
  const [mainImageUrl, setMainImageUrl] = useState(
    route?.mainImageUrl || '/src/assets/images/quibdo_alcaldia_logo_1793464458662.jpg'
  );
  const [mainImageAlt, setMainImageAlt] = useState(
    route?.mainImageAlt || 'Atención Institucional de la Alcaldía de Quibdó'
  );
  const [galleryImages, setGalleryImages] = useState<RouteImage[]>(getInitialGallery(route));

  // Other fields
  const [articulatedEntityIds, setArticulatedEntityIds] = useState<string[]>(route?.articulatedEntityIds || []);
  const [institutionalOfficer, setInstitutionalOfficer] = useState(route?.institutionalOfficer || userContext.name || '');
  const [technicalObservations, setTechnicalObservations] = useState(route?.technicalObservations || '');
  const [institutionalCommitments, setInstitutionalCommitments] = useState(route?.institutionalCommitments || '');
  const [nextReviewDate, setNextReviewDate] = useState(
    route?.nextReviewDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<RouteState>(route?.status || 'Borrador');

  // Modals & UI Controls
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedEnlargedImage, setSelectedEnlargedImage] = useState<string | null>(null);
  const [piiWarnings, setPiiWarnings] = useState<string[]>([]);
  const [showPiiAlertModal, setShowPiiAlertModal] = useState(false);
  const lastLoadedRouteIdRef = useRef<string | null>(route?.id || null);

  // Sync state if route prop changes or is freshly provided
  useEffect(() => {
    if (route) {
      if (lastLoadedRouteIdRef.current === route.id) {
        return;
      }
      lastLoadedRouteIdRef.current = route.id;

      if (route.name) setName(route.name);
      if (route.serviceName) setServiceName(route.serviceName);
      if (route.entityId) setEntityId(route.entityId);
      if (route.category) setCategory(route.category);
      if (route.description) setDescription(route.description);
      if (route.targetPopulation) setTargetPopulation(route.targetPopulation);
      if (route.addressedNeed) setAddressedNeed(route.addressedNeed);
      if (route.channels && route.channels.length > 0) setSelectedChannels(route.channels);
      else if (route.channel) setSelectedChannels([route.channel]);
      if (route.institutionalAddress) setInstitutionalAddress(route.institutionalAddress);
      if (route.institutionalPhone) setInstitutionalPhone(route.institutionalPhone);
      if (route.institutionalEmail) setInstitutionalEmail(route.institutionalEmail);
      if (route.serviceHours) setServiceHours(route.serviceHours);
      if (route.estimatedResponseTime) setEstimatedResponseTime(route.estimatedResponseTime);
      if (route.mainImageUrl) setMainImageUrl(route.mainImageUrl);
      if (route.mainImageAlt) setMainImageAlt(route.mainImageAlt);
      if (route.status) setStatus(route.status);
      if (route.technicalObservations) setTechnicalObservations(route.technicalObservations);
      if (route.institutionalCommitments) setInstitutionalCommitments(route.institutionalCommitments);
      if (route.nextReviewDate) setNextReviewDate(route.nextReviewDate);

      const gal = getInitialGallery(route);
      if (gal.length > 0) {
        setGalleryImages(gal);
      }
      if (route.dynamicRequirements && route.dynamicRequirements.length > 0) {
        setDynamicRequirements(route.dynamicRequirements);
      } else if (route.requirements && route.requirements.length > 0) {
        setDynamicRequirements(route.requirements.map((r, i) => ({
          id: `req-${i + 1}`,
          text: r,
          order: i + 1,
          isObligatory: true,
          observation: '',
        })));
      }
      if (route.dynamicDocuments && route.dynamicDocuments.length > 0) {
        setDynamicDocuments(route.dynamicDocuments);
      } else if (route.requestedDocuments && route.requestedDocuments.length > 0) {
        setDynamicDocuments(route.requestedDocuments.map((d, i) => ({
          id: `doc-${i + 1}`,
          name: d,
          description: '',
          isObligatory: true,
          observation: '',
        })));
      }
      if (route.dynamicSteps && route.dynamicSteps.length > 0) {
        setDynamicSteps(route.dynamicSteps);
      } else if (route.procedureSteps && route.procedureSteps.length > 0) {
        setDynamicSteps(route.procedureSteps.map((s, i) => ({
          id: s.id || `step-${i + 1}`,
          stepNumber: s.stepNumber || i + 1,
          title: s.title,
          description: s.description,
          channel: s.channel || 'Presencial',
          estimatedTime: s.estimatedTime || '15 a 30 minutos',
          responsible: s.responsibleRole || 'Servidor Público Responsable',
          order: i + 1,
        })));
      }
    }
  }, [route]);

  // Real-time PII Detector
  const handlePIICheck = () => {
    const fullText = `${name} ${serviceName} ${description} ${addressedNeed} ${institutionalAddress} ${technicalObservations} ${institutionalCommitments} ${dynamicRequirements.map((r) => r.text).join(' ')}`;
    const foundWarnings: string[] = [];

    if (/\b(CC|TI|CE|PEP|PPT|Pasaporte)\s*[:#.]?\s*\d{6,11}\b/i.test(fullText) || /\b\d{1,3}\.\d{3}\.\d{3}\b/.test(fullText)) {
      foundWarnings.push('Se detectó un posible número de cédula o documento personal identificable.');
    }
    if (/\b3[0-5]\d[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(fullText)) {
      foundWarnings.push('Se detectó un posible número de teléfono celular privado.');
    }
    if (/\b(historia clínica|paciente específico|víctima|nombre del menor|manzana \d+ casa \d+)\b/i.test(fullText)) {
      foundWarnings.push('Se detectó vocabulario o direcciones asociadas a historias clínicas o casos individuales.');
    }

    setPiiWarnings(foundWarnings);
  };

  // Completeness Calculator
  const getIncompleteFields = () => {
    const incomplete: string[] = [];
    if (!name.trim()) incomplete.push('Nombre de la ruta');
    if (!serviceName.trim()) incomplete.push('Nombre del servicio');
    if (!category.trim()) incomplete.push('Categoría');
    if (!description.trim()) incomplete.push('Descripción institucional');
    if (selectedChannels.length === 0) incomplete.push('Mínimo un canal de atención');
    if (!institutionalAddress.trim() && !institutionalEmail.trim()) incomplete.push('Dirección o Correo institucional');
    if (dynamicSteps.length === 0 || dynamicSteps.some((s) => !s.title.trim())) incomplete.push('Paso a paso con título válido');
    return incomplete;
  };

  const incompleteFields = getIncompleteFields();

  // Dynamic Requirements Handler
  const updateRequirementField = (index: number, field: keyof DynamicRequirement, value: any) => {
    setDynamicRequirements((prev) =>
      prev.map((req, i) => (i === index ? { ...req, [field]: value } : req))
    );
  };

  const addRequirement = () => {
    setDynamicRequirements((prev) => [
      ...prev,
      {
        id: `req-${Date.now()}-${prev.length + 1}`,
        text: '',
        order: prev.length + 1,
        isObligatory: true,
        observation: '',
      },
    ]);
  };

  const removeRequirement = (id: string) => {
    setDynamicRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  // Dynamic Documents Handler
  const updateDocumentField = (index: number, field: keyof DynamicDocument, value: any) => {
    setDynamicDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const addDocument = () => {
    setDynamicDocuments((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${prev.length + 1}`,
        name: '',
        description: '',
        isObligatory: true,
        observation: '',
      },
    ]);
  };

  const removeDocument = (id: string) => {
    setDynamicDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Dynamic Steps Handler & Reordering
  const updateStepField = (index: number, field: keyof DynamicStep, value: any) => {
    setDynamicSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const addStep = () => {
    setDynamicSteps((prev) => [
      ...prev,
      {
        id: `step-${Date.now()}-${prev.length + 1}`,
        stepNumber: prev.length + 1,
        title: '',
        description: '',
        channel: 'Presencial',
        estimatedTime: '15 a 30 minutos',
        responsible: 'Servidor Público Responsable',
        order: prev.length + 1,
      },
    ]);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setDynamicSteps((prev) => {
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === prev.length - 1)) return prev;
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((s, i) => ({ ...s, stepNumber: i + 1, order: i + 1 }));
    });
  };

  const removeStep = (id: string) => {
    setDynamicSteps((prev) =>
      prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, stepNumber: i + 1, order: i + 1 }))
    );
  };

  // Multi Channel Checkbox Toggle
  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  // Image Upload Handler (Canvas compression & Supabase Storage upload to bucket 'imagen')
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    Array.from(files).forEach((file) => {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validFormats.includes(file.type.toLowerCase())) {
        alert(`Formato no permitido para ${file.name}. Formatos permitidos: JPG, PNG, WEBP.`);
        setUploadingImage(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          try {
            const res = await api.uploadStorageImage(dataUrl, file.name, file.type, userContext);
            const finalUrl = res.url || dataUrl;

            if (target === 'main') {
              setMainImageUrl(finalUrl);
            } else {
              setGalleryImages((prev) => [
                ...prev,
                {
                  id: `img-${Date.now()}-${Math.random()}`,
                  url: finalUrl,
                  altText: `Imagen de apoyo para ${name || 'Ruta'}`,
                  description: 'Fotografía o infografía oficial de la ruta',
                  order: prev.length + 1,
                },
              ]);
            }
          } catch (err) {
            console.warn('Error subiendo imagen a Supabase Storage, manteniendo base64:', err);
            if (target === 'main') {
              setMainImageUrl(dataUrl);
            } else {
              setGalleryImages((prev) => [
                ...prev,
                {
                  id: `img-${Date.now()}-${Math.random()}`,
                  url: dataUrl,
                  altText: `Imagen de apoyo para ${name || 'Ruta'}`,
                  description: 'Fotografía o infografía oficial de la ruta',
                  order: prev.length + 1,
                },
              ]);
            }
          } finally {
            setUploadingImage(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteMainImage = async () => {
    if (!mainImageUrl) return;
    const targetUrl = mainImageUrl;
    setMainImageUrl('');
    if (targetUrl && (targetUrl.includes('supabase') || targetUrl.includes('/storage/'))) {
      try {
        await api.deleteStorageImage(targetUrl, userContext);
      } catch (err) {
        console.warn('Error eliminando imagen principal de storage:', err);
      }
    }
  };

  const removeGalleryImage = async (id: string) => {
    const targetImg = galleryImages.find((g) => g.id === id);
    setGalleryImages((prev) => prev.filter((g) => g.id !== id));
    if (targetImg && targetImg.url && (targetImg.url.includes('supabase') || targetImg.url.includes('/storage/'))) {
      try {
        await api.deleteStorageImage(targetImg.url, userContext);
      } catch (err) {
        console.warn('Error eliminando imagen de galería de storage:', err);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (targetStatus?: RouteState, forceWithoutClose?: boolean) => {
    handlePIICheck();

    if (targetStatus === 'Publicada' && incompleteFields.length > 0) {
      alert(`No es posible publicar una ruta incompleta. Complete los siguientes campos obligatorios: ${incompleteFields.join(', ')}.`);
      return;
    }

    if (piiWarnings.length > 0 && !showPiiAlertModal) {
      setShowPiiAlertModal(true);
      return;
    }

    const finalStatus = targetStatus || status;

    const selectedEntityObj = entities.find((e) => e.id === entityId);

    const payload: Partial<AttentionRoute> = {
      name,
      serviceName,
      entityId,
      entityName: selectedEntityObj?.name || route?.entityName || userContext.entityName || 'Entidad Municipal',
      category,
      description,
      targetPopulation,
      addressedNeed,
      requirements: dynamicRequirements.map((r) => r.text).filter(Boolean),
      dynamicRequirements,
      requestedDocuments: dynamicDocuments.map((d) => d.name).filter(Boolean),
      dynamicDocuments,
      channel: selectedChannels[0] || 'Presencial',
      channels: selectedChannels,
      institutionalAddress,
      institutionalPhone,
      institutionalEmail,
      serviceHours,
      estimatedResponseTime,
      procedureSteps: dynamicSteps.map((s, i) => ({
        id: s.id || `step-${i + 1}`,
        stepNumber: s.stepNumber || i + 1,
        title: s.title,
        description: s.description,
        responsibleRole: s.responsible || 'Servidor Público Responsable',
        channel: s.channel || 'Presencial',
        estimatedTime: s.estimatedTime || '15 a 30 minutos',
      })),
      dynamicSteps: dynamicSteps.map((s, i) => ({
        ...s,
        stepNumber: s.stepNumber || i + 1,
        order: s.order || i + 1,
      })),
      institutionalOfficer,
      technicalObservations,
      institutionalCommitments,
      nextReviewDate,
      mainImageUrl,
      mainImageAlt,
      galleryImages,
      incompleteFields,
      status: finalStatus,
    };

    setSaving(true);
    try {
      if (isEditing && route) {
        await api.updateRoute(route.id, payload, userContext);
      } else {
        await api.createRoute(payload, userContext);
      }
      onSaveSuccess();
      if (!forceWithoutClose) {
        onClose();
      } else {
        alert('Progreso guardado correctamente.');
        setStatus(finalStatus);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar la ruta.');
    } finally {
      setSaving(false);
      setShowPiiAlertModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>{isEditing ? `Editar Ruta: ${route.name}` : 'Registrar Nueva Ruta de Atención (Fase 3)'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Carga institucional completa con campos dinámicos, imágenes y verificación de PII
            </p>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div
          onKeyUp={handlePIICheck}
          className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
        >
          {/* PII Warning Banner */}
          <PIIWarningBanner />

          {/* Incomplete Fields Ribbon */}
          {incompleteFields.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>Indicador de Campos Incompletos ({incompleteFields.length}):</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Faltan los siguientes campos obligatorios para enviar a revisión: <strong>{incompleteFields.join(', ')}</strong>.
              </p>
            </div>
          )}

          {/* SECTION 1: GENERAL PROFILE */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
              1. Datos Institucionales del Servicio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Entidad Responsable:</label>
                <select
                  value={entityId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setEntityId(newId);
                    const matched = entities.find((ent) => ent.id === newId);
                    if (matched) {
                      if (matched.address || matched.institutionalAddress) {
                        setInstitutionalAddress(matched.address || matched.institutionalAddress || '');
                      }
                      if (matched.phone || matched.institutionalPhone) {
                        setInstitutionalPhone(matched.phone || matched.institutionalPhone || '');
                      }
                      if (matched.email || matched.institutionalEmail) {
                        setInstitutionalEmail(matched.email || matched.institutionalEmail || '');
                      }
                    }
                  }}
                  disabled={userContext.role === 'institutional' && !!userContext.entityId}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      {ent.name} ({ent.sigla || ent.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Categoría Temática:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {(config?.categories || []).map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Nombre Oficial de la Ruta de Atención:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Ruta de Atención en Salud Integral para Mujeres Embarazadas Migrantes"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Nombre del Servicio Institucional:</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ej: Control Prenatal Prioritario y Afiliación"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Población Objetivo Beneficiaria:</label>
                <select
                  value={targetPopulation}
                  onChange={(e) => setTargetPopulation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {(config?.targetPopulations || []).map((pop, idx) => (
                    <option key={idx} value={pop}>
                      {pop}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Descripción Funcional e Institucional:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa el objetivo institucional y los beneficios del servicio..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Necesidad Concreta que Atiende:</label>
              <input
                type="text"
                value={addressedNeed}
                onChange={(e) => setAddressedNeed(e.target.value)}
                placeholder="Ej: Acceso a servicios de salud prenatal sin barrera de estatus migratorio"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SECTION 2: DYNAMIC REQUIREMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                2. Requisitos Dinámicos ({dynamicRequirements.length})
              </h3>
              <button
                type="button"
                onClick={addRequirement}
                className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Requisito</span>
              </button>
            </div>

            <div className="space-y-3">
              {dynamicRequirements.map((req, idx) => (
                <div
                  key={req.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Requisito #{idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={req.isObligatory}
                          onChange={(e) => updateRequirementField(idx, 'isObligatory', e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-semibold text-rose-700 dark:text-rose-400">¿Es Obligatorio?</span>
                      </label>

                      {dynamicRequirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(req.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={req.text}
                    onChange={(e) => updateRequirementField(idx, 'text', e.target.value)}
                    placeholder="Descripción clara del requisito..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />

                  <input
                    type="text"
                    value={req.observation || ''}
                    onChange={(e) => updateRequirementField(idx, 'observation', e.target.value)}
                    placeholder="Observación opcional (ej: En caso de no poseer documento, presentar certificación temporal)..."
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: DYNAMIC DOCUMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                3. Documentos Solicitados Dinámicos ({dynamicDocuments.length})
              </h3>
              <button
                type="button"
                onClick={addDocument}
                className="px-3 py-1 bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Documento</span>
              </button>
            </div>

            <div className="space-y-3">
              {dynamicDocuments.map((docItem, idx) => (
                <div
                  key={docItem.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      Documento #{idx + 1}
                    </span>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={docItem.isObligatory}
                          onChange={(e) => updateDocumentField(idx, 'isObligatory', e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-semibold text-rose-700 dark:text-rose-400">¿Obligatorio?</span>
                      </label>

                      {dynamicDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocument(docItem.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={docItem.name}
                      onChange={(e) => updateDocumentField(idx, 'name', e.target.value)}
                      placeholder="Nombre del documento..."
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                    />

                    <input
                      type="text"
                      value={docItem.description || ''}
                      onChange={(e) => updateDocumentField(idx, 'description', e.target.value)}
                      placeholder="Descripción breve..."
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: DYNAMIC PROCEDURE STEPS & REORDERING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                4. Procedimiento Paso a Paso con Reordenamiento ({dynamicSteps.length})
              </h3>
              <button
                type="button"
                onClick={addStep}
                className="px-3 py-1 bg-slate-900 text-white dark:bg-emerald-600 text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Añadir Paso</span>
              </button>
            </div>

            <div className="space-y-3">
              {dynamicSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                        {step.stepNumber || idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Paso #{step.stepNumber || idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveStep(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 disabled:opacity-30"
                        title="Subir de orden"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(idx, 'down')}
                        disabled={idx === dynamicSteps.length - 1}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 disabled:opacity-30"
                        title="Bajar de orden"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {dynamicSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Título del Paso:</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStepField(idx, 'title', e.target.value)}
                        placeholder="Ej: Radicación de la documentación"
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Responsable del Paso:</label>
                      <input
                        type="text"
                        value={step.responsible || ''}
                        onChange={(e) => updateStepField(idx, 'responsible', e.target.value)}
                        placeholder="Ej: Servidor de Ventanilla"
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1">Descripción del Paso:</label>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => updateStepField(idx, 'description', e.target.value)}
                      placeholder="Explicación detallada de la gestión..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Canal de este Paso:</label>
                      <select
                        value={step.channel || 'Presencial'}
                        onChange={(e) => updateStepField(idx, 'channel', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        {AVAILABLE_CHANNELS.map((ch, i) => (
                          <option key={i} value={ch}>
                            {ch}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Tiempo Estimado:</label>
                      <input
                        type="text"
                        value={step.estimatedTime || ''}
                        onChange={(e) => updateStepField(idx, 'estimatedTime', e.target.value)}
                        placeholder="Ej: 15 minutos / 1 día hábil"
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: MULTI CHANNELS & CONTACT */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
              5. Canales de Atención Múltiples e Información de Contacto
            </h3>

            <div>
              <label className="block font-semibold mb-2">Canales Habilitados (Seleccione todos los aplicables):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                {AVAILABLE_CHANNELS.map((ch, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(ch)}
                      onChange={() => toggleChannel(ch)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{ch}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Dirección Institucional:</label>
                <input
                  type="text"
                  value={institutionalAddress}
                  onChange={(e) => setInstitutionalAddress(e.target.value)}
                  placeholder="Calle 24 # 2-45, Quibdó"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Teléfono Institucional:</label>
                <input
                  type="text"
                  value={institutionalPhone}
                  onChange={(e) => setInstitutionalPhone(e.target.value)}
                  placeholder="(604) 671 0000"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Correo Institucional:</label>
                <input
                  type="email"
                  value={institutionalEmail}
                  onChange={(e) => setInstitutionalEmail(e.target.value)}
                  placeholder="contacto@quibdo.gov.co"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: IMAGES & GALLERY */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
              6. Galería e Imágenes Institucionales (JPG, PNG, WEBP)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Main Image upload */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Imagen Principal de la Ruta</span>
                  {uploadingImage && <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">Subiendo a Storage...</span>}
                </div>

                {mainImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 group">
                    <img
                      src={mainImageUrl}
                      alt={mainImageAlt}
                      onError={(e) => {
                        if (!e.currentTarget.src.includes('/api/storage/proxy')) {
                          e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(mainImageUrl)}`;
                        }
                      }}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteMainImage}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-105"
                      title="Eliminar Imagen Principal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs bg-white dark:bg-slate-800/50">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span>Sin imagen principal asignada</span>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Texto Alternativo Obligatorio (Alt):</label>
                  <input
                    type="text"
                    value={mainImageAlt}
                    onChange={(e) => setMainImageAlt(e.target.value)}
                    placeholder="Descripción para accesibilidad..."
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="px-3 py-1.5 bg-slate-900 text-white dark:bg-emerald-600 hover:bg-slate-800 text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Imagen Principal</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'main')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Gallery Images upload */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">Galería Adicional ({galleryImages.length})</span>
                  {uploadingImage && <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">Cargando fotografías...</span>}
                </div>

                {galleryImages.length === 0 ? (
                  <div className="py-4 px-2 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 text-xs bg-white/50 dark:bg-slate-800/30">
                    <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-40 text-slate-400" />
                    <span>No hay fotografías adicionales en la galería aún.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 group bg-slate-900">
                        <img
                          src={img.url}
                          alt={img.altText || 'Fotografía de la galería'}
                          onClick={() => setSelectedEnlargedImage(img.url)}
                          title="Clic para ampliar fotografía"
                          onError={(e) => {
                            if (!e.currentTarget.src.includes('/api/storage/proxy')) {
                              e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(img.url)}`;
                            }
                          }}
                          className="w-full h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(img.id)}
                          className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full hover:bg-rose-700 shadow-sm"
                          title="Eliminar de galería"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-500 text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Añadir Fotografía a Galería</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => handleFileUpload(e, 'gallery')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Vista previa pública</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl"
            >
              Cancelar
            </button>

            {/* Save Draft */}
            <button
              type="button"
              disabled={saving || uploadingImage}
              onClick={() => handleSubmit('Borrador')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Borrador</span>
            </button>

            {/* Save and Continue */}
            <button
              type="button"
              disabled={saving || uploadingImage}
              onClick={() => handleSubmit(status, false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl flex items-center gap-1.5"
            >
              <span>Guardar y Continuar</span>
            </button>

            {/* Publish Route */}
            <button
              type="button"
              disabled={saving || uploadingImage || incompleteFields.length > 0}
              onClick={() => handleSubmit('Publicada')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              title={incompleteFields.length > 0 ? `Complete: ${incompleteFields.join(', ')}` : 'Publicar esta ruta en el portal público'}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Publicando...' : 'Publicar Ruta'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Public Route Preview Modal */}
      {showPreview && (
        <RoutePreviewModal
          route={{
            name,
            serviceName,
            category,
            description,
            targetPopulation,
            channel: selectedChannels[0] || 'Presencial',
            channels: selectedChannels,
            institutionalAddress,
            institutionalPhone,
            institutionalEmail,
            estimatedResponseTime,
            dynamicRequirements,
            dynamicSteps,
            mainImageUrl,
            mainImageAlt,
            galleryImages,
            status,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* PII Alert Modal Confirmation */}
      {showPiiAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-300 dark:border-rose-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Advertencia de Posible Dato Personal Sensible (PII)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El sistema ha detectado posibles referencias a datos personales o de casos individuales en el texto ingresado.
            </p>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 text-xs text-rose-800 dark:text-rose-300">
              <ul className="list-disc list-inside space-y-1 font-semibold">
                {piiWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] text-slate-500">
              ¿Desea revisar y corregir antes de guardar, o confirma que la información es 100% institucional?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPiiAlertModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Volver a Revisar
              </button>
              <button
                onClick={() => handleSubmit(status, false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Confirmar y Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Lightbox */}
      {selectedEnlargedImage && (
        <div
          onClick={() => setSelectedEnlargedImage(null)}
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-2"
          >
            <button
              onClick={() => setSelectedEnlargedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full shadow-lg"
              title="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedEnlargedImage}
              alt="Fotografía institucional ampliada"
              className="max-h-[80vh] w-auto max-w-full object-contain mx-auto rounded-lg"
              onError={(e) => {
                if (!e.currentTarget.src.includes('/api/storage/proxy')) {
                  e.currentTarget.src = `/api/storage/proxy?url=${encodeURIComponent(selectedEnlargedImage)}`;
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
