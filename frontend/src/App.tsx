import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WebcamViewport } from './components/WebcamViewport';
import { PoseRecommendationCard } from './components/PoseRecommendationCard';
import { FilterSelector } from './components/FilterSelector';
import { GalleryDrawer } from './components/GalleryDrawer';
import { PhotoStripBuilder } from './components/PhotoStripBuilder';
import { QRCodeModal } from './components/QRCodeModal';
import { ApiKeyModal } from './components/ApiKeyModal';

import { DEFAULT_POSES, AI_FILTERS } from './lib/presets';
import type { CapturedPhoto, AIFilter, PoseRecommendation } from './types/photobooth';
import { pollinationsService } from './services/pollinations';

export function App() {
  const [poses, setPoses] = useState<PoseRecommendation[]>(DEFAULT_POSES);
  const [activePose, setActivePose] = useState<PoseRecommendation | undefined>(DEFAULT_POSES[0]);
  
  const [filters, setFilters] = useState<AIFilter[]>(AI_FILTERS);
  const [activeFilter, setActiveFilter] = useState<AIFilter>(AI_FILTERS[0]);
  
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const [isStripBuilderOpen, setIsStripBuilderOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Generate live AI Poses on initial load based on default theme
  useEffect(() => {
    let isMounted = true;
    pollinationsService.generateAIPoses('Photobooth Aesthetics').then((aiPoses) => {
      if (isMounted && aiPoses.length > 0) {
        setPoses(aiPoses);
        setActivePose(aiPoses[0]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Photo Capture from Webcam with True Image-to-Image AI Transformation
  const handleCapturePhoto = async (originalDataUrl: string) => {
    setIsProcessingAI(true);
    const photoId = `shot-${Date.now()}`;

    // 1. Upload base64 captured photo to Pollinations Media Storage
    const uploadedMediaUrl = await pollinationsService.uploadWebcamPhoto(originalDataUrl);

    // 2. Construct Image-to-Image transformation URL using the uploaded webcam photo
    const prompt = activeFilter.promptPreset;
    const aiImageUrl = pollinationsService.getImageUrl(
      prompt,
      undefined,
      1024,
      768,
      Math.floor(Math.random() * 10000),
      uploadedMediaUrl || undefined
    );

    const newPhoto: CapturedPhoto = {
      id: photoId,
      originalDataUrl,
      processedUrl: aiImageUrl,
      isProcessing: false,
      timestamp: new Date().toLocaleTimeString(),
      appliedFilter: activeFilter,
      poseUsed: activePose?.title
    };

    setCapturedPhotos((prev) => [...prev, newPhoto]);
    setIsProcessingAI(false);
  };

  // Helper to derive smart CSS filter from custom user prompt keywords
  const deriveCssFilterFromPrompt = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('black') || lower.includes('white') || lower.includes('noir') || lower.includes('monochrome')) {
      return 'grayscale(100%) contrast(170%) brightness(90%)';
    }
    if (lower.includes('sepia') || lower.includes('vintage') || lower.includes('retro') || lower.includes('old') || lower.includes('90s')) {
      return 'sepia(55%) contrast(95%) brightness(105%) saturate(80%)';
    }
    if (lower.includes('cyber') || lower.includes('neon') || lower.includes('purple') || lower.includes('future')) {
      return 'contrast(135%) hue-rotate(190deg) saturate(220%)';
    }
    if (lower.includes('anime') || lower.includes('cartoon') || lower.includes('vibrant') || lower.includes('pop')) {
      return 'saturate(240%) contrast(125%) brightness(110%)';
    }
    if (lower.includes('warm') || lower.includes('sun') || lower.includes('gold')) {
      return 'brightness(110%) saturate(140%) sepia(20%) hue-rotate(-10deg)';
    }
    if (lower.includes('cool') || lower.includes('blue') || lower.includes('ice') || lower.includes('cold')) {
      return 'brightness(105%) saturate(120%) hue-rotate(160deg)';
    }
    return 'contrast(130%) saturate(160%) brightness(105%)';
  };

  // Apply custom prompt as dynamic custom filter
  const handleApplyCustomPrompt = (customPrompt: string) => {
    const derivedCss = deriveCssFilterFromPrompt(customPrompt);
    const customFilter: AIFilter = {
      id: `custom-${Date.now()}`,
      name: customPrompt.length > 16 ? customPrompt.substring(0, 16) + '...' : customPrompt,
      category: 'Artistic',
      description: customPrompt,
      cssFilter: derivedCss,
      promptPreset: customPrompt,
      accentColor: '#c084fc',
      badge: 'Custom'
    };

    // Add to filters array if not already present, and set active
    setFilters((prev) => [customFilter, ...prev.filter((f) => f.badge !== 'Custom')]);
    setActiveFilter(customFilter);
  };

  const handleDeletePhoto = (id: string) => {
    setCapturedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Robust Direct Download (handles cross-origin image URLs via Blob conversion)
  const handleDownloadPhoto = async (photo: CapturedPhoto) => {
    const targetUrl = photo.processedUrl || photo.originalDataUrl;
    const filename = `aurastudio-${photo.id}.png`;

    try {
      if (targetUrl.startsWith('data:')) {
        // Base64 Data URL direct download
        const link = document.createElement('a');
        link.download = filename;
        link.href = targetUrl;
        link.click();
      } else {
        // Cross-origin HTTP URL download via Blob
        const response = await fetch(targetUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = filename;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn('Direct blob download failed, fallback to new tab download:', err);
      window.open(targetUrl, '_blank');
    }
  };

  const latestPhoto = capturedPhotos[capturedPhotos.length - 1];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Header
        photoCount={capturedPhotos.length}
        activeFilterName={activeFilter.name}
        onOpenStripBuilder={() => setIsStripBuilderOpen(true)}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Studio Grid: Camera Feed + AI Pose Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Webcam Viewport Section */}
          <div className="lg:col-span-8">
            <WebcamViewport
              activeFilter={activeFilter}
              activePose={activePose}
              onCapture={handleCapturePhoto}
              isProcessingAI={isProcessingAI}
            />
          </div>

          {/* AI Pose Recommendation Studio */}
          <div className="lg:col-span-4 h-full">
            <PoseRecommendationCard
              poses={poses}
              activePose={activePose}
              onSelectPose={(pose) => setActivePose(pose)}
              onUpdatePoses={(newPoses) => setPoses(newPoses)}
            />
          </div>
        </div>

        {/* AI Filter & Style Selector Bar */}
        <FilterSelector
          filters={filters}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => setActiveFilter(filter)}
          onApplyCustomPrompt={handleApplyCustomPrompt}
        />

        {/* Gallery Drawer for Captured Shots */}
        <GalleryDrawer
          photos={capturedPhotos}
          onDeletePhoto={handleDeletePhoto}
          onDownloadPhoto={handleDownloadPhoto}
        />
      </main>

      {/* Footer Branding */}
      <footer className="w-full border-t border-[#1e2333] bg-[#090a0f] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <p>AURASTUDIO AI • Dynamic Custom Filter Engine & True Image-to-Image AI Engine</p>
      </footer>

      {/* Photo Strip Builder Modal */}
      <PhotoStripBuilder
        isOpen={isStripBuilderOpen}
        onClose={() => setIsStripBuilderOpen(false)}
        capturedPhotos={capturedPhotos}
      />

      {/* QR Code Share Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        latestPhotoUrl={latestPhoto?.processedUrl || latestPhoto?.originalDataUrl}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={() => {
          pollinationsService.generateAIPoses('Photobooth Aesthetics').then((aiPoses) => {
            if (aiPoses.length > 0) {
              setPoses(aiPoses);
              setActivePose(aiPoses[0]);
            }
          });
        }}
      />
    </div>
  );
}

export default App;
