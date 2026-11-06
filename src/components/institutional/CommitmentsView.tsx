import React, { useState } from 'react';
import { Building2, Search, FileText, CheckSquare, MessageSquare } from 'lucide-react';
import { AttentionRoute } from '../../types';

interface CommitmentsViewProps {
  routes: AttentionRoute[];
}

export const CommitmentsView: React.FC<CommitmentsViewProps> = ({ routes }) => {
  const [search, setSearch] = useState('');

  // Filter routes that have either technical observations or institutional commitments
  const filtered = routes.filter(
    (r) =>
      (r.technicalObservations || r.institutionalCommitments) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.entityName.toLowerCase().includes(search.toLowerCase()) ||
        (r.institutionalCommitments && r.institutionalCommitments.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar compromisos u observaciones por entidad o palabra clave..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Compromisos Registrados: {filtered.length}
        </div>
      </div>

      {/* List of Commitments */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No hay compromisos u observaciones que coincidan con la búsqueda.
          </div>
        ) : (
          filtered.map((route) => (
            <div
              key={route.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{route.entityName}</span>
                </div>
                <span className="text-[11px] text-slate-500">Ruta: <strong>{route.name}</strong></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Institutional Commitments */}
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs mb-1 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Compromisos Institucionales
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {route.institutionalCommitments || 'Sin compromiso registrado.'}
                  </p>
                </div>

                {/* Technical Observations */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    Observaciones Técnicas
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {route.technicalObservations || 'Sin observaciones registradas.'}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                <span>Responsable: {route.institutionalOfficer || 'Servidor de la entidad'}</span>
                <span>Última actualización: {new Date(route.updatedAt).toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
