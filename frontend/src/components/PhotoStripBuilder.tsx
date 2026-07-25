import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Download, Check, Image as ImageIcon, Camera, Sparkles, Palette, LayoutGrid, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CapturedPhoto, PhotoStripConfig } from '../types/photobooth';

interface PhotoStripBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  capturedPhotos: CapturedPhoto[];
}

const FRAME_PRESETS = [
  { name: 'Noir Dark', hex: '#121216', text: '#ffffff' },
  { name: 'Sakura Pink', hex: '#fce7f3', text: '#831843' },
  { name: 'Creamy Pearl', hex: '#fffbeb', text: '#78350f' },
  { name: 'Cyber Neon', hex: '#0f172a', text: '#38bdf8' },
  { name: 'Retro Amber', hex: '#451a03', text: '#fef3c7' },
  { name: 'Lavender Glow', hex: '#f3e8ff', text: '#6b21a8' },
];

const STICKER_PACKS = [
  { id: 'none', label: 'None', icons: [] },
  { id: 'y2k', label: 'Y2K Stars', icons: ['✨', '💖', '⚡', '🌟', '🎀'] },
  { id: 'cute', label: 'Cute Kawaii', icons: ['🌸', '🧸', '🐰', '🍓', '🎀'] },
  { id: 'cyber', label: 'Cyber Punk', icons: ['⚡', '🤖', '👾', '🌀', '💎'] },
];

export const PhotoStripBuilder: React.FC<PhotoStripBuilderProps> = ({
  isOpen,
  onClose,
  capturedPhotos
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [layoutStyle, setLayoutStyle] = useState<'vertical' | 'grid2x2'>('vertical');
  const [selectedStickerPack, setSelectedStickerPack] = useState<string>('y2k');
  const [customFrameHex, setCustomFrameHex] = useState<string>('#121216');
  const [customTextHex, setCustomTextHex] = useState<string>('#ffffff');
  const [fontStyle, setFontStyle] = useState<'sans' | 'mono' | 'serif'>('mono');
  
  const [config, setConfig] = useState<PhotoStripConfig>({
    layout: '4-strip',
    frameColor: '#121216',
    textColor: '#ffffff',
    titleText: 'AURABOOTH AI',
    dateText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    showStickers: true
  });

  const togglePhotoSelection = (id: string) => {
    if (selectedPhotoIds.includes(id)) {
      setSelectedPhotoIds((prev) => prev.filter((pId) => pId !== id));
    } else {
      if (selectedPhotoIds.length < 4) {
        setSelectedPhotoIds((prev) => [...prev, id]);
      }
    }
  };

  const renderStripCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedList = capturedPhotos.filter((p) => selectedPhotoIds.includes(p.id));
    const fontFamily = fontStyle === 'mono' ? 'monospace' : fontStyle === 'serif' ? 'Georgia, serif' : 'system-ui, sans-serif';

    if (layoutStyle === 'grid2x2') {
      // --- 2x2 GRID CANVAS LAYOUT ---
      const canvasWidth = 700;
      const padding = 32;
      const gap = 16;
      const cellWidth = Math.round((canvasWidth - padding * 2 - gap) / 2);
      const cellHeight = Math.round(cellWidth * 0.75); // 4:3
      const headerHeight = 70;
      const footerHeight = 90;
      const canvasHeight = padding + headerHeight + cellHeight * 2 + gap + footerHeight + padding;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // 1. Background
      ctx.fillStyle = customFrameHex;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Header
      ctx.fillStyle = customTextHex;
      ctx.font = `bold 26px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('✦ ' + config.titleText + ' ✦', canvasWidth / 2, padding + 40);

      // 3. Grid Photos
      const gridCoords = [
        { x: padding, y: padding + headerHeight },
        { x: padding + cellWidth + gap, y: padding + headerHeight },
        { x: padding, y: padding + headerHeight + cellHeight + gap },
        { x: padding + cellWidth + gap, y: padding + headerHeight + cellHeight + gap },
      ];

      gridCoords.forEach((coord, i) => {
        const photo = selectedList[i];
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(coord.x - 4, coord.y - 4, cellWidth + 8, cellHeight + 8);

        if (photo) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = photo.processedUrl || photo.originalDataUrl;
          if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, coord.x, coord.y, cellWidth, cellHeight);
          } else {
            img.onload = () => ctx.drawImage(img, coord.x, coord.y, cellWidth, cellHeight);
          }
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(coord.x, coord.y, cellWidth, cellHeight);
        }
      });

      // 4. Stickers
      const pack = STICKER_PACKS.find((p) => p.id === selectedStickerPack);
      if (pack && pack.icons.length > 0) {
        ctx.font = '28px sans-serif';
        ctx.fillText(pack.icons[0] || '✨', padding + 20, padding + 45);
        ctx.fillText(pack.icons[1] || '💖', canvasWidth - padding - 20, padding + 45);
        ctx.fillText(pack.icons[2] || '⚡', padding + 20, canvasHeight - padding - 30);
        ctx.fillText(pack.icons[3] || '🌟', canvasWidth - padding - 20, canvasHeight - padding - 30);
      }

      // 5. Footer
      ctx.fillStyle = customTextHex;
      ctx.font = `500 16px ${fontFamily}`;
      ctx.fillText(config.dateText, canvasWidth / 2, canvasHeight - padding - 35);
      ctx.font = `bold 12px ${fontFamily}`;
      ctx.globalAlpha = 0.7;
      ctx.fillText('AURASTUDIO AI • PHOTOBOOTH', canvasWidth / 2, canvasHeight - padding - 14);
      ctx.globalAlpha = 1.0;

    } else {
      // --- VERTICAL STRIP LAYOUT ---
      const stripWidth = 560;
      const padding = 32;
      const innerWidth = stripWidth - padding * 2;
      const photoHeight = Math.round(innerWidth * 0.75);
      const photoCount = Math.max(selectedList.length, 1);
      const headerHeight = 60;
      const footerHeight = 110;
      const gap = 18;
      const totalHeight = padding + headerHeight + (photoHeight * photoCount) + (gap * (photoCount - 1)) + footerHeight + padding;

      canvas.width = stripWidth;
      canvas.height = totalHeight;

      // 1. Background
      ctx.fillStyle = customFrameHex;
      ctx.fillRect(0, 0, stripWidth, totalHeight);

      // 2. Header
      ctx.fillStyle = customTextHex;
      ctx.font = `bold 22px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('⚡ ' + config.titleText + ' ⚡', stripWidth / 2, padding + 36);

      // 3. Draw Photos
      let currentY = padding + headerHeight;

      if (selectedList.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(padding, currentY, innerWidth, photoHeight);
        ctx.fillStyle = customTextHex;
        ctx.font = `500 14px ${fontFamily}`;
        ctx.fillText('[ SELECT WEBCAM SHOTS BELOW ]', stripWidth / 2, currentY + photoHeight / 2);
      } else {
        selectedList.forEach((photo) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = photo.processedUrl || photo.originalDataUrl;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(padding - 4, currentY - 4, innerWidth + 8, photoHeight + 8);

          if (img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, padding, currentY, innerWidth, photoHeight);
          } else {
            img.onload = () => ctx.drawImage(img, padding, currentY, innerWidth, photoHeight);
          }

          currentY += photoHeight + gap;
        });
      }

      // 4. Draw Stickers
      const pack = STICKER_PACKS.find((p) => p.id === selectedStickerPack);
      if (pack && pack.icons.length > 0) {
        ctx.font = '24px sans-serif';
        ctx.fillText(pack.icons[0] || '✨', padding + 15, padding + 36);
        ctx.fillText(pack.icons[1] || '💖', stripWidth - padding - 15, padding + 36);
        ctx.fillText(pack.icons[2] || '⚡', padding + 15, totalHeight - padding - 25);
        ctx.fillText(pack.icons[3] || '🌟', stripWidth - padding - 15, totalHeight - padding - 25);
      }

      // 5. Footer
      ctx.fillStyle = customTextHex;
      ctx.font = `500 16px ${fontFamily}`;
      ctx.fillText(config.dateText, stripWidth / 2, totalHeight - padding - 38);
      ctx.font = `bold 12px ${fontFamily}`;
      ctx.globalAlpha = 0.7;
      ctx.fillText('AURASTUDIO AI • PHOTOBOOTH', stripWidth / 2, totalHeight - padding - 16);
      ctx.globalAlpha = 1.0;
    }
  }, [capturedPhotos, selectedPhotoIds, config, layoutStyle, selectedStickerPack, customFrameHex, customTextHex, fontStyle]);

  // Auto-select latest 3 or 4 photos when modal opens
  useEffect(() => {
    if (isOpen && capturedPhotos.length > 0 && selectedPhotoIds.length === 0) {
      const latestIds = capturedPhotos.slice(-4).map((p) => p.id);
      setSelectedPhotoIds(latestIds);
    }
  }, [isOpen, capturedPhotos, selectedPhotoIds.length]);

  // Render canvas strip when selections change
  useEffect(() => {
    if (isOpen) {
      renderStripCanvas();
    }
  }, [isOpen, renderStripCanvas]);

  const handleDownloadStrip = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    const link = document.createElement('a');
    link.download = `photobooth-strip-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-4xl bg-[#090a0f] border border-[#2e3447] rounded-2xl p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1e2333]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Y2K PHOTO STRIP CANVAS STUDIO</h2>
              <p className="text-[10px] text-slate-400">100% Customizable Canvas & Frame Aesthetic</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="md:col-span-6 space-y-4">
            {/* 1. Layout Mode Switcher */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <LayoutGrid className="w-3 h-3 text-cyan-400" />
                <span>CANVAS LAYOUT FORMAT</span>
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLayoutStyle('vertical')}
                  className={`py-1.5 rounded-lg border font-bold transition-all ${
                    layoutStyle === 'vertical'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-[#12151e] border-[#1e2333] text-slate-400 hover:text-white'
                  }`}
                >
                  VERTICAL STRIP (1x4)
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutStyle('grid2x2')}
                  className={`py-1.5 rounded-lg border font-bold transition-all ${
                    layoutStyle === 'grid2x2'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-[#12151e] border-[#1e2333] text-slate-400 hover:text-white'
                  }`}
                >
                  KOREAN GRID (2x2)
                </button>
              </div>
            </div>

            {/* 2. Select Photos from Gallery */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                SELECT SHOTS ({selectedPhotoIds.length}/4)
              </label>
              {capturedPhotos.length === 0 ? (
                <div className="p-4 bg-[#12151e] border border-[#1e2333] rounded-xl text-center">
                  <p className="text-xs text-slate-400 mb-2">No photos taken yet!</p>
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded flex items-center gap-1.5 mx-auto"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>TAKE WEBCAM PHOTOS</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {capturedPhotos.map((photo, idx) => {
                    const isSelected = selectedPhotoIds.includes(photo.id);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected
                            ? 'border-cyan-500 scale-105 shadow-md shadow-cyan-500/20'
                            : 'border-[#1e2333] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={photo.processedUrl || photo.originalDataUrl} alt={`Shot ${idx}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded bg-cyan-500 text-slate-950 font-bold">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Custom Frame Color Picker & Presets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Palette className="w-3 h-3 text-cyan-400" />
                  <span>CUSTOM FRAME COLOR</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[9px]">COLOR PICKER:</span>
                  <input
                    type="color"
                    value={customFrameHex}
                    onChange={(e) => setCustomFrameHex(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-none"
                    title="Choose Custom Frame Color"
                  />
                  <input
                    type="color"
                    value={customTextHex}
                    onChange={(e) => setCustomTextHex(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-none"
                    title="Choose Custom Text Color"
                  />
                </div>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {FRAME_PRESETS.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setCustomFrameHex(theme.hex);
                      setCustomTextHex(theme.text);
                    }}
                    className={`py-1 px-1 rounded-lg text-[9px] font-semibold transition-all border truncate ${
                      customFrameHex === theme.hex
                        ? 'border-cyan-500 scale-105 shadow-md'
                        : 'border-[#1e2333] hover:border-[#2e3447]'
                    }`}
                    style={{ backgroundColor: theme.hex, color: theme.text }}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Custom Sticker Pack */}
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Smile className="w-3 h-3 text-cyan-400" />
                <span>CANVAS STICKERS</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {STICKER_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedStickerPack(pack.id)}
                    className={`py-1 rounded-lg border text-[10px] font-bold transition-all ${
                      selectedStickerPack === pack.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-[#12151e] border-[#1e2333] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pack.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Custom Typography & Text */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <label className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase">Title Text</label>
                <input
                  type="text"
                  value={config.titleText}
                  onChange={(e) => setConfig({ ...config, titleText: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase">Date Stamp</label>
                <input
                  type="text"
                  value={config.dateText}
                  onChange={(e) => setConfig({ ...config, dateText: e.target.value })}
                  className="w-full px-2 py-1.5 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-[9px] font-semibold text-slate-400 mb-1 uppercase">Font</label>
                <select
                  value={fontStyle}
                  onChange={(e: any) => setFontStyle(e.target.value)}
                  className="w-full px-1.5 py-1.5 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="mono">MONO</option>
                  <option value="sans">SANS</option>
                  <option value="serif">SERIF</option>
                </select>
              </div>
            </div>

            {/* Download Action */}
            <div className="pt-2 border-t border-[#1e2333]">
              <button
                onClick={handleDownloadStrip}
                disabled={capturedPhotos.length === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD CUSTOM CANVASES STRIP (PNG)</span>
              </button>
            </div>
          </div>

          {/* Live Preview Canvas Container */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-[#12151e] p-4 rounded-xl border border-[#1e2333]">
            <p className="text-[10px] text-slate-400 mb-2 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>LIVE CANVAS RENDER PREVIEW</span>
            </p>
            <div className="max-h-115 overflow-y-auto rounded-lg border border-[#2e3447] shadow-2xl p-2 bg-[#090a0f]">
              <canvas ref={canvasRef} className="w-full max-w-70 h-auto rounded shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
