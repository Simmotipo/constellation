import React, { useState } from 'react';
import { ExternalLink, Edit3, ShieldCheck, Move } from 'lucide-react';
import { EndpointHealth, PositionedStar } from '../types/constellation';
import { AstralBodyGraphic, ASTRAL_TYPE_META } from './AstralBodyGraphic';

interface StarNodeProps {
  star: PositionedStar;
  clusterColor: string;
  isDimmed: boolean;
  isHighlighted: boolean;
  openInNewTab: boolean;
  healthMap: Record<string, EndpointHealth>;
  isDragMode: boolean;
  onEditStar: (serviceId: string) => void;
  onStartDragStar?: (serviceId: string, e: React.MouseEvent) => void;
}

function getHealthDotClass(health?: EndpointHealth): string {
  if (!health || health.status === 'unknown') {
    return 'bg-slate-400/50 border-slate-300/40';
  }
  if (health.status === 'checking') {
    return 'bg-sky-400 animate-ping';
  }
  if (health.status === 'online') {
    return 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
  }
  if (health.status === 'degraded') {
    return 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';
  }
  return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
}

function getHealthTooltip(health?: EndpointHealth): string {
  if (!health || health.status === 'unknown') return 'Health check not run yet';
  if (health.status === 'checking') return 'Probing endpoint...';
  if (health.status === 'online') {
    const accessNote = health.protectedByAccess ? ' • Cloudflare Access Protected' : '';
    const ms = health.latencyMs ? ` (${health.latencyMs}ms)` : '';
    return `Online${ms}${accessNote}`;
  }
  if (health.status === 'degraded') {
    return `Degraded (HTTP ${health.code || '?'})`;
  }
  return `Offline (${health.note || `HTTP ${health.code || 'Unreachable'}`})`;
}

export const StarNode: React.FC<StarNodeProps> = ({
  star,
  clusterColor,
  isDimmed,
  isHighlighted,
  openInNewTab,
  healthMap,
  isDragMode,
  onEditStar,
  onStartDragStar,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { service, urls } = star;
  const meta = ASTRAL_TYPE_META[service.astralType] || ASTRAL_TYPE_META['blue-giant'];

  const primaryHealth = healthMap[urls.primaryUrl];
  const secondaryHealth = urls.secondaryUrl ? healthMap[urls.secondaryUrl] : undefined;

  const targetAttr = openInNewTab ? '_blank' : '_self';
  const relAttr = openInNewTab ? 'noopener noreferrer' : undefined;

  const showExpanded = isHovered || isHighlighted;

  return (
    <div
      style={{
        transform: `translate3d(${star.x}px, ${star.y}px, 0)`,
        zIndex: showExpanded ? 60 : isDimmed ? 10 : 30,
      }}
      className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 select-none transition-opacity duration-300 ${
        isDimmed ? 'opacity-25 pointer-events-none' : 'opacity-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        if (isDragMode && onStartDragStar) {
          e.stopPropagation();
          onStartDragStar(service.id, e);
        }
      }}
    >
      {/* Highlight beacon ring when selected via search */}
      {isHighlighted && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border-2 border-cyan-400/80 animate-ping pointer-events-none"
          style={{ animationDuration: '2s' }}
        />
      )}

      {/* Binary Companion Orbit Track & Secondary (-b) Companion Star */}
      {service.hasSecondary && urls.secondaryUrl && (
        <>
          {/* 3D-Inclined Orbit Ellipse */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-20 rounded-full border border-dashed pointer-events-none transition-all duration-300"
            style={{
              borderColor: showExpanded ? 'rgba(251, 191, 36, 0.65)' : 'rgba(148, 163, 184, 0.28)',
              boxShadow: showExpanded
                ? '0 0 18px rgba(251, 191, 36, 0.2), inset 0 0 12px rgba(251, 191, 36, 0.12)'
                : undefined,
              transform: 'translate(-50%, -50%) rotate(-18deg) rotateX(48deg)',
            }}
          />

          {/* Clickable Orbiting Companion Star (-b) */}
          <a
            href={isDragMode ? undefined : urls.secondaryUrl}
            target={targetAttr}
            rel={relAttr}
            onClick={(e) => {
              e.stopPropagation();
              if (isDragMode) e.preventDefault();
            }}
            title={`Launch Secondary (-b): ${urls.secondaryUrl}\n${getHealthTooltip(secondaryHealth)}`}
            className="group/sec absolute left-[calc(50%+48px)] top-[calc(50%-28px)] -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/50 hover:border-amber-300 hover:bg-amber-950/80 hover:scale-110 transition-all shadow-[0_0_15px_rgba(251,191,36,0.35)] cursor-pointer z-20"
          >
            {/* Companion mini star core */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br from-white via-amber-300 to-amber-500 shadow-[0_0_8px_#fbbf24]" />
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-wider text-amber-200 group-hover/sec:text-white">
              {service.starSlug}-b
            </span>
            {secondaryHealth && secondaryHealth.status !== 'unknown' && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${getHealthDotClass(secondaryHealth)}`}
              />
            )}
          </a>
        </>
      )}

      {/* Main Primary Star (-a) Click Target */}
      <div className="relative flex flex-col items-center">
        <a
          href={isDragMode ? undefined : urls.primaryUrl}
          target={targetAttr}
          rel={relAttr}
          onClick={(e) => {
            e.stopPropagation();
            if (isDragMode) e.preventDefault();
          }}
          title={
            isDragMode
              ? `Drag to reposition ${service.name}`
              : `Launch Primary (-a): ${urls.primaryUrl}\n${getHealthTooltip(primaryHealth)}`
          }
          className={`relative flex items-center justify-center rounded-full p-2 transition-transform ${
            isDragMode ? 'cursor-move' : 'cursor-pointer'
          }`}
        >
          <AstralBodyGraphic
            type={service.astralType}
            size="lg"
            isHovered={showExpanded}
          />
          {isDragMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 rounded-full border border-cyan-400/60">
              <Move className="w-5 h-5 text-cyan-300" />
            </div>
          )}
        </a>

        {/* Always-Visible Clearly Marked Star Telemetry Label & Launch Buttons */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`mt-1.5 flex flex-col items-center transition-all duration-200 ${
            showExpanded ? 'w-72' : 'w-auto min-w-[165px]'
          }`}
        >
          <div
            className={`w-full rounded-xl backdrop-blur-xl transition-all duration-200 ${
              showExpanded
                ? 'bg-slate-950/95 border border-slate-500/80 p-3'
                : 'bg-slate-950/80 border border-slate-800/90 hover:border-slate-600/90 px-3 py-1.5'
            }`}
            style={{
              borderColor: showExpanded ? meta.accent : undefined,
              boxShadow: showExpanded
                ? `0 16px 48px rgba(0,0,0,0.9), 0 0 28px ${meta.accent}35, inset 0 1px 0 rgba(255,255,255,0.22)`
                : `0 6px 24px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {/* Header Row: Service Name & Star Code */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: clusterColor, boxShadow: `0 0 8px ${clusterColor}` }}
                  />
                  <span className="font-display font-semibold text-xs sm:text-[13px] text-slate-100 truncate">
                    {service.name}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 tracking-wider uppercase truncate mt-0.5">
                  ★ {service.starName}
                </div>
              </div>

              {showExpanded && (
                <button
                  type="button"
                  onClick={() => onEditStar(service.id)}
                  title="Edit star configuration"
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Direct Launch Buttons Row: Primary (-a) and Secondary (-b) */}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {/* Primary (-a) Button */}
              <a
                href={urls.primaryUrl}
                target={targetAttr}
                rel={relAttr}
                title={`Launch Primary: ${urls.primaryUrl}\n${getHealthTooltip(primaryHealth)}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono text-[11px] font-medium transition-all group/btn"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${getHealthDotClass(primaryHealth)}`}
                />
                <span className="truncate">{service.starSlug}-a</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100 shrink-0" />
              </a>

              {/* Secondary (-b) Button */}
              {service.hasSecondary && urls.secondaryUrl && (
                <a
                  href={urls.secondaryUrl}
                  target={targetAttr}
                  rel={relAttr}
                  title={`Launch Secondary: ${urls.secondaryUrl}\n${getHealthTooltip(secondaryHealth)}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/40 hover:border-amber-300 text-amber-200 hover:text-white font-mono text-[11px] font-medium transition-all group/btn"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${getHealthDotClass(secondaryHealth)}`}
                  />
                  <span className="truncate">{service.starSlug}-b</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                </a>
              )}
            </div>

            {/* Expanded Details on Hover/Selection */}
            {showExpanded && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-800/90 text-left space-y-2 animate-fadeIn">
                {service.description && (
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {service.description}
                  </p>
                )}

                {/* Full Endpoint Hostnames */}
                <div className="space-y-1 bg-slate-900/80 rounded-lg p-2 border border-slate-800/80 font-mono text-[10px]">
                  <div className="flex items-center justify-between gap-2 text-cyan-300">
                    <span className="text-slate-400">
                      {service.primaryLabel || 'Primary (-a)'}:
                    </span>
                    <span className="truncate">{urls.primaryHost}</span>
                  </div>
                  {service.hasSecondary && urls.secondaryHost && (
                    <div className="flex items-center justify-between gap-2 text-amber-300">
                      <span className="text-slate-400">
                        {service.secondaryLabel || 'Secondary (-b)'}:
                      </span>
                      <span className="truncate">{urls.secondaryHost}</span>
                    </div>
                  )}
                  {(primaryHealth?.protectedByAccess || secondaryHealth?.protectedByAccess) && (
                    <div className="flex items-center gap-1 text-emerald-300 pt-1 border-t border-slate-800">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>Cloudflare Access Tunnel Active</span>
                    </div>
                  )}
                </div>

                {/* Tags & Astral Class */}
                <div className="flex flex-wrap items-center gap-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${meta.badgeBg}`}
                  >
                    {meta.label}
                  </span>
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/70 text-[9px] font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
