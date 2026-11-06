import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileCheck2,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Shield,
  Printer,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { CommitmentDetailModal } from './CommitmentDetailModal';
import { AttentionRoute, SystemConfig, Entity, ObservationModel, CommitmentModel, AuditLog } from '../../types';
import { api, UserContext } from '../../services/api';
import {
  exportCleanRouteTechnicalSheetPDF,
  exportToCSV,
  exportToExcel,
  exportToWordDoc,
  exportTableToPDF,
} from '../../utils/exportUtils';

interface ReportsExportPanelProps {
  routes: AttentionRoute[];
  config: SystemConfig;
  userContext: UserContext;
}

type ReportType =
  | 'general'
  | 'entidad'
  | 'publicadas'
  | 'compromisos'
  | 'cambios'
  | 'ficha';

export const ReportsExportPanel: React.FC<ReportsExportPanelProps> = ({
  routes,
  config,
  userContext,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('general');
  const [entities, setEntities] = useState<Entity[]>([]);
  const [observations, setObservations] = useState<ObservationModel[]>([]);
  const [commitments, setCommitments] = useState<CommitmentModel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for reports
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedCommitmentForModal, setSelectedCommitmentForModal] = useState<CommitmentModel | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entData, obsData, comData, auditData] = await Promise.all([
        api.getEntities().catch(() => []),
        api.getObservations(undefined, userContext).catch(() => []),
        api.getCommitments(undefined, userContext).catch(() => []),
        api.getAuditLogs(userContext).catch(() => []),
      ]);
      setEntities(entData);
      setObservations(obsData);
      setCommitments(comData);
      setAuditLogs(auditData);

      if (routes.length > 0 && !selectedRouteId) {
        setSelectedRouteId(routes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userContext]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper data getters for each report
  const getReportPayload = () => {
    switch (activeReport) {
      case 'general': {
        const title = 'Reporte General de la Ruta Estratégica';
        const subtitle = 'Consolidado Global de Desempeño y Articulación Institucional';
        const headers = ['Entidad', 'Total Rutas', 'Publicadas', 'En Revisión', 'Borrador', 'Compromisos', 'Cumplimiento'];
        const excelRows = entities.map((ent) => {
          const entRoutes = routes.filter((r) => r.entityId === ent.id);
          const published = entRoutes.filter((r) => r.status === 'Publicada').length;
          const inReview = entRoutes.filter((r) => r.status === 'En revisión' || r.status === 'Enviada a revisión' || r.status === 'Devuelta para ajustes').length;
          const drafts = entRoutes.filter((r) => r.status === 'Borrador').length;
          const entCom = commitments.filter((c) => c.entityId === ent.id);
          const avgProgress = entCom.length > 0 ? Math.round(entCom.reduce((acc, c) => acc + c.progressPercentage, 0) / entCom.length) : (published > 0 ? 100 : 0);

          return {
            'Entidad': ent.name,
            'Sigla': ent.code,
            'Total Rutas': entRoutes.length,
            'Publicadas': published,
            'En Revisión': inReview,
            'Borrador': drafts,
            'Compromisos Registrados': entCom.length,
            'Porcentaje Cumplimiento': `${avgProgress}%`,
          };
        });

        const tableRows = excelRows.map((r) => [
          r['Entidad'],
          String(r['Total Rutas']),
          String(r['Publicadas']),
          String(r['En Revisión']),
          String(r['Borrador']),
          String(r['Compromisos Registrados']),
          r['Porcentaje Cumplimiento'],
        ]);

        return { title, subtitle, headers, excelRows, tableRows };
      }

      case 'entidad': {
        const targetEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];
        const entRoutes = selectedEntityId === 'all' ? routes : routes.filter((r) => r.entityId === selectedEntityId);
        const title = `Reporte por Entidad: ${selectedEntityId === 'all' ? 'Todas las Entidades' : targetEntity?.name}`;
        const subtitle = 'Detalle de Servicios, Horarios, Responsables y Estados';
        const headers = ['Ruta / Servicio', 'Entidad', 'Categoría', 'Estado', 'Canal', 'Tiempo Respuesta', 'Actualización'];

        const excelRows = entRoutes.map((r) => ({
          'Nombre de la Ruta': r.name,
          'Servicio': r.serviceName,
          'Entidad': r.entityName,
          'Categoría': r.category,
          'Estado': r.status,
          'Canal de Atención': r.channel,
          'Tiempo de Respuesta': r.estimatedResponseTime,
          'Horario': r.serviceHours,
          'Última Actualización': r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('es-CO') : '',
        }));

        const tableRows = entRoutes.map((r) => [
          r.name,
          r.entityName,
          r.category,
          r.status,
          r.channel,
          r.estimatedResponseTime,
          r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('es-CO') : '',
        ]);

        return { title, subtitle, headers, excelRows, tableRows };
      }

      case 'publicadas': {
        const publishedRoutes = routes.filter((r) => r.status === 'Publicada');
        const title = 'Reporte de Rutas Publicadas en el Portal Ciudadano';
        const subtitle = 'Catálogo Oficial de Servicios Aprobados y Vigentes';
        const headers = ['Ruta', 'Servicio', 'Entidad', 'Población Objetivo', 'Canales', 'Horario', 'Fecha Publicación'];

        const excelRows = publishedRoutes.map((r) => ({
          'Ruta': r.name,
          'Servicio': r.serviceName,
          'Entidad': r.entityName,
          'Categoría': r.category,
          'Población Objetivo': r.targetPopulation,
          'Canal de Atención': r.channel,
          'Horario de Atención': r.serviceHours,
          'Dirección': r.institutionalAddress,
          'Teléfono': r.institutionalPhone,
          'Fecha Publicación': r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO'),
        }));

        const tableRows = publishedRoutes.map((r) => [
          r.name,
          r.serviceName,
          r.entityName,
          r.targetPopulation,
          r.channel,
          r.serviceHours,
          r.publishedAt ? new Date(r.publishedAt).toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO'),
        ]);

        return { title, subtitle, headers, excelRows, tableRows };
      }

      case 'compromisos': {
        const title = 'Reporte de Compromisos y Acuerdos Interinstitucionales';
        const subtitle = 'Matriz de Cumplimiento, Fechas Límites y Evidencias';
        const headers = ['Tema del Compromiso', 'Entidad', 'Responsable', 'Fecha Límite', 'Estado', 'Avance %', 'Soporte / Evidencia'];

        const excelRows = commitments.map((c) => ({
          'Tema': c.topic,
          'Acuerdo': c.agreement,
          'Entidad': c.entityName,
          'Responsable': c.responsiblePerson,
          'Correo Institucional': c.institutionalEmail,
          'Fecha Límite': c.commitmentDate,
          'Estado': c.status,
          'Porcentaje Avance': `${c.progressPercentage}%`,
          'Soporte Evidencia': c.evidenceName || 'Pendiente',
          'Última Nota': c.comments || 'Sin comentarios',
        }));

        const tableRows = commitments.map((c) => [
          c.topic,
          c.entityName,
          c.responsiblePerson,
          c.commitmentDate,
          c.status,
          `${c.progressPercentage}%`,
          c.evidenceName || 'Pendiente',
        ]);

        return { title, subtitle, headers, excelRows, tableRows };
      }

      case 'cambios': {
        const title = 'Reporte de Trazabilidad, Cambios y Auditoría de Seguridad';
        const subtitle = 'Registro Cronológico de Acciones, Estados e Inicios de Sesión';
        const headers = ['Fecha y Hora', 'Usuario', 'Rol', 'Entidad', 'Acción Realizada', 'Detalles'];

        const excelRows = auditLogs.map((log) => ({
          'Fecha y Hora': new Date(log.timestamp).toLocaleString('es-CO'),
          'Usuario': log.userName,
          'Rol': log.userRole,
          'Entidad': log.entityName,
          'Acción': log.action,
          'Detalles': log.details,
        }));

        const tableRows = auditLogs.map((log) => [
          new Date(log.timestamp).toLocaleDateString('es-CO'),
          log.userName,
          log.userRole,
          log.entityName,
          log.action,
          log.details,
        ]);

        return { title, subtitle, headers, excelRows, tableRows };
      }

      case 'ficha':
      default: {
        return {
          title: 'Ficha Técnica Oficial de una Ruta',
          subtitle: 'Documento Limpio Institucional Aprobado para Consulta Pública',
          headers: [],
          excelRows: [],
          tableRows: [],
        };
      }
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    if (activeReport === 'ficha') {
      const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (selectedRoute) exportCleanRouteTechnicalSheetPDF(selectedRoute, config);
      return;
    }

    const { title, subtitle, headers, tableRows } = getReportPayload();
    const filename = `reporte_${activeReport}_quibdo_${new Date().toISOString().split('T')[0]}.pdf`;
    exportTableToPDF(filename, title, subtitle, headers, tableRows);
  };

  const handleExportExcel = () => {
    if (activeReport === 'ficha') {
      const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (selectedRoute) {
        exportToExcel(
          `ficha_tecnica_${selectedRoute.name.substring(0, 20)}.xlsx`,
          'Ficha',
          [
            {
              'Nombre de la Ruta': selectedRoute.name,
              'Servicio': selectedRoute.serviceName,
              'Entidad': selectedRoute.entityName,
              'Categoría': selectedRoute.category,
              'Descripción': selectedRoute.description,
              'Población': selectedRoute.targetPopulation,
              'Requisitos': (selectedRoute.requirements || []).join('; '),
              'Documentos': (selectedRoute.requestedDocuments || []).join('; '),
              'Canal': selectedRoute.channel,
              'Tiempo Respuesta': selectedRoute.estimatedResponseTime,
              'Horario': selectedRoute.serviceHours,
              'Estado': selectedRoute.status,
            },
          ]
        );
      }
      return;
    }

    const { excelRows } = getReportPayload();
    const filename = `reporte_${activeReport}_quibdo_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToExcel(filename, activeReport, excelRows);
  };

  const handleExportWord = () => {
    if (activeReport === 'ficha') {
      const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (selectedRoute) {
        const html = `
          <h2>${selectedRoute.name}</h2>
          <p><b>Servicio:</b> ${selectedRoute.serviceName} | <b>Entidad:</b> ${selectedRoute.entityName}</p>
          <p><b>Categoría:</b> ${selectedRoute.category} | <b>Población Objetivo:</b> ${selectedRoute.targetPopulation}</p>
          <p><b>Descripción:</b> ${selectedRoute.description}</p>
          <h3>Requisitos Institucionales</h3>
          <ul>${(selectedRoute.requirements || []).map((req) => `<li>${req}</li>`).join('')}</ul>
          <h3>Documentos Requeridos</h3>
          <ul>${(selectedRoute.requestedDocuments || []).map((docItem) => `<li>${docItem}</li>`).join('')}</ul>
          <h3>Canales y Horarios de Atención</h3>
          <p>Canal: ${selectedRoute.channel} | Dirección: ${selectedRoute.institutionalAddress} | Horario: ${selectedRoute.serviceHours}</p>
        `;
        exportToWordDoc(`ficha_tecnica_${selectedRoute.name.substring(0, 25)}.doc`, 'Ficha Técnica Oficial de Ruta', selectedRoute.name, html);
      }
      return;
    }

    const { title, subtitle, headers, tableRows } = getReportPayload();
    let tableHtml = `
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows
            .map(
              (row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;

    exportToWordDoc(`reporte_${activeReport}_quibdo_${new Date().toISOString().split('T')[0]}.doc`, title, subtitle, tableHtml);
  };

  const handleExportCSV = () => {
    if (activeReport === 'ficha') {
      const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
      if (selectedRoute) {
        exportToCSV(`ficha_tecnica_${selectedRoute.name.substring(0, 25)}.csv`, ['Campo', 'Valor'], [
          ['Nombre de la Ruta', selectedRoute.name],
          ['Servicio', selectedRoute.serviceName],
          ['Entidad', selectedRoute.entityName],
          ['Categoría', selectedRoute.category],
          ['Descripción', selectedRoute.description],
          ['Población Objetivo', selectedRoute.targetPopulation],
          ['Canal', selectedRoute.channel],
          ['Horario', selectedRoute.serviceHours],
          ['Tiempo Respuesta', selectedRoute.estimatedResponseTime],
        ]);
      }
      return;
    }

    const { headers, tableRows } = getReportPayload();
    exportToCSV(`reporte_${activeReport}_quibdo_${new Date().toISOString().split('T')[0]}.csv`, headers, tableRows);
  };

  const reportTabs = [
    { id: 'general', label: '1. Reporte General', icon: Building2 },
    { id: 'entidad', label: '2. Por Entidad', icon: CheckCircle2 },
    { id: 'publicadas', label: '3. Rutas Publicadas', icon: FileCheck2 },
    { id: 'compromisos', label: '6. Compromisos', icon: CheckCircle2 },
    { id: 'cambios', label: '8. Registro Cambios', icon: History },
    { id: 'ficha', label: '9. Ficha Técnica', icon: Printer },
  ];

  const payload = getReportPayload();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-2 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <Download className="w-4 h-4" />
          <span>Fase 7 · Centro Integral de Reportes y Fichas Institucionales</span>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Generación de Reportes Oficiales
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Visualización del consolidado institucional de las 19 entidades, rutas, observaciones y compromisos.
          </p>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max text-xs font-semibold">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportType)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {payload.title}
            </h3>
            <p className="text-xs text-slate-500">
              {payload.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWord}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
              title="Descargar reporte en formato Word (.doc)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word (.doc)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Selector */}
        {activeReport === 'entidad' && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Seleccionar Entidad:</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 max-w-sm"
            >
              <option value="all">Todas las 19 entidades institucionales</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} ({ent.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeReport === 'ficha' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Seleccione la Ruta para Descargar la Ficha Técnica Limpia:
              </span>
              <p className="text-[11px] text-slate-500">
                La ficha generada cumple los estándares oficiales: incluye logo institucional, descripción, requisitos, documentos, canales, tiempos y aviso legal, omitiendo observaciones y notas internas.
              </p>
            </div>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 max-w-md truncate"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.entityName} · {r.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Table Preview */}
        {activeReport !== 'ficha' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Vista Previa de Datos ({payload.tableRows.length} registros):</span>
              <span>Visualización tabular previa a la descarga</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                  <tr>
                    {payload.headers.map((h, i) => (
                      <th key={i} className="px-3.5 py-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {activeReport === 'compromisos' && <th className="px-3.5 py-2.5 whitespace-nowrap text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {payload.tableRows.length === 0 ? (
                    <tr>
                      <td colSpan={payload.headers.length + (activeReport === 'compromisos' ? 1 : 0)} className="py-8 text-center text-slate-400">
                        No hay registros disponibles para este reporte en el momento.
                      </td>
                    </tr>
                  ) : (
                    payload.tableRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {row.map((cell, colIdx) => (
                          <td key={colIdx} className="px-3.5 py-2.5 whitespace-nowrap text-[11px]">
                            {cell}
                          </td>
                        ))}
                        {activeReport === 'compromisos' && (
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedCommitmentForModal(commitments[rowIdx])}
                              className="text-emerald-600 hover:text-emerald-800 font-semibold"
                            >
                              Ver Detalles
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Commitment Detail Modal */}
        {selectedCommitmentForModal && (
          <CommitmentDetailModal
            commitment={selectedCommitmentForModal}
            onClose={() => setSelectedCommitmentForModal(null)}
          />
        )}

        {/* Ficha Preview Card */}
        {activeReport === 'ficha' && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            {(() => {
              const r = routes.find((item) => item.id === selectedRouteId) || routes[0];
              if (!r) return null;
              return (
                <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block">
                        Ficha Técnica Oficial del Trámite
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {r.name}
                      </h4>
                      <span className="text-xs text-slate-500">
                        Entidad Responsable: <strong>{r.entityName}</strong> | Servicio: <strong>{r.serviceName}</strong>
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Requisitos Institucionales:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        {(r.requirements || []).map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Documentos Solicitados:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        {(r.requestedDocuments || []).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>Tiempo de respuesta estimado: <strong>{r.estimatedResponseTime}</strong> · Canal: <strong>{r.channel}</strong></span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
