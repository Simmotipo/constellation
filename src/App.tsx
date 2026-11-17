import React, { useCallback, useEffect, useMemo, useState } from 'react';
import defaultConfigJson from './config/constellation.json';
import {
  ConstellationConfig,
  EndpointHealth,
  PositionedStar,
} from './types/constellation';
import { computeUniverseLayout } from './utils/universeLayout';
import { CameraState, UniverseCanvas } from './components/UniverseCanvas';
import { HudOverlay } from './components/HudOverlay';
import { CommandPalette } from './components/CommandPalette';
import { ListView } from './components/ListView';
import { ConfigModal } from './components/ConfigModal';

const STORAGE_KEY = 'constellation_config_override_v1';
const defaultConfig = defaultConfigJson as ConstellationConfig;

export const App: React.FC = () => {
  const [config, setConfig] = useState<ConstellationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.services)) {
          return parsed;
        }
      }
    } catch {
      // ignore corrupted local storage
    }
    return defaultConfig;
  });

  const [hasLocalChanges, setHasLocalChanges] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  });

  const [viewMode, setViewMode] = useState<'universe' | 'grid'>('universe');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery] = useState<string>('');
  const [highlightedStarId, setHighlightedStarId] = useState<string | null>(null);
  const [isDragMode, setIsDragMode] = useState<boolean>(false);

  const [camera, setCamera] = useState<CameraState>({
    x: 0,
    y: -20,
    zoom: 0.85,
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [configModalState, setConfigModalState] = useState<{
    isOpen: boolean;
    initialTab: 'services' | 'add' | 'json';
    editingServiceId: string | null;
  }>({
    isOpen: false,
    initialTab: 'services',
    editingServiceId: null,
  });

  const [healthMap, setHealthMap] = useState<Record<string, EndpointHealth>>({});
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const { stars, clusters, allTags } = useMemo(
    () => computeUniverseLayout(config),
    [config]
  );

  // Update config & persist to localStorage
  const handleUpdateConfig = useCallback((nextConfig: ConstellationConfig) => {
    setConfig(nextConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
      setHasLocalChanges(true);
    } catch {
      // ignore quota errors
    }
  }, []);

  const handleResetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(defaultConfig);
    setHasLocalChanges(false);
  }, []);

  // Drag star position updater
  const handleUpdateStarPosition = useCallback(
    (serviceId: string, x: number, y: number) => {
      setConfig((prev) => {
        const next: ConstellationConfig = {
          ...prev,
          services: prev.services.map((s) =>
            s.id === serviceId ? { ...s, position: { x, y } } : s
          ),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setHasLocalChanges(true);
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  // Global Cmd/Ctrl + K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Tag selection + smooth camera focus on Constellation sector
  const handleSelectTag = useCallback(
    (tag: string | null) => {
      setSelectedTag(tag);
      if (!tag) {
        setCamera({ x: 0, y: -20, zoom: 0.85 });
        return;
      }
      const cluster = clusters.find(
        (c) => c.tag.toLowerCase() === tag.toLowerCase()
      );
      if (cluster) {
        setCamera({
          x: cluster.centerX,
          y: cluster.centerY,
          zoom: 1.05,
        });
      }
    },
    [clusters]
  );

  // Focus a specific star on the Universe Map
  const handleFocusStarOnMap = useCallback((star: PositionedStar) => {
    setViewMode('universe');
    setSelectedTag(null);
    setCamera({
      x: star.x,
      y: star.y,
      zoom: 1.25,
    });
    setHighlightedStarId(star.service.id);
    setTimeout(() => {
      setHighlightedStarId((prev) => (prev === star.service.id ? null : prev));
    }, 3500);
  }, []);

  // Open Edit Modal for a specific star
  const handleEditStar = useCallback((serviceId: string) => {
    setConfigModalState({
      isOpen: true,
      initialTab: 'add',
      editingServiceId: serviceId,
    });
  }, []);

  // Server-side Health Checks via Cloudflare Pages Function (/api/health)
  const handleRunHealthChecks = useCallback(async () => {
    const allUrls = Array.from(
      new Set(
        stars.flatMap((s) =>
          s.urls.secondaryUrl
            ? [s.urls.primaryUrl, s.urls.secondaryUrl]
            : [s.urls.primaryUrl]
        )
      )
    );

    if (allUrls.length === 0) return;
    setIsCheckingHealth(true);

    const checkingState: Record<string, EndpointHealth> = {};
    for (const u of allUrls) {
      checkingState[u] = { url: u, status: 'checking' };
    }
    setHealthMap((prev) => ({ ...prev, ...checkingState }));

    try {
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: allUrls }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const nextMap: Record<string, EndpointHealth> = {};
      for (const item of data.results || []) {
        nextMap[item.url] = item;
      }
      setHealthMap((prev) => ({ ...prev, ...nextMap }));
    } catch {
      const fallbackMap: Record<string, EndpointHealth> = {};
      for (const u of allUrls) {
        fallbackMap[u] = {
          url: u,
          status: 'offline',
          note: 'Health probe unavailable',
        };
      }
      setHealthMap((prev) => ({ ...prev, ...fallbackMap }));
    } finally {
      setIsCheckingHealth(false);
    }
  }, [stars]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03050c] text-slate-100">
      {/* Top HUD & Navigation Controls */}
      <HudOverlay
        title={config.title}
        subtitle={config.subtitle}
        defaultDomain={config.defaultDomain}
        allTags={allTags}
        clusters={clusters}
        selectedTag={selectedTag}
        onSelectTag={handleSelectTag}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenConfigModal={(tab = 'services') =>
          setConfigModalState({
            isOpen: true,
            initialTab: tab,
            editingServiceId: null,
          })
        }
        onRunHealthChecks={handleRunHealthChecks}
        isCheckingHealth={isCheckingHealth}
        healthMap={healthMap}
        hasLocalChanges={hasLocalChanges}
        isDragMode={isDragMode}
        onToggleDragMode={() => setIsDragMode((prev) => !prev)}
        onZoomIn={() =>
          setCamera((prev) => ({
            ...prev,
            zoom: Math.min(2.2, prev.zoom * 1.2),
          }))
        }
        onZoomOut={() =>
          setCamera((prev) => ({
            ...prev,
            zoom: Math.max(0.32, prev.zoom * 0.82),
          }))
        }
        onResetView={() => {
          setSelectedTag(null);
          setCamera({ x: 0, y: -20, zoom: 0.85 });
        }}
      />

      {/* Main View: Interactive Universe Canvas vs Tactical Star Chart Grid */}
      {viewMode === 'universe' ? (
        <UniverseCanvas
          stars={stars}
          clusters={clusters}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          highlightedStarId={highlightedStarId}
          openInNewTab={config.openInNewTab}
          healthMap={healthMap}
          camera={camera}
          onCameraChange={setCamera}
          isDragMode={isDragMode}
          onUpdateStarPosition={handleUpdateStarPosition}
          onEditStar={handleEditStar}
          onSelectTag={handleSelectTag}
        />
      ) : (
        <ListView
          clusters={clusters}
          selectedTag={selectedTag}
          searchQuery={searchQuery}
          openInNewTab={config.openInNewTab}
          healthMap={healthMap}
          onEditStar={handleEditStar}
          onLocateStarOnMap={handleFocusStarOnMap}
        />
      )}

      {/* Command Palette (Cmd/Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        stars={stars}
        openInNewTab={config.openInNewTab}
        healthMap={healthMap}
        onFocusStarOnMap={handleFocusStarOnMap}
      />

      {/* In-App Configuration & JSON Export Modal */}
      <ConfigModal
        isOpen={configModalState.isOpen}
        initialTab={configModalState.initialTab}
        editingServiceId={configModalState.editingServiceId}
        config={config}
        hasLocalChanges={hasLocalChanges}
        onUpdateConfig={handleUpdateConfig}
        onResetToDefault={handleResetToDefault}
        onClose={() =>
          setConfigModalState((prev) => ({
            ...prev,
            isOpen: false,
            editingServiceId: null,
          }))
        }
      />
    </div>
  );
};

export default App;
