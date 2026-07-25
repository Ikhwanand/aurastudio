import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Check, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('pollinations_api_key') || '';
      setApiKeyInput(storedKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    localStorage.setItem('pollinations_api_key', cleanKey);
    onSaveKey(cleanKey);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono">
      <div className="relative w-full max-w-md bg-[#090a0f] border border-[#2e3447] rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1e2333]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">API KEY SETTINGS</h3>
              <p className="text-[10px] text-slate-400">Pollinations AI Access Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xs font-mono transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
          Enter your custom Pollinations AI API Key to enable high-speed LLM pose generation and image transformations.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              POLLINATIONS API KEY
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk_..."
                className="w-full pl-3 pr-10 py-2 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-500 hover:text-white"
                title="Toggle Visibility"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <a
              href="https://enter.pollinations.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Get API Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>Saved locally in browser</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-[#181c28] hover:bg-[#222738] text-slate-300 text-xs font-semibold border border-[#2e3447] transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>SAVED!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE KEY</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
