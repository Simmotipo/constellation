import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ConstellationCluster,
  EndpointHealth,
  PositionedStar,
} from '../types/constellation';
import {
  generateAmbientStarfield,
  generateDeepSpaceNebulae,
} from '../utils/universeLayout';
import { StarNode } from './StarNode';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface UniverseCanvasProps {
  stars: PositionedStar[];
  clusters: ConstellationCluster[];
  selectedTag: string | null;
  searchQuery: string;
  highlightedStarId: string | null;
  openInNewTab: boolean;
  healthMap: Record<string, EndpointHealth>;
  camera: CameraState;
  onCameraChange: React.Dispatch<React.SetStateAction<CameraState>>;
  isDragMode: boolean;
  onUpdateStarPosition: (serviceId: string, x: number, y: number) => void;
  onEditStar: (serviceId: string) => void;
  onSelectTag: (tag: string | null) => void;
}

export const UniverseCanvas: React.FC<UniverseCanvasProps> = ({
  stars,
  clusters,
  selectedTag,
  searchQuery,
  highlightedStarId,
  openInNewTab,
  healthMap,
  camera,
  onCameraChange,
  isDragMode,
  onUpdateStarPosition,
  onEditStar,
  onSelectTag,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; camX: number; camY: number } | null>(
    null
  );
  const [draggingStar, setDraggingStar] = useState<{
    id: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const ambientStars = useMemo(() => generateAmbientStarfield(340), []);
  const deepNebulae = useMemo(() => generateDeepSpaceNebulae(), []);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const layer1Stars = useMemo(
    () => ambientStars.filter((s) => s.layer === 1),
    [ambientStars]
  );
  const layer2Stars = useMemo(
    () => ambientStars.filter((s) => s.layer === 2),
    [ambientStars]
  );
  const layer3Stars = useMemo(
    () => ambientStars.filter((s) => s.layer === 3),
    [ambientStars]
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewport({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      } else {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mouse Wheel Zoom (zooms toward cursor position)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    onCameraChange((prev) => {
      const nextZoom = Math.min(2.2, Math.max(0.32, prev.zoom * zoomFactor));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...prev, zoom: nextZoom };

      const cursorOffsetX = e.clientX - (rect.left + rect.width / 2);
      const cursorOffsetY = e.clientY - (rect.top + rect.height / 2);

      // Keep world point under cursor stationary
      const worldX = prev.x + cursorOffsetX / prev.zoom;
      const worldY = prev.y + cursorOffsetY / prev.zoom;

      const nextX = worldX - cursorOffsetX / nextZoom;
      const nextY = worldY - cursorOffsetY / nextZoom;

      return { x: nextX, y: nextY, zoom: nextZoom };
    });
  };

  // Start Canvas Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning && !draggingStar && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({
        rx: Number((-ny * 2.2).toFixed(2)),
        ry: Number((nx * 2.6).toFixed(2)),
      });
    }

    if (draggingStar) {
      const dx = (e.clientX - draggingStar.startClientX) / camera.zoom;
      const dy = (e.clientY - draggingStar.startClientY) / camera.zoom;
      onUpdateStarPosition(
        draggingStar.id,
        Math.round(draggingStar.origX + dx),
        Math.round(draggingStar.origY + dy)
      );
      return;
    }

    if (!isPanning || !panStartRef.current) return;
    const { clientX: startX, clientY: startY, camX, camY } = panStartRef.current;
    const dx = (e.clientX - startX) / camera.zoom;
    const dy = (e.clientY - startY) / camera.zoom;
    const nextX = camX - dx;
    const nextY = camY - dy;
    onCameraChange((prev) => ({
      ...prev,
      x: nextX,
      y: nextY,
    }));
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
    setDraggingStar(null);
  };

  // Touch Pan Support
  const touchStartRef = useRef<{ x: number; y: number; camX: number; camY: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        camX: camera.x,
        camY: camera.y,
      };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      const { x: startX, y: startY, camX, camY } = touchStartRef.current;
      const dx = (e.touches[0].clientX - startX) / camera.zoom;
      const dy = (e.touches[0].clientY - startY) / camera.zoom;
      const nextX = camX - dx;
      const nextY = camY - dy;
      onCameraChange((prev) => ({
        ...prev,
        x: nextX,
        y: nextY,
      }));
    }
  };
  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleStartDragStar = (serviceId: string, e: React.MouseEvent) => {
    const target = stars.find((s) => s.service.id === serviceId);
    if (!target) return;
    setDraggingStar({
      id: serviceId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: target.x,
      origY: target.y,
    });
  };

  // Determine which stars match active tag and search query
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isStarMatching = (star: PositionedStar) => {
    const matchesTag =
      !selectedTag ||
      star.service.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    if (!matchesTag) return false;
    if (!normalizedQuery) return true;
    const hay = `${star.service.name} ${star.service.starName} ${star.service.starSlug} ${star.service.tags.join(' ')} ${star.service.description || ''}`.toLowerCase();
    return hay.includes(normalizedQuery);
  };

  const clusterColorMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of clusters) {
      m[c.tag] = c.color;
    }
    return m;
  }, [clusters]);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative w-full h-screen overflow-hidden select-none ${
        draggingStar ? 'cursor-grabbing' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        perspective: '1400px',
        background:
          'radial-gradient(ellipse at 50% 42%, #0c1433 0%, #050816 52%, #010206 100%)',
      }}
    >
      {/* HDR Deep-Space Atmospheric & Milky Way Backlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(56, 189, 248, 0.16) 0%, transparent 45%), radial-gradient(circle at 82% 72%, rgba(192, 132, 252, 0.16) 0%, transparent 48%), radial-gradient(circle at 52% 18%, rgba(251, 191, 36, 0.08) 0%, transparent 42%), radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 65%)',
        }}
      />

      {/* Far Deep-Field Parallax Layer 1 (0.08x) — Distant Pinpricks & Deep Nebulae */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          transform: `translate3d(${-camera.x * 0.08}px, ${-camera.y * 0.08}px, 0) scale(${
            0.88 + camera.zoom * 0.12
          })`,
        }}
      >
        {deepNebulae
          .filter((n) => n.layer === 1)
          .map((n) => (
            <div
              key={`neb-1-${n.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl mix-blend-screen"
              style={{
                left: n.x,
                top: n.y,
                width: n.width,
                height: n.height,
                opacity: n.opacity,
                transform: `translate(-50%, -50%) rotate(${n.rotation}deg)`,
                background: `radial-gradient(ellipse at 40% 45%, ${n.primaryColor} 0%, ${n.secondaryColor} 45%, transparent 74%)`,
              }}
            />
          ))}

        {layer1Stars.map((bg) => (
          <div
            key={bg.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: bg.x,
              top: bg.y,
              width: bg.size,
              height: bg.size,
              backgroundColor: bg.tint,
              opacity: bg.opacity,
              animationDuration: `${bg.twinkleDuration}s`,
              animationDelay: `${bg.twinkleDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Mid-Space Parallax Layer 2 (0.22x) — Ionized Nebulae & Medium Stars */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          transform: `translate3d(${-camera.x * 0.22}px, ${-camera.y * 0.22}px, 0) scale(${
            0.85 + camera.zoom * 0.15
          })`,
        }}
      >
        {deepNebulae
          .filter((n) => n.layer === 2)
          .map((n) => (
            <div
              key={`neb-2-${n.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl mix-blend-screen"
              style={{
                left: n.x,
                top: n.y,
                width: n.width,
                height: n.height,
                opacity: n.opacity,
                transform: `translate(-50%, -50%) rotate(${n.rotation}deg)`,
                background: `radial-gradient(ellipse at 55% 45%, ${n.primaryColor} 0%, ${n.secondaryColor} 48%, transparent 75%)`,
              }}
            />
          ))}

        {layer2Stars.map((bg) => (
          <div
            key={bg.id}
            className="absolute rounded-full animate-pulse"
            style={{
              left: bg.x,
              top: bg.y,
              width: bg.size,
              height: bg.size,
              backgroundColor: bg.tint,
              opacity: bg.opacity,
              animationDuration: `${bg.twinkleDuration}s`,
              animationDelay: `${bg.twinkleDelay}s`,
              boxShadow: `0 0 4px ${bg.tint}`,
            }}
          />
        ))}
      </div>

      {/* Near-Field Foreground Parallax Layer 3 (0.45x) — HDR Flare Stars */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          transform: `translate3d(${-camera.x * 0.45}px, ${-camera.y * 0.45}px, 0) scale(${
            0.82 + camera.zoom * 0.22
          })`,
        }}
      >
        {layer3Stars.map((bg) => (
          <div
            key={bg.id}
            className="absolute flex items-center justify-center animate-pulse"
            style={{
              left: bg.x,
              top: bg.y,
              width: bg.size,
              height: bg.size,
              opacity: bg.opacity,
              animationDuration: `${bg.twinkleDuration}s`,
              animationDelay: `${bg.twinkleDelay}s`,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: bg.tint,
                boxShadow: `0 0 8px 1px ${bg.tint}`,
              }}
            />
            {bg.hasFlare && (
              <>
                <div
                  className="absolute w-7 h-[1px] opacity-65"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${bg.tint}, transparent)`,
                  }}
                />
                <div
                  className="absolute h-7 w-[1px] opacity-65"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${bg.tint}, transparent)`,
                  }}
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Main 3D-Tilted World Coordinate Plane */}
      <div
        className="absolute left-1/2 top-1/2 origin-center will-change-transform transition-transform duration-150 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${camera.zoom}) translate3d(${-camera.x}px, ${-camera.y}px, 0)`,
        }}
      >
        {/* SVG Astronomical Grid, HDR Nebulae, and Constellation Connecting Lines */}
        <svg
          width="4800"
          height="3600"
          viewBox="-2400 -1800 4800 3600"
          className="pointer-events-none absolute -left-[2400px] -top-[1800px] overflow-visible"
        >
          <defs>
            {clusters.map((cluster, idx) => (
              <radialGradient key={cluster.tag} id={`nebula-grad-${idx}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={cluster.color} stopOpacity="0.28" />
                <stop offset="35%" stopColor={cluster.color} stopOpacity="0.14" />
                <stop offset="70%" stopColor={cluster.color} stopOpacity="0.04" />
                <stop offset="100%" stopColor={cluster.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <radialGradient id="galacticCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="22%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="55%" stopColor="#818cf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Galactic Core Anchor at (0,0) */}
          <circle cx={0} cy={0} r={140} fill="url(#galacticCoreGrad)" />
          <circle
            cx={0}
            cy={0}
            r={18}
            fill="none"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth={1.2}
          />
          <circle cx={0} cy={0} r={3.5} fill="#e0f2fe" />

          {/* 3D-Perspective Elliptical Orbital Rings & Polar Coordinate Grid */}
          {[360, 720, 1080, 1440].map((r, i) => (
            <g key={r}>
              <circle
                cx={0}
                cy={0}
                r={r}
                fill="none"
                stroke="rgba(148, 163, 184, 0.08)"
                strokeWidth={1}
                strokeDasharray="6 10"
              />
              <ellipse
                cx={0}
                cy={0}
                rx={r * 1.15}
                ry={r * 0.42}
                transform={`rotate(${i % 2 === 0 ? -14 : 11} 0 0)`}
                fill="none"
                stroke="rgba(56, 189, 248, 0.05)"
                strokeWidth={1}
              />
            </g>
          ))}
          <line
            x1={-2000}
            y1={0}
            x2={2000}
            y2={0}
            stroke="rgba(148, 163, 184, 0.06)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={-1500}
            x2={0}
            y2={1500}
            stroke="rgba(148, 163, 184, 0.06)"
            strokeWidth={1}
          />

          {/* Constellation Clusters: HDR Nebulae, Sector Boundaries & Connecting Lines */}
          {clusters.map((cluster, idx) => {
            const isClusterActive =
              !selectedTag ||
              cluster.tag.toLowerCase() === selectedTag.toLowerCase() ||
              cluster.stars.some((s) =>
                s.service.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
              );

            return (
              <g
                key={cluster.tag}
                style={{
                  opacity: isClusterActive ? 1 : 0.16,
                  transition: 'opacity 300ms ease',
                }}
              >
                {/* Volumetric HDR Nebula Glow */}
                <circle
                  cx={cluster.centerX}
                  cy={cluster.centerY}
                  r={cluster.radius * 1.45}
                  fill={`url(#nebula-grad-${idx})`}
                />

                {/* Outer 3D Inclined Sector Halo */}
                <ellipse
                  cx={cluster.centerX}
                  cy={cluster.centerY}
                  rx={cluster.radius * 1.06}
                  ry={cluster.radius * 0.86}
                  transform={`rotate(-12 ${cluster.centerX} ${cluster.centerY})`}
                  fill="none"
                  stroke={cluster.color}
                  strokeOpacity={0.14}
                  strokeWidth={1}
                />

                {/* Constellation Sector Ring */}
                <circle
                  cx={cluster.centerX}
                  cy={cluster.centerY}
                  r={cluster.radius}
                  fill="none"
                  stroke={cluster.color}
                  strokeOpacity={0.24}
                  strokeWidth={1.3}
                  strokeDasharray="4 8"
                />

                {/* HDR Luminous Constellation Connecting Lines */}
                {cluster.edges.map((edge, edgeIdx) => (
                  <g key={edgeIdx}>
                    {/* Wide HDR bloom */}
                    <line
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      stroke={cluster.color}
                      strokeOpacity={0.14}
                      strokeWidth={10}
                      strokeLinecap="round"
                    />
                    {/* Mid glow line */}
                    <line
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      stroke={cluster.color}
                      strokeOpacity={0.35}
                      strokeWidth={3.2}
                      strokeLinecap="round"
                    />
                    {/* Crisp incandescent core filament */}
                    <line
                      x1={edge.from.x}
                      y1={edge.from.y}
                      x2={edge.to.x}
                      y2={edge.to.y}
                      stroke="#ffffff"
                      strokeOpacity={0.55}
                      strokeWidth={1.1}
                      strokeDasharray="6 5"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            );
          })}
        </svg>

        {/* Constellation Sector Titles */}
        {clusters.map((cluster) => {
          const isClusterActive =
            !selectedTag ||
            cluster.tag.toLowerCase() === selectedTag.toLowerCase() ||
            cluster.stars.some((s) =>
              s.service.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
            );

          return (
            <button
              key={`label-${cluster.tag}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(selectedTag === cluster.tag ? null : cluster.tag);
              }}
              style={{
                left: `${cluster.centerX}px`,
                top: `${cluster.centerY - cluster.radius + 18}px`,
                borderColor: `${cluster.color}40`,
                color: cluster.color,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border font-mono text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg ${
                isClusterActive ? 'opacity-90' : 'opacity-20'
              }`}
            >
              ✦ {cluster.tag} ({cluster.stars.length})
            </button>
          );
        })}

        {/* Interactive Star Nodes */}
        {stars.map((star) => {
          const matched = isStarMatching(star);
          return (
            <StarNode
              key={star.service.id}
              star={star}
              clusterColor={clusterColorMap[star.constellationTag] || '#38bdf8'}
              isDimmed={!matched}
              isHighlighted={highlightedStarId === star.service.id}
              openInNewTab={openInNewTab}
              healthMap={healthMap}
              isDragMode={isDragMode}
              onEditStar={onEditStar}
              onStartDragStar={handleStartDragStar}
            />
          );
        })}
      </div>

      {/* Bottom-Left Tactical Sector Radar / Mini-Map */}
      <div className="hidden md:flex flex-col gap-1.5 fixed bottom-5 left-5 z-30 bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
            Sector Radar
          </span>
          <span className="font-mono text-[10px] text-cyan-400">
            {Math.round(camera.zoom * 100)}%
          </span>
        </div>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;
            onCameraChange((prev) => ({
              ...prev,
              x: relX * 2200,
              y: relY * 1400,
            }));
          }}
          title="Click radar to jump camera"
          className="relative w-44 h-28 rounded-xl bg-[#040711] border border-slate-800/80 overflow-hidden cursor-crosshair"
        >
          {/* Mini-map constellation dots */}
          {stars.map((s) => {
            const leftPct = ((s.x + 1100) / 2200) * 100;
            const topPct = ((s.y + 700) / 1400) * 100;
            const color = clusterColorMap[s.constellationTag] || '#38bdf8';
            return (
              <div
                key={s.service.id}
                style={{
                  left: `${Math.min(96, Math.max(4, leftPct))}%`,
                  top: `${Math.min(94, Math.max(6, topPct))}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
                className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
              />
            );
          })}

          {/* Viewport Indicator Box */}
          <div
            style={{
              left: `${50 + (camera.x / 2200) * 100}%`,
              top: `${50 + (camera.y / 1400) * 100}%`,
              width: `${Math.min(100, (viewport.width / camera.zoom / 2200) * 100)}%`,
              height: `${Math.min(100, (viewport.height / camera.zoom / 1400) * 100)}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 border border-cyan-400/70 bg-cyan-400/10 rounded-sm pointer-events-none"
          />
        </div>
        <div className="flex items-center justify-between px-1 font-mono text-[9px] text-slate-500">
          <span>X: {Math.round(camera.x)}</span>
          <span>Y: {Math.round(camera.y)}</span>
        </div>
      </div>
    </div>
  );
};
