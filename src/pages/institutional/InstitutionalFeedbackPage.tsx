import React, { useState, useEffect, useMemo } from 'react';
import { api, UserContext } from '../../services/api';
import { FeedbackReport } from '../../types';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send, 
  X, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

interface InstitutionalFeedbackPageProps {
  userContext: UserContext;
}

export const InstitutionalFeedbackPage: React.FC<InstitutionalFeedbackPageProps> = ({ userContext }) => {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'resuelto'>('all');
  const [selectedReport, setSelectedRoute] = useState<FeedbackReport | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const fetchReports = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const allReports = await api.getFeedbackReports(userContext);
      setReports(Array.isArray(allReports) ? allReports : []);
    } catch (err) {
      console.error('Error fetching institutional feedback reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [userContext]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  const [responseError, setResponseError] = useState('');

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !response.trim()) return;

    setIsSubmitting(true);
    setResponseError('');
    try {
      await api.respondToFeedbackReport(selectedReport.id, response.trim(), 'resuelto', userContext);
      setResponse('');
      setSelectedRoute(null);
      await fetchReports(true);
    } catch (err: any) {
      console.error(err);
      setResponseError(err.message || 'Error al enviar respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        r.id.toLowerCase().includes(term) ||
        (r.routeName && r.routeName.toLowerCase().includes(term)) ||
        (r.comments && r.comments.toLowerCase().includes(term)) ||
        (r.issueType && r.issueType.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [reports, statusFilter, searchTerm]);

  // Pagination calculations
  const totalItems = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  const pendingCount = reports.filter((r) => r.status === 'pendiente').length;
  const resolvedCount = reports.filter((r) => r.status === 'resuelto').length;

  if (loading) return (
    <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
      <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
      <span>Cargando reportes ciudadanos...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestión de Reportes Ciudadanos</h2>
              <p className="text-xs text-slate-500">
                Atienda las inquietudes y observaciones ciudadanas radicadas para {userContext.entityName || 'su entidad'}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>

        {/* Stats summary banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Reportes</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{reports.length}</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pendientes
            </span>
            <span className="text-base font-bold text-amber-800 dark:text-amber-200">{pendingCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resueltos
            </span>
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-200">{resolvedCount}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por radicado (ej: rad-...), ruta o palabra clave..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'pendiente'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('resuelto')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'resuelto'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Resueltos ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Radicado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Ruta</th>
                <th className="p-3">Tipo de Novedad</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    {reports.length === 0
                      ? 'No hay reportes registrados para su entidad en la base de datos.'
                      : 'No se encontraron reportes que coincidan con los filtros de búsqueda.'}
                  </td>
                </tr>
              ) : (
                paginatedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-emerald-600">{r.id}</td>
                    <td className="p-3 text-slate-500">{new Date(r.date).toLocaleDateString('es-CO')}</td>
                    <td className="p-3 font-semibold">{r.routeName}</td>
                    <td className="p-3 capitalize">{r.issueType.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'resuelto' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {r.status === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => {
                          setSelectedRoute(r);
                          setResponse(r.response || '');
                        }}
                        className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        {r.status === 'resuelto' ? 'Ver Respuesta' : 'Atender'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                Mostrando <strong className="font-semibold text-slate-900 dark:text-slate-200">{startIndex + 1}</strong> a{' '}
                <strong className="font-semibold text-slate-900 dark:text-slate-200">{endIndex}</strong> de{' '}
                <strong className="font-semibold text-slate-900 dark:text-slate-200">{totalItems}</strong> reportes
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500">Filas:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage <= 1}
                title="Primera página"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage <= 1}
                title="Página anterior"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Show first, last, and window around current
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - safeCurrentPage) <= 1
                    );
                  })
                  .reduce<(number | string)[]>((acc, pageNum, idx, arr) => {
                    if (idx > 0 && pageNum - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(pageNum);
                    return acc;
                  }, [])
                  .map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400">
                          ...
                        </span>
                      );
                    }
                    const pageNum = item as number;
                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-7 h-7 px-2 rounded-lg font-semibold text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage >= totalPages}
                title="Página siguiente"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage >= totalPages}
                title="Última página"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-sm">Radicado: {selectedReport.id}</h3>
              <button onClick={() => setSelectedRoute(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Observación del ciudadano</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{selectedReport.comments}"</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ruta:</span>
                  <span className="font-semibold">{selectedReport.routeName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="text-slate-500">Reportado como:</span>
                  <span className="font-semibold">{selectedReport.reporterType}</span>
                </div>
              </div>

              <form onSubmit={handleRespond} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Respuesta Institucional
                  </label>
                  <textarea 
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    required
                    rows={5}
                    placeholder="Describa las acciones tomadas o aclare la situación al ciudadano..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setSelectedRoute(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || (selectedReport.status === 'resuelto' && response === selectedReport.response)}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{selectedReport.status === 'resuelto' ? 'Actualizar Respuesta' : 'Enviar Respuesta'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
