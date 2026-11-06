import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface PIIWarningBannerProps {
  compact?: boolean;
}

export const PIIWarningBanner: React.FC<PIIWarningBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-md text-amber-800 dark:text-amber-300 text-xs font-medium">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>No incluya datos personales de casos concretos</strong> (nombres de beneficiarios, documentos o direcciones particulares).
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-md text-amber-700 dark:text-amber-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-amber-950 dark:text-amber-100 mb-1 flex items-center gap-1.5">
            <span>Directriz de Protección de Datos e Información Institucional</span>
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            La plataforma de la <strong>Ruta Estratégica Migrante de Quibdó</strong> no gestiona atenciones de casos individuales ni historias clínicas. Está estrictamente prohibido ingresar nombres de beneficiarios, números de cédula/PPT, teléfonos personales o direcciones domiciliarias. Registre exclusivamente requisitos, procedimientos y canales de contacto institucionales.
          </p>
        </div>
      </div>
    </div>
  );
};
