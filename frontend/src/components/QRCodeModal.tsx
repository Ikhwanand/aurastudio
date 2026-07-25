import React, { useState } from 'react';
import { X, QrCode, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestPhotoUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  latestPhotoUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [shareTab, setShareTab] = useState<'app' | 'photo'>('app');

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const activeShareUrl = (shareTab === 'photo' && latestPhotoUrl) ? latestPhotoUrl : currentUrl;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeShareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-sm bg-[#090a0f] border border-[#2e3447] rounded-2xl p-5 shadow-2xl text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">MOBILE QR SHARE</h3>
        <p className="text-[10px] text-slate-400 mb-4">Scan with smartphone camera for mobile access</p>

        {/* Share Mode Selector Tabs */}
        {latestPhotoUrl && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#12151e] rounded-lg border border-[#1e2333] mb-4 text-[10px]">
            <button
              onClick={() => setShareTab('app')}
              className={`py-1 rounded font-bold transition-colors ${
                shareTab === 'app' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              STUDIO APP
            </button>
            <button
              onClick={() => setShareTab('photo')}
              className={`py-1 rounded font-bold transition-colors ${
                shareTab === 'photo' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              LATEST PHOTO
            </button>
          </div>
        )}

        {/* Dynamic QR Code Canvas Image */}
        <div className="bg-white p-3 rounded-xl inline-block mb-4 border border-[#2e3447] shadow-lg">
          <img
            src={qrApiUrl}
            alt="Mobile QR Code"
            className="w-40 h-40"
          />
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-1.5 bg-[#12151e] p-1.5 rounded-lg border border-[#1e2333]">
          <input
            type="text"
            readOnly
            value={activeShareUrl}
            className="w-full bg-transparent text-[10px] text-slate-300 px-2 focus:outline-none truncate font-mono"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] rounded shrink-0 flex items-center gap-1 transition-all"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
