import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Green & Red Brand Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-red-600 z-20" />
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
          <img
            src="/quibdo_alcaldia_logo.png"
            alt="Logo Alcaldía de Quibdó"
            className="w-16 h-16 object-contain p-1 bg-white rounded-2xl border-2 border-emerald-500 shadow-xl mx-auto"
          />
          <h1 className="text-2xl font-serif font-bold text-white">Alcaldía Municipal de Quibdó</h1>
          <p className="text-xs text-emerald-400 font-semibold">Acceso Institucional a la Ruta Estratégica Migrante</p>
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
