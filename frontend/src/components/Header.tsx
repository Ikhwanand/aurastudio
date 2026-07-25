import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, QrCode, SlidersHorizontal, Key } from 'lucide-react';

interface HeaderProps {
  photoCount: number;
  activeFilterName: string;
  onOpenStripBuilder: () => void;
  onOpenQRModal: () => void;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  photoCount,
  activeFilterName,
  onOpenStripBuilder,
  onOpenQRModal,
  onOpenApiKeyModal
}) => {
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = () => {
      const storedKey = localStorage.getItem('pollinations_api_key') || import.meta.env.VITE_POLLINATIONS_API_KEY;
      setHasApiKey(Boolean(storedKey && storedKey.trim() !== ''));
    };
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  return (
    <header className="w-full bg-[#090a0f]/90 backdrop-blur-md border-b border-[#1e2333] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Name & Studio Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-white uppercase">
                  AURA<span className="text-cyan-400">STUDIO</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STUDIO READY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">AI Photobooth & Tactile Pose Workbench</p>
            </div>
          </div>
        </div>

        {/* Center Active Filter Indicator Stamp */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-[#12151e] border border-[#1e2333] font-mono text-xs text-slate-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>FILTER: <strong className="text-white uppercase font-bold">{activeFilterName}</strong></span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* API Key Setting Button */}
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              hasApiKey
                ? 'bg-[#12151e] hover:bg-[#181c28] border-cyan-500/40 text-cyan-300'
                : 'bg-amber-950/40 hover:bg-amber-900/40 border-amber-500/60 text-amber-300'
            }`}
            title="Configure Pollinations API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasApiKey ? 'KEY ACTIVE' : 'SET API KEY'}</span>
          </button>

          <button
            onClick={onOpenQRModal}
            className="px-3 py-1.5 rounded-lg bg-[#12151e] hover:bg-[#181c28] border border-[#2e3447] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Scan Mobile QR"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">QR SHARE</span>
          </button>

          {/* BUILD STRIP BUTTON (ALWAYS CLICKABLE) */}
          <button
            onClick={onOpenStripBuilder}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95"
            title="Build Y2K Photo Strip"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>BUILD STRIP</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-950 text-cyan-300">
              [{photoCount}]
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
