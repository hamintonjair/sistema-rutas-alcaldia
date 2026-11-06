import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header */}
      <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Portal Público</span>
        </Link>
      </div>

      {/* Centered Outlet Card */}
      <div className="max-w-md mx-auto w-full my-auto py-6 relative z-10">
        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Alcaldía Municipal de Quibdó</h1>
          <p className="text-xs text-slate-400">Acceso Institucional a la Ruta Estratégica Migrante</p>
        </div>

        <Outlet />
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 py-2 relative z-10">
        Plataforma Oficial de Gestión Institucional • Municipio de Quibdó - Chocó
      </div>
    </div>
  );
};
