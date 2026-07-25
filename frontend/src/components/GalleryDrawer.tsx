import React, { useState } from 'react';
import { Download, Trash2, Image as ImageIcon, Sparkles, Eye } from 'lucide-react';
import type { CapturedPhoto } from '../types/photobooth';

interface GalleryDrawerProps {
  photos: CapturedPhoto[];
  onDeletePhoto: (id: string) => void;
  onDownloadPhoto: (photo: CapturedPhoto) => void;
}

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  photos,
  onDeletePhoto,
  onDownloadPhoto
}) => {
  const [showOriginalMap, setShowOriginalMap] = useState<Record<string, boolean>>({});

  if (photos.length === 0) return null;

  const toggleShowOriginal = (id: string) => {
    setShowOriginalMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-[#090a0f] border border-[#2e3447] rounded-2xl p-4 shadow-xl font-mono">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-xs font-bold text-white tracking-wider uppercase">CAPTURED SHOTS REEL</h3>
            <p className="text-[10px] text-slate-400">{photos.length} shots ready for photo strip</p>
          </div>
        </div>
      </div>

      {/* Grid of Captured Shots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {photos.map((photo, idx) => {
          const isOriginalShown = showOriginalMap[photo.id] || false;
          const displaySrc = isOriginalShown
            ? photo.originalDataUrl
            : (photo.processedUrl || photo.originalDataUrl);

          return (
            <div
              key={photo.id}
              className="group relative aspect-4/3 rounded-xl overflow-hidden bg-[#12151e] border border-[#2e3447] shadow-md transition-all hover:border-cyan-500/50"
            >
              <img
                src={displaySrc}
                alt={`Shot ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ filter: isOriginalShown ? photo.appliedFilter.cssFilter : 'none' }}
              />

              {/* Filter Badge */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold text-white bg-black/80 rounded border border-[#2e3447] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                <span>{photo.appliedFilter.name}</span>
              </div>

              {/* Hover Action Overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={() => toggleShowOriginal(photo.id)}
                  className={`p-2 rounded-lg border text-xs transition-colors ${
                    isOriginalShown
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-[#181c28] text-slate-300 border-[#2e3447] hover:text-white'
                  }`}
                  title={isOriginalShown ? 'Show AI Stylized' : 'Show Original Webcam'}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDownloadPhoto(photo)}
                  className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-transform hover:scale-105"
                  title="Download Photo"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="p-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-transform hover:scale-105"
                  title="Delete Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
