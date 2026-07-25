export interface PoseRecommendation {
  id: string;
  title: string;
  category: 'Solo' | 'Couple' | 'Group' | 'Fun' | 'Vibe';
  description: string;
  visualUrl: string;
  svgOverlayPath: string;
  tips: string[];
}

export interface AIFilter {
  id: string;
  name: string;
  category: 'Popular' | 'Artistic' | 'Vintage' | 'Anime';
  description: string;
  cssFilter: string;
  promptPreset: string;
  accentColor: string;
  badge: string;
}

export interface CapturedPhoto {
  id: string;
  originalDataUrl: string;
  processedUrl?: string;
  isProcessing: boolean;
  timestamp: string;
  appliedFilter: AIFilter;
  customPrompt?: string;
  poseUsed?: string;
}

export interface PhotoStripConfig {
  layout: '3-strip' | '4-strip';
  frameColor: string;
  textColor: string;
  titleText: string;
  dateText: string;
  showStickers: boolean;
}
