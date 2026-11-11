import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { AttentionRoute, SystemConfig, ObservationModel, CommitmentModel, Entity, AuditLog } from '../types';

/**
 * Clean Technical Sheet PDF (Ficha Técnica Oficial Limpia)
 * EXCLUDES: Internal observations, coordinator review comments, private commitments, revision history.
 * INCLUDES: Entity Logo, main image, route name, category, description, population, requirements, documents, steps, channels, response time, update date, institutional legal notice.
 */
export function exportCleanRouteTechnicalSheetPDF(route: AttentionRoute, config?: SystemConfig) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header Banner Institucional
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('ALCALDÍA MUNICIPAL DE QUIBDÓ - CHOCÓ', 14, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Ruta Estratégica para la Atención Integral de la Población Refugiada y Migrante en Quibdó', 14, 16);
  doc.text(`Ficha Técnica Oficial del Servicio Institucional | Estado: ${route.status.toUpperCase()}`, 14, 21);

  y = 34;

  // Title of the Route
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(route.name, pageWidth - 28);
  doc.text(titleLines, 14, y);
  y += titleLines.length * 5.5 + 2;

  // Subtitle / Servicio
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(`Servicio: ${route.serviceName}`, 14, y);
  y += 5.5;

  // Metadata Box
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Entidad Responsable: ${route.entityName}`, 18, y + 6);
  doc.text(`Categoría: ${route.category}`, 18, y + 11);
  doc.text(`Canal de Atención: ${route.channel}`, 18, y + 16);
  doc.text(`Horario: ${route.serviceHours}`, 18, y + 21);

  doc.text(`Población Objetivo: ${route.targetPopulation}`, 112, y + 6);
  doc.text(`Tiempo de Respuesta: ${route.estimatedResponseTime}`, 112, y + 11);
  doc.text(`Última Actualización: ${route.updatedAt ? new Date(route.updatedAt).toLocaleDateString('es-CO') : 'Reciente'}`, 112, y + 16);
  doc.text(`Costo del Trámite: 100% Gratuito`, 112, y + 21);

  y += 30;

  // Section 1: Descripción y Necesidad
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. DESCRIPCIÓN DEL SERVICIO Y NECESIDAD QUE ATIENDE', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(route.description, pageWidth - 28);
  doc.text(descLines, 14, y);
  y += descLines.length * 4 + 3;

  const needLines = doc.splitTextToSize(`Necesidad específica: ${route.addressedNeed}`, pageWidth - 28);
  doc.text(needLines, 14, y);
  y += needLines.length * 4 + 5;

  // Section 2: Requisitos y Documentos
  if (y > 235) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. REQUISITOS INSTITUCIONALES Y DOCUMENTOS REQUERIDOS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Requisitos del trámite:', 14, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  (route.requirements || []).forEach((req) => {
    const lines = doc.splitTextToSize(`• ${req}`, pageWidth - 32);
    doc.text(lines, 18, y);
    y += lines.length * 3.8 + 1;
  });

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Documentos a presentar:', 14, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  (route.requestedDocuments || []).forEach((docItem) => {
    const lines = doc.splitTextToSize(`• ${docItem}`, pageWidth - 32);
    doc.text(lines, 18, y);
    y += lines.length * 3.8 + 1;
  });

  y += 5;

  // Section 3: Paso a Paso
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. PASO A PASO DEL PROCEDIMIENTO', 14, y);
  y += 5.5;

  (route.procedureSteps || []).forEach((step) => {
    if (y > 255) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 3, pageWidth - 28, 13 + (step.description.length > 70 ? 7 : 0), 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Paso ${step.stepNumber}: ${step.title}`, 18, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Responsable: ${step.responsibleRole || 'Ventanilla'} | Tiempo estimado: ${step.estimatedTime || 'Inmediato'}`, 18, y + 4);

    const stepDesc = doc.splitTextToSize(step.description, pageWidth - 36);
    doc.text(stepDesc, 18, y + 7.5);

    y += 16 + (step.description.length > 70 ? 7 : 0);
  });

  // Section 4: Canales y Contacto
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CANALES DE ATENCIÓN Y CONTACTO OFICIAL', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Dirección Institucional: ${route.institutionalAddress}`, 14, y);
  y += 4;
  doc.text(`Teléfono Institucional: ${route.institutionalPhone}`, 14, y);
  y += 4;
  doc.text(`Correo Oficial: ${route.institutionalEmail}`, 14, y);
  y += 4;
  doc.text(`Horario de Atención: ${route.serviceHours}`, 14, y);
  y += 7;

  // Legal Disclaimer (Notice)
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('AVISO INSTITUCIONAL: Todos los trámites de este proceso son gratuitos y no requieren intermediarios.', 14, y);
  doc.text('Documento oficial emitido por la Alcaldía Municipal de Quibdó. No contiene datos personales individuales (Ley 1581 de 2012).', 14, y + 3.5);

  const cleanFileName = route.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 35);
  doc.save(`ficha_tecnica_${cleanFileName}.pdf`);
}

/**
 * Universal CSV Exporter with UTF-8 BOM
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    '\ufeff' +
    [headers.map(escapeCell).join(';'), ...rows.map((row) => row.map(escapeCell).join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Universal Excel Exporter (.xlsx) using xlsx library
 */
export function exportToExcel(filename: string, sheetName: string, dataRows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 30));
  XLSX.writeFile(workbook, filename);
}

/**
 * Universal Word Exporter (.doc) with clean institutional styling
 */
export function exportToWordDoc(filename: string, title: string, subtitle: string, htmlContent: string) {
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; margin: 25px; color: #0f172a; line-height: 1.4; }
        h1 { color: #0f172a; font-size: 18pt; border-bottom: 2px solid #0f172a; padding-bottom: 5px; margin-bottom: 2px; }
        .subtitle { color: #1e3a8a; font-size: 11pt; font-weight: bold; margin-bottom: 15px; }
        h2 { color: #1e3a8a; font-size: 13pt; margin-top: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9.5pt; }
        th { background-color: #0f172a; color: #ffffff; padding: 7px; text-align: left; border: 1px solid #0f172a; }
        td { border: 1px solid #cbd5e1; padding: 6px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .footer { font-size: 8pt; color: #64748b; font-style: italic; margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 5px; }
      </style>
    </head>
    <body>
      <h1>Alcaldía Municipal de Quibdó - Chocó</h1>
      <div class="subtitle">${title} - ${subtitle}</div>
      <p><b>Fecha de Emisión:</b> ${new Date().toLocaleDateString('es-CO')} | <b>Sistema:</b> Plataforma de Procesos de Atención</p>
      <hr/>
      ${htmlContent}
      <div class="footer">
        Documento institucional oficial emitido conforme a las políticas de transparencia y protección de datos (Ley 1581 de 2012).
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Universal PDF Table Exporter
 */
export function exportTableToPDF(filename: string, title: string, subtitle: string, headers: string[], rows: string[][]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ALCALDÍA MUNICIPAL DE QUIBDÓ - INFORME OFICIAL', 14, 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${title} · ${subtitle} | Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 15);

  y = 28;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, 14, y);
  y += 6;

  // Render Table
  const colCount = headers.length;
  const colWidth = (pageWidth - 28) / colCount;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  headers.forEach((h, idx) => {
    doc.text(h, 16 + idx * colWidth, y + 5.5);
  });
  y += 8;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  rows.forEach((row, rowIdx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }

    row.forEach((cell, colIdx) => {
      const cellText = doc.splitTextToSize(String(cell || ''), colWidth - 3);
      doc.text(cellText[0] || '', 16 + colIdx * colWidth, y + 4.8);
    });

    y += 7;
  });

  doc.save(filename);
}

// Re-export backward compatible aliases
export const exportRouteToPDF = exportCleanRouteTechnicalSheetPDF;
export function exportRoutesToExcel(routes: AttentionRoute[], filename = 'rutas_migrantes_quibdo.xlsx') {
  const dataRows = routes.map((r, i) => ({
    '#': i + 1,
    'Estado': r.status,
    'Nombre del Proceso': r.name,
    'Servicio': r.serviceName,
    'Entidad': r.entityName,
    'Categoría': r.category,
    'Población': r.targetPopulation,
    'Canal': r.channel,
    'Tiempo': r.estimatedResponseTime,
    'Horario': r.serviceHours,
    'Dirección': r.institutionalAddress,
    'Teléfono': r.institutionalPhone,
    'Correo': r.institutionalEmail,
    'Última Actualización': r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('es-CO') : '',
  }));
  exportToExcel(filename, 'Rutas', dataRows);
}
