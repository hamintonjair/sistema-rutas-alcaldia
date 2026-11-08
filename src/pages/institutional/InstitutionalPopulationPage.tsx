import React, { useState, useEffect } from 'react';
import { api, UserContext } from '../../services/api';
import { RegistrationPage } from '../public/RegistrationPage';
import * as XLSX from 'xlsx-js-style';
import { Users, PlusCircle, List, Eye, Calendar, MapPin, Phone, Info, X, ShieldCheck, User, RefreshCw, ArrowLeft, ArrowRight, Download } from 'lucide-react';

interface InstitutionalPopulationPageProps {
  userContext: UserContext;
}

export const InstitutionalPopulationPage: React.FC<InstitutionalPopulationPageProps> = ({ userContext }) => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('list');
  const [selectedRecord, setSelectedRoute] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (activeTab === 'list') {
      fetchRegistrations();
    }
  }, [activeTab, page, userContext]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, total } = await api.getPopulationRegistrations(page, limit, userContext);
      setRegistrations(data || []);
      setTotal(total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const headers = [
      'Nombre', 'Tipo Documento', 'Número Documento', 'Teléfono', 
      'Barrio', 'Edad', 'Género', 'Persona Discapacidad', 
      'Fecha Registro', 'Núcleo Familiar'
    ];

    const data = registrations.map(r => {
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
        new Date(r.created_at || r.createdAt).toLocaleString('es-CO'),
        familySummary || 'N/A'
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Poblacion');
    XLSX.writeFile(wb, `Reporte_Poblacion_${userContext.entityName || 'Entidad'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-3 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Users className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30 font-mono">
              <span>MÓDULO: GESTIÓN DE POBLACIÓN</span>
            </div>
            <h1 className="text-2xl font-serif font-bold">Población Atendida por {userContext.entityName}</h1>
            <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
              Registre y consulte la información estadística de los ciudadanos atendidos por su entidad para mejorar la trazabilidad de los servicios institucionales.
            </p>
          </div>

          <button 
            onClick={exportToExcel} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all group shrink-0"
          >
            <Download className="w-4 h-4 group-hover:bounce" />
            <span>Exportar Data (Excel)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Ver Registros Históricos</span>
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'form'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Registro Institucional</span>
        </button>
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'form' ? (
          <div className="bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <RegistrationPage 
              userContext={userContext} 
              hideHeader={true} 
              onSuccess={() => setActiveTab('list')} 
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-4 h-4 text-emerald-600" />
                <span>Base de Datos de Población Atendida ({total})</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                  Página {page} de {Math.ceil(total / limit) || 1}
                </span>
                <button 
                  onClick={fetchRegistrations}
                  className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Actualizar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Sincronizando expedientes...</span>
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-700">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm font-serif">Sin registros disponibles</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">Su entidad aún no ha realizado registros de población atendida en este módulo institucional.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('form')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                >
                  Registrar primer ciudadano
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4">Ciudadano Atendido</th>
                        <th className="px-6 py-4">Documento</th>
                        <th className="px-6 py-4">Ubicación / Barrio</th>
                        <th className="px-6 py-4">Fecha de Registro</th>
                        <th className="px-6 py-4 text-right">Detalles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {registrations.map(r => (
                        <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{r.nombre}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{r.genero || 'Género no especificado'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold border border-slate-200 dark:border-slate-700">
                              {r.tipoDocumento}: {r.numeroDocumento}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[120px]">{r.barrio || 'No registrado'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(r.created_at || r.createdAt).toLocaleDateString('es-CO')}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedRoute(r)}
                              className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800"
                              title="Ver detalles completos"
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
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <User className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif">{selectedRecord.nombre}</h3>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Ficha de Información Poblacional</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRoute(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Core Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Documento de Identidad</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRecord.tipoDocumento}: {selectedRecord.numeroDocumento}</p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-right">Género / Edad</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRecord.genero || 'N/A'} · {selectedRecord.edad || selectedRecord.rangoEdad || 'N/A'} años</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Barrio</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedRecord.barrio || 'No registrado'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-right">Teléfono</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {selectedRecord.telefono || 'No registrado'}
                  </p>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${
                  selectedRecord.personaDiscapacidad 
                    ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>{selectedRecord.personaDiscapacidad ? 'PERSONA CON DISCAPACIDAD' : 'SIN DISCAPACIDAD REGISTRADA'}</span>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  REGISTRADO POR: {selectedRecord.entidad.toUpperCase()}
                </div>
              </div>

              {/* Family Context */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Contexto Familiar</span>
                </h4>

                <div className="space-y-4">
                  {/* Spouse */}
                  {selectedRecord.tieneEsposo ? (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Cónyuge / Pareja</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedRecord.esposoNombre}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{selectedRecord.esposoTipoDocumento}: {selectedRecord.esposoNumeroDocumento}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedRecord.esposoEdad} años · {selectedRecord.esposoGenero || 'N/A'}</p>
                          <span className={`text-[9px] font-bold uppercase ${selectedRecord.esposoDiscapacidad ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {selectedRecord.esposoDiscapacidad ? 'Con Discapacidad' : 'Sin Discapacidad'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sin cónyuge registrado</p>
                    </div>
                  )}

                  {/* Children */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block px-2">Hijos / Integrantes Familiares</span>
                    {selectedRecord.tieneHijos && selectedRecord.hijos && selectedRecord.hijos.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {selectedRecord.hijos.map((child: any, idx: number) => (
                          <div key={idx} className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{child.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{child.docType}: {child.docNumber}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{child.age} años · {child.gender || 'N/A'}</span>
                                {child.studies && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Estudia actualmente" />
                                )}
                              </div>
                              <span className={`text-[9px] font-bold uppercase ${child.hasDisability ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {child.hasDisability ? 'Con Discapacidad' : 'Sin Discapacidad'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Sin hijos registrados</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Processing Footnote */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 opacity-60">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 leading-relaxed italic">
                  Este registro fue procesado por el servidor oficial de la Alcaldía de Quibdó el {new Date(selectedRecord.created_at || selectedRecord.createdAt).toLocaleString('es-CO')}. La información es de uso exclusivo institucional y reservado.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedRoute(null)}
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

