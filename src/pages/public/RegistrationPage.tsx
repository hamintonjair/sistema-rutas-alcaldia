import React, { useState } from 'react';
import { User, Phone, MapPin, Plus, Trash2, ShieldCheck, HeartPulse, GraduationCap, Users, Save, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { api, UserContext } from '../../services/api';

interface RegistrationPageProps {
  userContext?: UserContext;
  onSuccess?: () => void;
  hideHeader?: boolean;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ userContext, onSuccess, hideHeader = false }) => {
  const docTypes = [
    'Cédula', 
    'Tarjeta de Identidad', 
    'Pasaporte', 
    'Registro Civil', 
    'PPT - Permiso por Protección Temporal', 
    'PEP - Permiso Especial de Permanencia', 
    'Cédula de extranjería'
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    tipoDocumento: 'Cédula',
    numeroDocumento: '',
    telefono: '',
    barrio: '',
    edad: '',
    genero: '',
    personaDiscapacidad: false,
    tieneEsposo: false,
    esposoNombre: '',
    esposoTipoDocumento: 'Cédula',
    esposoNumeroDocumento: '',
    esposoEdad: '',
    esposoGenero: '',
    esposoDiscapacidad: false,
    tieneHijos: false,
    hijos: [] as { name: string; docType: string; docNumber: string; age: string; gender: string; hasDisability: boolean; studies: boolean }[],
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addChildren = () => {
    setFormData(prev => ({
      ...prev,
      hijos: [...prev.hijos, { name: '', docType: 'Cédula', docNumber: '', age: '', gender: '', hasDisability: false, studies: false }]
    }));
  };

  const removeChildren = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hijos: prev.hijos.filter((_, i) => i !== index)
    }));
  };

  const handleChildrenChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hijos: prev.hijos.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        entidad: userContext?.entityName || 'portal',
      };

      const res = await api.savePopulationRegistration(payload, userContext);
      if (res.success) {
        setSuccess(true);
        // Reset form except for some fields if needed
        setFormData({
          nombre: '',
          tipoDocumento: 'Cédula',
          numeroDocumento: '',
          telefono: '',
          barrio: '',
          edad: '',
          genero: '',
          personaDiscapacidad: false,
          tieneEsposo: false,
          esposoNombre: '',
          esposoTipoDocumento: 'Cédula',
          esposoNumeroDocumento: '',
          esposoEdad: '',
          esposoGenero: '',
          esposoDiscapacidad: false,
          tieneHijos: false,
          hijos: [],
        });
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      console.error('Error saving registration:', err);
      setError(err.message || 'Error al guardar el registro. Verifique que la tabla de base de datos exista y tenga permisos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${hideHeader ? '' : 'py-10 px-4'}`}>
      {!hideHeader && (
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Users className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Registro Oficial de Población</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Censo de Población Atendida</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Formulario para el registro estadístico y seguimiento de la población migrante y local en Quibdó. Los datos serán tratados bajo la política de protección de datos personales.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Error en el servidor</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">¡Registro Exitoso!</p>
            <p className="opacity-90">La información ha sido guardada correctamente en el sistema institucional.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-200/50">
        {/* 1. Datos Personales */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Información del Solicitante</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
              <input 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                placeholder="Ej: Juan Pérez" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Documento</label>
              <div className="relative">
                <select 
                  name="tipoDocumento" 
                  value={formData.tipoDocumento} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 appearance-none transition-all outline-none" 
                  required
                >
                  {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Número de Documento</label>
              <input 
                name="numeroDocumento" 
                value={formData.numeroDocumento} 
                onChange={handleChange} 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                placeholder="000.000.000" 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange} 
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                  placeholder="300 000 0000" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Barrio / Localidad</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input 
                  name="barrio" 
                  value={formData.barrio} 
                  onChange={handleChange} 
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                  placeholder="Barrio El Jardín" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Edad</label>
                <input 
                  name="edad" 
                  value={formData.edad} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                  placeholder="Ej: 25" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Género</label>
                <div className="relative">
                  <select 
                    name="genero" 
                    value={formData.genero} 
                    onChange={handleChange} 
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-emerald-500 appearance-none transition-all outline-none"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Persona con discapacidad</span>
              <span className="text-xs text-slate-500 block">Marque si requiere algún apoyo o ajuste razonable.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="personaDiscapacidad" checked={formData.personaDiscapacidad} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </section>

        {/* 2. Cónyuge */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Información del Cónyuge</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="tieneEsposo" checked={formData.tieneEsposo} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {formData.tieneEsposo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-blue-50/30 dark:bg-blue-950/10 rounded-3xl border border-blue-100 dark:border-blue-900/40 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                <input 
                  value={formData.esposoNombre} 
                  onChange={(e) => setFormData({...formData, esposoNombre: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                  placeholder="Nombre de la pareja" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Documento</label>
                <div className="relative">
                  <select 
                    value={formData.esposoTipoDocumento} 
                    onChange={(e) => setFormData({...formData, esposoTipoDocumento: e.target.value})} 
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 appearance-none transition-all outline-none"
                  >
                    {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Número de Documento</label>
                <input 
                  value={formData.esposoNumeroDocumento} 
                  onChange={(e) => setFormData({...formData, esposoNumeroDocumento: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                  placeholder="Documento de la pareja" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Edad</label>
                  <input 
                    value={formData.esposoEdad} 
                    onChange={(e) => setFormData({...formData, esposoEdad: e.target.value})} 
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                    placeholder="Edad" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Género</label>
                  <div className="relative">
                    <select 
                      value={formData.esposoGenero} 
                      onChange={(e) => setFormData({...formData, esposoGenero: e.target.value})} 
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 appearance-none transition-all outline-none"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">¿Posee alguna discapacidad?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.esposoDiscapacidad} onChange={(e) => setFormData({...formData, esposoDiscapacidad: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* 3. Hijos */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center border border-purple-100 dark:border-purple-800">
                <Users className="w-5 h-5 text-purple-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Información de los Hijos</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="tieneHijos" checked={formData.tieneHijos} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {formData.tieneHijos && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {formData.hijos.map((child, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 relative group">
                  <button 
                    type="button" 
                    onClick={() => removeChildren(index)} 
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Eliminar hijo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre</label>
                      <input 
                        value={child.name} 
                        onChange={(e) => handleChildrenChange(index, 'name', e.target.value)} 
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500" 
                        placeholder="Nombre del hijo/a" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tipo Documento</label>
                      <div className="relative">
                        <select 
                          value={child.docType} 
                          onChange={(e) => handleChildrenChange(index, 'docType', e.target.value)} 
                          className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        >
                          {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nro. Documento</label>
                      <input 
                        value={child.docNumber} 
                        onChange={(e) => handleChildrenChange(index, 'docNumber', e.target.value)} 
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500" 
                        placeholder="Documento" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Edad</label>
                        <input 
                          value={child.age} 
                          onChange={(e) => handleChildrenChange(index, 'age', e.target.value)} 
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500" 
                          placeholder="Edad" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Género</label>
                        <div className="relative">
                          <select 
                            value={child.gender} 
                            onChange={(e) => handleChildrenChange(index, 'gender', e.target.value)} 
                            className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                          >
                            <option value="">...</option>
                            <option value="Femenino">Fem</option>
                            <option value="Masculino">Mas</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-3 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer group/cb">
                        <input 
                          type="checkbox" 
                          checked={child.studies} 
                          onChange={(e) => handleChildrenChange(index, 'studies', e.target.checked)} 
                          className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs font-semibold text-slate-600 group-hover/cb:text-purple-600 transition-colors">¿Actualmente estudia?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group/cb">
                        <input 
                          type="checkbox" 
                          checked={child.hasDisability} 
                          onChange={(e) => handleChildrenChange(index, 'hasDisability', e.target.checked)} 
                          className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs font-semibold text-slate-600 group-hover/cb:text-purple-600 transition-colors">¿Tiene alguna discapacidad?</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={addChildren} 
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar integrante del núcleo familiar</span>
              </button>
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando registro...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Confirmar y Guardar Registro de Población</span>
              </>
            )}
          </button>
          <div className="mt-4 flex items-center gap-2 justify-center text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sus datos están protegidos bajo la Ley 1581 de 2012 de Habeas Data</span>
          </div>
        </div>
      </form>
    </div>
  );
};

