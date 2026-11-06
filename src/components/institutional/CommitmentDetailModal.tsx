import { X, FileText } from 'lucide-react';
import { CommitmentModel } from '../../types';
import { exportToWordDoc } from '../../utils/exportUtils';

interface CommitmentDetailModalProps {
  commitment: CommitmentModel;
  onClose: () => void;
}

export const CommitmentDetailModal: React.FC<CommitmentDetailModalProps> = ({ commitment, onClose }) => {
  const handleExportWord = () => {
    const html = `
      <h1>Detalle del Compromiso: ${commitment.topic}</h1>
      <p><b>Entidad:</b> ${commitment.entityName}</p>
      <p><b>Estado:</b> ${commitment.status}</p>
      <p><b>Responsable:</b> ${commitment.responsiblePerson}</p>
      <p><b>Fecha Límite:</b> ${commitment.commitmentDate}</p>
      <p><b>Avance:</b> ${commitment.progressPercentage}%</p>
      <p><b>Acuerdo:</b> ${commitment.agreement}</p>
      <p><b>Comentarios:</b> ${commitment.comments}</p>
    `;
    exportToWordDoc(`compromiso_${commitment.id}.doc`, 'Detalle de Compromiso', commitment.topic, html);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-sm text-white">Detalle del Compromiso: {commitment.topic}</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleExportWord} 
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5" 
              title="Descargar en Word"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word (.doc)</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="font-bold">Entidad:</span> {commitment.entityName}</div>
            <div><span className="font-bold">Estado:</span> {commitment.status}</div>
            <div><span className="font-bold">Responsable:</span> {commitment.responsiblePerson}</div>
            <div><span className="font-bold">Fecha Límite:</span> {commitment.commitmentDate}</div>
            <div><span className="font-bold">Avance:</span> {commitment.progressPercentage}%</div>
          </div>
          <div><span className="font-bold">Acuerdo:</span> {commitment.agreement}</div>
          <div><span className="font-bold">Comentarios:</span> {commitment.comments}</div>
          <div>
            <span className="font-bold">Evidencia:</span>{' '}
            {commitment.evidenceUrl ? (
              <a href={commitment.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
                {commitment.evidenceName || 'Ver documento'}
              </a>
            ) : (
              commitment.evidenceName || 'No aplica'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
