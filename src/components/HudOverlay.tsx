import React from 'react';
import {
  Activity,
  Compass,
  FolderGit2,
  LayoutGrid,
  Maximize2,
  Move,
  Plus,
  Search,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ConstellationCluster, EndpointHealth } from '../types/constellation';

interface HudOverlayProps {
  title: string;
  subtitle: string;
  defaultDomain: string;
  allTags: string[];
  clusters: ConstellationCluster[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  viewMode: 'universe' | 'grid';
  onViewModeChange: (mode: 'universe' | 'grid') => void;
  onOpenCommandPalette: () => void;
  onOpenConfigModal: (initialTab?: 'services' | 'add' | 'json') => void;
  onRunHealthChecks: () => void;
  isCheckingHealth: boolean;
  healthMap: Record<string, EndpointHealth>;
  hasLocalChanges: boolean;
  isDragMode: boolean;
  onToggleDragMode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export const HudOverlay: React.FC<HudOverlayProps> = ({
  title,
  subtitle,
  defaultDomain,
  allTags,
  clusters,
  selectedTag,
  onSelectTag,
  viewMode,
  onViewModeChange,
  onOpenCommandPalette,
  onOpenConfigModal,
  onRunHealthChecks,
  isCheckingHealth,
  healthMap,
  hasLocalChanges,
  isDragMode,
  onToggleDragMode,
  onZoomIn,
  onZoomOut,
  onResetView,
}) => {
  const clusterTagSet = new Set(clusters.map((c) => c.tag));
  const clusterColorMap = Object.fromEntries(clusters.map((c) => [c.tag, c.color]));

  const healthEntries = Object.values(healthMap);
  const onlineCount = healthEntries.filter((h) => h.status === 'online').length;
  const offlineCount = healthEntries.filter((h) => h.status === 'offline').length;

  return (
    <>
      {/* Top Telemetry & Command Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none p-3 sm:p-4 flex flex-col gap-2.5">
        <div className="pointer-events-auto mx-auto w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base sm:text-lg tracking-[0.18em] text-white uppercase">
                  {title}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  *-a / *-b.{defaultDomain}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          {/* Center / Right Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Search / Command Palette Trigger */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-400/50 text-slate-300 text-xs transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-slate-400">Jump to star or service...</span>
              <span className="md:hidden text-slate-400">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-400 rounded border border-slate-800">
                ⌘K
              </kbd>
            </button>

            {/* Server-side Health Probe Button */}
            <button
              type="button"
              onClick={onRunHealthChecks}
              disabled={isCheckingHealth}
              title="Ping all primary (-a) and secondary (-b) endpoints via Cloudflare Pages Function (/api/health)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-400/50 text-xs text-slate-200 transition-all disabled:opacity-50"
            >
              <Activity
                className={`w-3.5 h-3.5 ${
                  isCheckingHealth ? 'text-sky-400 animate-spin' : 'text-emerald-400'
                }`}
              />
              <span className="hidden sm:inline">
                {isCheckingHealth ? 'Probing...' : 'Probe Tunnels'}
              </span>
              {healthEntries.length > 0 && !isCheckingHealth && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {onlineCount} up{offlineCount > 0 ? ` / ${offlineCount} down` : ''}
                </span>
              )}
            </button>

            {/* View Mode Toggle: Universe Map vs Star Chart Grid */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => onViewModeChange('universe')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'universe'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Universe</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Star Chart</span>
              </button>
            </div>

            {/* Quick Add Star Service Button */}
            <button
              type="button"
              onClick={() => onOpenConfigModal('add')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 hover:text-white text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Star</span>
            </button>

            {/* Config / JSON Editor Button */}
            <button
              type="button"
              onClick={() => onOpenConfigModal('services')}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-purple-400/50 text-slate-200 text-xs font-medium transition-all"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Manage / Export JSON</span>
              {hasLocalChanges && (
                <span
                  title="You have unsaved browser edits ready to export to constellation.json"
                  className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                />
              )}
            </button>
          </div>
        </div>

        {/* Constellation & Tag Filter Bar */}
        <div className="pointer-events-auto mx-auto w-full max-w-7xl flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`shrink-0 px-3 py-1 rounded-full font-mono text-[11px] transition-all border ${
              selectedTag === null
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-slate-950/75 text-slate-400 border-slate-800/90 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            ✦ All Sectors
          </button>

          {allTags.map((tag) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
            const isConstellation = clusterTagSet.has(tag);
            const color = clusterColorMap[tag];

            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] transition-all border backdrop-blur-md ${
                  isSelected
                    ? 'bg-slate-900 text-white border-cyan-400/80 shadow-[0_0_14px_rgba(56,189,248,0.35)]'
                    : 'bg-slate-950/75 text-slate-300 border-slate-800/90 hover:border-slate-600 hover:text-white'
                }`}
              >
                {isConstellation && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: color || '#38bdf8',
                      boxShadow: `0 0 6px ${color || '#38bdf8'}`,
                    }}
                  />
                )}
                <span>{isConstellation ? tag : `#${tag}`}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Bottom-Right Floating Navigation Controls (Universe Mode) */}
      {viewMode === 'universe' && (
        <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2">
          {/* Drag-to-Reposition Toggle */}
          <button
            type="button"
            onClick={onToggleDragMode}
            title={
              isDragMode
                ? 'Lock star positions'
                : 'Unlock star positions to drag & arrange stars on the map'
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl border text-xs font-mono transition-all shadow-xl ${
              isDragMode
                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                : 'bg-slate-950/85 border-slate-800/90 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isDragMode ? 'Done Arranging' : 'Arrange Stars'}
            </span>
          </button>

          {/* Camera Zoom & Fit Controls */}
          <div className="flex items-center rounded-xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 p-1 shadow-2xl">
            <button
              type="button"
              onClick={onZoomOut}
              title="Zoom Out"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onResetView}
              title="Fit All Constellations / Reset Camera"
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:bg-slate-800/70 transition-colors flex items-center gap-1"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fit All</span>
            </button>
            <button
              type="button"
              onClick={onZoomIn}
              title="Zoom In"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
