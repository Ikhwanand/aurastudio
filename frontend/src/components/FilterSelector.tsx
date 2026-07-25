import React, { useState } from 'react';
import { SlidersHorizontal, ArrowRight } from 'lucide-react';
import type { AIFilter } from '../types/photobooth';

interface FilterSelectorProps {
  filters: AIFilter[];
  activeFilter: AIFilter;
  onSelectFilter: (filter: AIFilter) => void;
  onApplyCustomPrompt: (prompt: string) => void;
}

export const FilterSelector: React.FC<FilterSelectorProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
  onApplyCustomPrompt
}) => {
  const [customPromptInput, setCustomPromptInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPromptInput.trim()) {
      onApplyCustomPrompt(customPromptInput.trim());
      setCustomPromptInput('');
    }
  };

  return (
    <div className="bg-[#090a0f] border border-[#2e3447] rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold text-white tracking-wider uppercase">STYLE ENGINE PRESETS</h3>
        </div>
      </div>

      {/* Filter Presets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-4">
        {filters.map((filter) => {
          const isActive = activeFilter.id === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectFilter(filter)}
              className={`p-2.5 rounded-xl border text-left transition-all font-mono ${
                isActive
                  ? 'bg-[#181c28] border-cyan-500 text-white shadow-md'
                  : 'bg-[#12151e]/60 border-[#1e2333] text-slate-400 hover:border-[#2e3447] hover:text-slate-200'
              }`}
            >
              <div
                className="w-full aspect-video rounded-md mb-2 relative overflow-hidden border border-[#1e2333]"
                style={{ backgroundColor: filter.accentColor + '20' }}
              >
                <div
                  className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 opacity-70"
                  style={{ filter: filter.cssFilter }}
                />
                <span className="absolute top-1 right-1 px-1 py-0.2 text-[8px] font-bold text-white bg-black/80 rounded">
                  {filter.badge}
                </span>
              </div>

              <h4 className="text-xs font-bold truncate">{filter.name}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{filter.description}</p>
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Input Bar */}
      <form onSubmit={handleCustomSubmit} className="relative flex items-center font-mono">
        <input
          type="text"
          value={customPromptInput}
          onChange={(e) => setCustomPromptInput(e.target.value)}
          placeholder="CUSTOM STYLIST PROMPT (e.g. '80s Retro Cyberpunk in Tokyo')..."
          className="w-full pl-4 pr-24 py-2 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!customPromptInput.trim()}
          className="absolute right-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded flex items-center gap-1 transition-all disabled:opacity-40"
        >
          <span>EXECUTE</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
