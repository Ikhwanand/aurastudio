import React, { useState } from 'react';
import { Check, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import type { PoseRecommendation } from '../types/photobooth';
import { pollinationsService } from '../services/pollinations';

interface PoseRecommendationCardProps {
  poses: PoseRecommendation[];
  activePose?: PoseRecommendation;
  onSelectPose: (pose: PoseRecommendation) => void;
  onUpdatePoses: (newPoses: PoseRecommendation[]) => void;
}

const QUICK_PREFERENCES = [
  'K-Drama Cafe Date',
  'Y2K Streetwear Duo',
  'Cyberpunk Assassin',
  'Anime High School',
  'Retro 90s Model',
  'Cozy Solo Vibe'
];

export const PoseRecommendationCard: React.FC<PoseRecommendationCardProps> = ({
  poses,
  activePose,
  onSelectPose,
  onUpdatePoses
}) => {
  const [customPreference, setCustomPreference] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCustomPoses = async (preferenceText: string) => {
    if (!preferenceText.trim()) return;
    setIsGenerating(true);
    try {
      const aiGeneratedPoses = await pollinationsService.generateAIPoses(preferenceText.trim());
      if (aiGeneratedPoses.length > 0) {
        onUpdatePoses(aiGeneratedPoses);
        onSelectPose(aiGeneratedPoses[0]);
      }
    } catch (err) {
      console.error('Failed to generate AI Poses:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerateCustomPoses(customPreference);
  };

  return (
    <div className="bg-[#090a0f] border border-[#2e3447] rounded-2xl p-4 shadow-xl flex flex-col h-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="font-mono text-xs font-bold text-white tracking-wider uppercase">AI POSE STYLIST</h3>
            <p className="font-mono text-[10px] text-slate-400">Personalized Pose Generator</p>
          </div>
        </div>
      </div>

      {/* User Vibe Preference Input Form */}
      <form onSubmit={handleFormSubmit} className="mb-3 space-y-2">
        <label className="block font-mono text-[10px] text-slate-400 uppercase tracking-wider">
          What vibe or style do you want?
        </label>
        <div className="relative flex items-center font-mono">
          <input
            type="text"
            value={customPreference}
            onChange={(e) => setCustomPreference(e.target.value)}
            placeholder="e.g. 'Cozy Korean cafe date', '90s Y2K model'..."
            className="w-full pl-3 pr-20 py-2 bg-[#12151e] border border-[#1e2333] focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!customPreference.trim() || isGenerating}
            className="absolute right-1 px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 transition-all disabled:opacity-40"
          >
            <span>{isGenerating ? 'GEN...' : 'GENERATE'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </form>

      {/* Quick Vibe Chips */}
      <div className="flex flex-wrap gap-1 mb-3 font-mono">
        {QUICK_PREFERENCES.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => {
              setCustomPreference(chip);
              handleGenerateCustomPoses(chip);
            }}
            className="px-2 py-0.5 text-[9px] font-semibold text-slate-400 bg-[#12151e] hover:bg-[#181c28] hover:text-cyan-300 border border-[#1e2333] rounded transition-colors"
          >
            + {chip}
          </button>
        ))}
      </div>

      {/* AI Generated Poses List */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-80 pr-1 border-t border-[#1e2333] pt-2">
        {isGenerating ? (
          <div className="p-6 text-center font-mono">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-white font-bold">CRAFTING CUSTOM POSES...</p>
            <p className="text-[10px] text-slate-500 mt-1">Pollinations LLM is designing matching poses</p>
          </div>
        ) : (
          poses.map((pose) => {
            const isActive = activePose?.id === pose.id;
            return (
              <div
                key={pose.id}
                onClick={() => onSelectPose(pose)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#181c28] border-cyan-500/80 shadow-md'
                    : 'bg-[#12151e]/60 border-[#1e2333] hover:border-[#2e3447] hover:bg-[#12151e]'
                }`}
              >
                <div className="flex gap-2.5 items-center">
                  {/* Visual Reference Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-[#2e3447]">
                    <img
                      src={pose.visualUrl}
                      alt={pose.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Check className="w-4 h-4 text-cyan-300" />
                      </div>
                    )}
                  </div>

                  {/* Pose Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate font-mono">{pose.title}</h4>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 rounded border border-cyan-800/40">
                        {pose.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {pose.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
