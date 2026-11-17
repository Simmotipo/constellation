import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, ExternalLink, Search, X } from 'lucide-react';
import { EndpointHealth, PositionedStar } from '../types/constellation';
import { AstralBodyGraphic } from './AstralBodyGraphic';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  stars: PositionedStar[];
  openInNewTab: boolean;
  healthMap: Record<string, EndpointHealth>;
  onFocusStarOnMap: (star: PositionedStar) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  stars,
  openInNewTab,
  healthMap,
  onFocusStarOnMap,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const filteredStars = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stars;
    return stars.filter((s) => {
      const hay = `${s.service.name} ${s.service.starName} ${s.service.starSlug} ${s.service.tags.join(' ')} ${s.service.description || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stars, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const launchUrl = (url: string) => {
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredStars.length));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev - 1 < 0 ? Math.max(0, filteredStars.length - 1) : prev - 1
      );
      return;
    }
    if (e.key === 'Enter' && filteredStars[activeIndex]) {
      e.preventDefault();
      const chosen = filteredStars[activeIndex];
      if (e.shiftKey && chosen.service.hasSecondary && chosen.urls.secondaryUrl) {
        launchUrl(chosen.urls.secondaryUrl);
      } else {
        launchUrl(chosen.urls.primaryUrl);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#070b18]/95 border border-slate-700/80 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by star (draconis, orionis, centauri), service name, or #tag..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/60 p-2">
          {filteredStars.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching stars or cloud services found in Constellation.
            </div>
          ) : (
            filteredStars.map((star, idx) => {
              const { service, urls } = star;
              const isSelected = idx === activeIndex;
              const pHealth = healthMap[urls.primaryUrl];
              const sHealth = urls.secondaryUrl ? healthMap[urls.secondaryUrl] : undefined;

              return (
                <div
                  key={service.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 rounded-xl transition-colors ${
                    isSelected ? 'bg-slate-800/80 border border-cyan-500/40' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <AstralBodyGraphic type={service.astralType} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm text-white truncate">
                          {service.name}
                        </span>
                        <span className="font-mono text-[11px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                          ★ {service.starName}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {service.tags.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Locate on Star Map */}
                    <button
                      type="button"
                      onClick={() => {
                        onFocusStarOnMap(star);
                        onClose();
                      }}
                      title="Center camera on this star system"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-[11px] transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden md:inline">Locate</span>
                    </button>

                    {/* Primary (-a) Launch */}
                    <button
                      type="button"
                      onClick={() => launchUrl(urls.primaryUrl)}
                      title={`Launch Primary: ${urls.primaryUrl}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 hover:text-white border border-cyan-400/50 font-mono text-xs transition-all"
                    >
                      {pHealth && pHealth.status !== 'unknown' && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            pHealth.status === 'online'
                              ? 'bg-emerald-400'
                              : pHealth.status === 'degraded'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`}
                        />
                      )}
                      <span>{service.starSlug}-a</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {/* Secondary (-b) Launch */}
                    {service.hasSecondary && urls.secondaryUrl && (
                      <button
                        type="button"
                        onClick={() => launchUrl(urls.secondaryUrl!)}
                        title={`Launch Secondary: ${urls.secondaryUrl}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/50 font-mono text-xs transition-all"
                      >
                        {sHealth && sHealth.status !== 'unknown' && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sHealth.status === 'online'
                                ? 'bg-emerald-400'
                                : sHealth.status === 'degraded'
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                        )}
                        <span>{service.starSlug}-b</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <strong className="text-slate-200">↵ Enter</strong> Launch Primary (-a)
            </span>
            <span>
              <strong className="text-slate-200">⇧ + ↵</strong> Launch Secondary (-b)
            </span>
          </div>
          <span>
            <strong className="text-slate-200">ESC</strong> Close
          </span>
        </div>
      </div>
    </div>
  );
};
