import type { PoseRecommendation, AIFilter } from '../types/photobooth';
import { pollinationsService } from '../services/pollinations';

export const DEFAULT_POSES: PoseRecommendation[] = [
  {
    id: 'heart-cheek',
    title: 'The Heart Cheek',
    category: 'Solo',
    description: 'Form half a heart with your hand resting softly on your cheek.',
    visualUrl: pollinationsService.getImageUrl('cute person cheek heart pose photobooth photo', 'flux', 512, 512, 101),
    svgOverlayPath: 'M 200 130 Q 200 100 225 100 T 250 130 Q 250 170 200 200 Q 150 170 150 130 T 175 100 T 200 130 Z',
    tips: ['Tilt chin slightly downwards', 'Gently rest fingers on cheek', 'Warm natural smile']
  },
  {
    id: 'kdrama-lean',
    title: 'K-Drama Shoulder Lean',
    category: 'Couple',
    description: 'Rest your head gently on companion’s shoulder with soft aesthetic focus.',
    visualUrl: pollinationsService.getImageUrl('romantic couple head on shoulder korean studio photobooth', 'flux', 512, 512, 102),
    svgOverlayPath: 'M 140 150 C 140 100 220 100 220 150 M 180 170 L 180 260',
    tips: ['Relax shoulder line', 'Look directly at camera lens', 'Keep heads touching gently']
  },
  {
    id: 'y2k-peace',
    title: 'Y2K Peace & Wink',
    category: 'Fun',
    description: 'Double peace V-sign close to eye with a cheeky wink.',
    visualUrl: pollinationsService.getImageUrl('y2k aesthetic girl peace sign wink flash photobooth', 'flux', 512, 512, 103),
    svgOverlayPath: 'M 170 140 L 140 90 M 170 140 L 190 95 M 230 140 L 210 90 M 230 140 L 245 95',
    tips: ['Bring peace sign close to lens', 'Playful wink', 'Tilt head 15 degrees right']
  },
  {
    id: 'chill-boss',
    title: 'The Cool Boss',
    category: 'Vibe',
    description: 'Folded arms, 45-degree angle body stance with a confident gaze.',
    visualUrl: pollinationsService.getImageUrl('stylish person crossed arms confident portrait photobooth', 'flux', 512, 512, 104),
    svgOverlayPath: 'M 130 200 L 270 200 M 150 175 L 250 175',
    tips: ['Elevate chin slightly', 'Strong eye contact', 'Straight shoulder posture']
  },
  {
    id: 'squad-huddle',
    title: 'Squad Peek-a-Boo',
    category: 'Group',
    description: 'Group of friends peeking into frame at different vertical levels.',
    visualUrl: pollinationsService.getImageUrl('cheerful group of friends squeezing into photobooth frame', 'flux', 512, 512, 105),
    svgOverlayPath: 'M 100 160 Q 140 110 180 160 M 220 160 Q 260 110 300 160 M 160 220 Q 200 180 240 220',
    tips: ['Squeeze tightly together', 'Different height levels', 'Big expressive laughs']
  }
];

export const AI_FILTERS: AIFilter[] = [
  {
    id: 'natural',
    name: 'Natural Studio',
    category: 'Popular',
    description: 'Crisp studio lighting with natural skin tone balance.',
    cssFilter: 'contrast(105%) brightness(102%) saturate(105%)',
    promptPreset: 'professional photobooth studio portrait, crisp focus, soft beauty light, natural skin tones, masterpiece 8k',
    accentColor: '#6366f1',
    badge: 'Classic'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    category: 'Artistic',
    description: 'Futuristic neon cyan & magenta glow with dark atmosphere.',
    cssFilter: 'contrast(135%) hue-rotate(190deg) saturate(220%) invert(10%)',
    promptPreset: 'cyberpunk neon city photobooth portrait, glowing cyan and magenta volumetric lights, futuristic night aesthetic, cinematic 8k render',
    accentColor: '#06b6d4',
    badge: 'Popular'
  },
  {
    id: 'kdrama-90s',
    name: '90s Korean Film',
    category: 'Vintage',
    description: 'Warm retro 35mm film grain, soft pastel tones, cozy mood.',
    cssFilter: 'sepia(45%) contrast(90%) brightness(105%) saturate(75%)',
    promptPreset: '90s Korean retro film photobooth portrait, soft grain, warm kodak film aesthetic, cozy nostalgic lighting, vintage 35mm photograph',
    accentColor: '#f59e0b',
    badge: 'Retro'
  },
  {
    id: 'anime-world',
    name: 'Anime Studio',
    category: 'Anime',
    description: 'Vibrant cell-shaded anime style with dramatic lighting.',
    cssFilter: 'saturate(220%) contrast(130%) brightness(110%) sepia(15%)',
    promptPreset: 'Makoto Shinkai style anime portrait, vibrant skies, detailed cell shading, Ghibli inspired color palette, masterpiece anime art',
    accentColor: '#ec4899',
    badge: 'Hot'
  },
  {
    id: 'pixar-3d',
    name: '3D Pixar Avatar',
    category: 'Artistic',
    description: 'Charming 3D animated character style with expressive eyes.',
    cssFilter: 'contrast(125%) saturate(180%) brightness(108%) hue-rotate(-15deg)',
    promptPreset: '3D Pixar Disney style animated character portrait, adorable expression, smooth subsurface scattering, studio render, cute art',
    accentColor: '#8b5cf6',
    badge: 'Fun'
  },
  {
    id: 'neon-noir',
    name: 'Neon Noir',
    category: 'Vintage',
    description: 'Dramatic black & white high contrast with electric blue highlights.',
    cssFilter: 'grayscale(100%) contrast(180%) brightness(85%)',
    promptPreset: 'dramatic cinematic noir portrait, high contrast black and white with subtle electric blue rim light, mystery atmosphere',
    accentColor: '#3b82f6',
    badge: 'Moody'
  }
];
