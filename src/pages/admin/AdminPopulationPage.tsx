import React, { useState, useEffect } from 'react';
import { api, UserContext } from '../../services/api';
import * as XLSX from 'xlsx-js-style';
import { Download, Users, Eye, Calendar, MapPin, Phone, Info, X, ShieldCheck, Search, ArrowLeft, ArrowRight, Building2, User, Filter } from 'lucide-react';

interface AdminPopulationPageProps {
  userContext: UserContext;
}

export const AdminPopulationPage: React.FC<AdminPopulationPageProps> = ({ userContext }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [entities, setEntities] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const limit = 20;

  useEffect(() => {
    api.getEntities()
      .then(data => {
        if (Array.isArray(data)) {
          setEntities(data);
        }
      })
      .catch(err => console.error('Error fetching entities for filter:', err));
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [page, userContext, selectedEntity]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, total } = await api.getPopulationRegistrations(page, limit, userContext, selectedEntity);
      setRegistrations(data || []);
      setTotal(total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Obtener todos los registros disponibles según el filtro para exportar la data completa
      let exportRecords = registrations;
      if (total > registrations.length) {
        try {
          const fullRes = await api.getPopulationRegistrations(1, 10000, userContext, selectedEntity);
          if (fullRes?.data && fullRes.data.length > 0) {
            exportRecords = fullRes.data;
          }
        } catch (e) {
          console.warn('No fue posible descargar el censo completo para exportación, usando página actual', e);
        }
      }

      // No se incluye la columna ID por requerimiento
      const headers = [
        'Nombre', 'Tipo Documento', 'Número Documento', 'Teléfono', 
        'Barrio', 'Edad', 'Género', 'Persona Discapacidad', 
        'Entidad Registro', 'Fecha Registro', 'Núcleo Familiar'
      ];

      const data = exportRecords.map(r => {
        let familySummary = '';
        if (r.tieneEsposo) {
          familySummary += `Cónyuge: ${r.esposoNombre || ''} (${r.esposoTipoDocumento || 'Doc'}: ${r.esposoNumeroDocumento || ''}, ${r.esposoEdad || ''} años, ${r.esposoGenero || ''}, Discapacidad: ${r.esposoDiscapacidad ? 'SÍ' : 'NO'})`;
        }
        if (r.tieneHijos && r.hijos?.length > 0) {
          if (familySummary) familySummary += ' | ';
          familySummary += 'Hijos: ' + r.hijos.map((h: any) => 
            `${h.name || ''} (${h.docType || 'Doc'}: ${h.docNumber || ''}, ${h.age || ''} años, ${h.gender || ''}, Discapacidad: ${h.hasDisability ? 'SÍ' : 'NO'}, Estudia: ${h.studies ? 'SÍ' : 'NO'})`
          ).join('; ');
        }

        return [
          r.nombre,
          r.tipoDocumento,
          r.numeroDocumento,
          r.telefono,
          r.barrio,
          r.edad || r.rangoEdad,
          r.genero,
          r.personaDiscapacidad ? 'SÍ' : 'NO',
          r.entidad === 'portal' ? 'Portal Público' : (r.entidad || 'N/A'),
          new Date(r.created_at || r.createdAt).toLocaleString('es-CO'),
          familySummary || 'N/A'
        ];
      });

      // Crear hoja de cálculo con encabezados y filas
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

      // Estilizar encabezado en negrita y fondo suave
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!ws[address]) continue;
        ws[address].s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "E2E8F0" } },
          alignment: { horizontal: "center" }
        };
      }

      const entityTag = selectedEntity === 'all' 
        ? 'Todas' 
        : (selectedEntity === 'portal' ? 'Portal_Publico' : selectedEntity.replace(/\s+/g, '_'));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Poblacion');
      XLSX.writeFile(wb, `Censo_Poblacion_Quibdo_${entityTag}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-32 h-32 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
              <span>ADMINISTRACIÓN CENTRAL</span>
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Censo General de Población Atendida</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Consolidado histórico de ciudadanos registrados a través del portal público y por las entidades institucionales de Quibdó.
            </p>
          </div>
          
          <button 
            onClick={exportToExcel}
            disabled={exporting || total === 0} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all group"
          >
            <Download className="w-5 h-5 group-hover:bounce" />
            <span>{exporting ? 'Exportando Censo...' : 'Exportar Data Completa (Excel)'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Registros Consolidados ({total})</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por Entidad */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <label htmlFor="admin-entity-filter" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Entidad:
              </label>
              <select
                id="admin-entity-filter"
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer border-0 py-1 pl-1 pr-4"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Todas las Entidades
                </option>
                <option value="portal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Portal Público (Ciudadanía)
                </option>
                {entities.map((ent: any) => (
                  <option 
                    key={ent.id || ent.name} 
                    value={ent.name}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {ent.name} {ent.sigla ? `(${ent.sigla})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
              Página {page} de {Math.ceil(total / limit) || 1}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Compilando registros generales...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-24 text-center space-y-4">
            <Users className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="text-sm font-bold text-slate-400 font-serif">No se encontraron registros en el sistema.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Ciudadano</th>
                    <th className="px-6 py-4">Identificación</th>
                    <th className="px-6 py-4">Entidad Origen</th>
                    <th className="px-6 py-4">Fecha Registro</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {registrations.map(r => (
                    <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{r.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-slate-500">{r.tipoDocumento}: {r.numeroDocumento}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {r.entidad === 'portal' ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 font-bold text-[9px] uppercase tracking-wider">Portal Público</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-bold text-[9px] uppercase tracking-wider">{r.entidad}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(r.created_at || r.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedRecord(r)}
                          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1.5">
                {[...Array(Math.min(5, Math.ceil(total / limit)))].map((_, i) => (
                    <button 
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        {i + 1}
                    </button>
                ))}
              </div>

              <button 
                disabled={page * limit >= total} 
                onClick={() => setPage(page + 1)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all shadow-sm"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Details Modal (shared design) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif">{selectedRecord.nombre}</h3>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Expediente General de Población</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Identificación</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRecord.tipoDocumento}: {selectedRecord.numeroDocumento}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Edad / Género</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRecord.edad || selectedRecord.rangoEdad} años · {selectedRecord.genero || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Origen</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{selectedRecord.entidad}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Contacto</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{selectedRecord.telefono || 'Sin teléfono'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Ubicación</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">{selectedRecord.barrio || 'Sin barrio'}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className={`w-4 h-4 ${selectedRecord.personaDiscapacidad ? 'text-rose-500' : 'text-emerald-500'}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Estado de Discapacidad:</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white px-6">
                  {selectedRecord.personaDiscapacidad ? 'SÍ PRESENTA DISCAPACIDAD' : 'NO REPORTA DISCAPACIDAD'}
                </p>
              </div>

              {/* Family logic simplified for admin view */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Integrantes Familiares</span>
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
                  {selectedRecord.tieneEsposo && (
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                      <p className="font-bold text-blue-700 dark:text-blue-400 text-[10px] uppercase mb-1">Cónyuge / Pareja</p>
                      <p><strong>Nombre:</strong> {selectedRecord.esposoNombre}</p>
                      <p><strong>ID:</strong> {selectedRecord.esposoTipoDocumento}: {selectedRecord.esposoNumeroDocumento}</p>
                      <p><strong>Perfil:</strong> {selectedRecord.esposoEdad} años · {selectedRecord.esposoGenero || 'N/A'}</p>
                      <p className={`font-bold ${selectedRecord.esposoDiscapacidad ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedRecord.esposoDiscapacidad ? '• Presenta Discapacidad' : '• Sin Discapacidad'}
                      </p>
                    </div>
                  )}
                  {selectedRecord.tieneHijos && selectedRecord.hijos?.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-bold text-purple-700 dark:text-purple-400 text-[10px] uppercase">Hijos / Integrantes</p>
                      {selectedRecord.hijos.map((h: any, i: number) => (
                        <div key={i} className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
                          <p><strong>Nombre:</strong> {h.name}</p>
                          <p><strong>ID:</strong> {h.docType}: {h.docNumber}</p>
                          <p><strong>Perfil:</strong> {h.age} años · {h.gender || 'N/A'} · {h.studies ? 'Estudia' : 'No estudia'}</p>
                          <p className={`font-bold ${h.hasDisability ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {h.hasDisability ? '• Presenta Discapacidad' : '• Sin Discapacidad'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!selectedRecord.tieneEsposo && !selectedRecord.tieneHijos && <p className="italic text-slate-400">Sin familiares registrados.</p>}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-8 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-lg"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

