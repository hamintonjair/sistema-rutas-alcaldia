import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { RouteImage } from '../../types';

interface ImageLightboxModalProps {
  images: RouteImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada de imagen"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="w-full max-w-5xl flex items-center justify-between text-white pb-3 px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>
            Imagen {currentIndex + 1} de {images.length}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          aria-label="Cerrar vista de imagen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[75vh] flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.altText || 'Fotografía de la ruta institucional'}
          className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-emerald-600 transition-colors shadow-lg"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-emerald-600 transition-colors shadow-lg"
            aria-label="Siguiente imagen"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption & Description */}
      <div
        className="max-w-2xl text-center text-xs text-slate-300 pt-4 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-medium text-white">{currentImage.altText}</p>
        {currentImage.description && (
          <p className="text-slate-400 mt-1">{currentImage.description}</p>
        )}
      </div>
    </div>
  );
};
