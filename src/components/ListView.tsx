import React from 'react';
import { Compass, Edit3, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  ConstellationCluster,
  EndpointHealth,
  PositionedStar,
} from '../types/constellation';
import { AstralBodyGraphic, ASTRAL_TYPE_META } from './AstralBodyGraphic';

interface ListViewProps {
  clusters: ConstellationCluster[];
  selectedTag: string | null;
  searchQuery: string;
  openInNewTab: boolean;
  healthMap: Record<string, EndpointHealth>;
  onEditStar: (serviceId: string) => void;
  onLocateStarOnMap: (star: PositionedStar) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  clusters,
  selectedTag,
  searchQuery,
  openInNewTab,
  healthMap,
  onEditStar,
  onLocateStarOnMap,
}) => {
  const targetAttr = openInNewTab ? '_blank' : '_self';
  const relAttr = openInNewTab ? 'noopener noreferrer' : undefined;
  const q = searchQuery.trim().toLowerCase();

  const matchesFilter = (star: PositionedStar) => {
    const tagMatch =
      !selectedTag ||
      star.service.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    if (!tagMatch) return false;
    if (!q) return true;
    const hay = `${star.service.name} ${star.service.starName} ${star.service.starSlug} ${star.service.tags.join(' ')} ${star.service.description || ''}`.toLowerCase();
    return hay.includes(q);
  };

  return (
    <div
      className="w-full h-screen overflow-y-auto pt-36 pb-16 px-4 sm:px-8"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #0c1636 0%, #050814 55%, #020308 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        {clusters.map((cluster) => {
          const visibleStars = cluster.stars.filter(matchesFilter);
          if (visibleStars.length === 0) return null;

          return (
            <section key={cluster.tag} className="space-y-4">
              {/* Constellation Header */}
              <div className="flex items-center justify-between border-b border-slate-800/90 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: cluster.color,
                      boxShadow: `0 0 12px ${cluster.color}`,
                    }}
                  />
                  <h2 className="font-display font-bold text-sm sm:text-base uppercase tracking-[0.2em] text-white">
                    Constellation // {cluster.tag}
                  </h2>
                  <span className="font-mono text-xs text-slate-400">
                    ({visibleStars.length} {visibleStars.length === 1 ? 'Star' : 'Stars'})
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleStars.map((star) => {
                  const { service, urls } = star;
                  const meta =
                    ASTRAL_TYPE_META[service.astralType] || ASTRAL_TYPE_META['blue-giant'];
                  const pHealth = healthMap[urls.primaryUrl];
                  const sHealth = urls.secondaryUrl ? healthMap[urls.secondaryUrl] : undefined;

                  return (
                    <div
                      key={service.id}
                      className="group relative flex flex-col justify-between rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 hover:border-slate-600/90 p-5 shadow-xl transition-all"
                    >
                      <div>
                        {/* Top row: Astral Graphic + Service Title + Actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="shrink-0 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                              <AstralBodyGraphic type={service.astralType} size="md" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-display font-semibold text-base text-white truncate">
                                {service.name}
                              </h3>
                              <p className="font-mono text-xs text-cyan-300/90 truncate mt-0.5">
                                ★ {service.starName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onLocateStarOnMap(star)}
                              title="View on Universe Map"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors"
                            >
                              <Compass className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditStar(service.id)}
                              title="Edit star service"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800/80 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {service.description && (
                          <p className="mt-3 text-xs text-slate-300/90 leading-relaxed">
                            {service.description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${meta.badgeBg}`}
                          >
                            {meta.label}
                          </span>
                          {service.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Primary (-a) & Secondary (-b) Launch Buttons */}
                      <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Primary (-a) */}
                          <a
                            href={urls.primaryUrl}
                            target={targetAttr}
                            rel={relAttr}
                            className="flex flex-col justify-between p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/35 hover:border-cyan-400 transition-all group/a"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                                {service.primaryLabel || 'Primary (-a)'}
                              </span>
                              <div className="flex items-center gap-1">
                                {pHealth && pHealth.status !== 'unknown' && (
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      pHealth.status === 'online'
                                        ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                                        : pHealth.status === 'degraded'
                                        ? 'bg-amber-400'
                                        : 'bg-rose-500'
                                    }`}
                                  />
                                )}
                                <ExternalLink className="w-3 h-3 text-cyan-300 opacity-70 group-hover/a:opacity-100" />
                              </div>
                            </div>
                            <div className="font-mono text-xs text-white truncate mt-1">
                              {urls.primaryHost}
                            </div>
                          </a>

                          {/* Secondary (-b) */}
                          {service.hasSecondary && urls.secondaryUrl ? (
                            <a
                              href={urls.secondaryUrl}
                              target={targetAttr}
                              rel={relAttr}
                              className="flex flex-col justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 hover:border-amber-400 transition-all group/b"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                                  {service.secondaryLabel || 'Secondary (-b)'}
                                </span>
                                <div className="flex items-center gap-1">
                                  {sHealth && sHealth.status !== 'unknown' && (
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        sHealth.status === 'online'
                                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                                          : sHealth.status === 'degraded'
                                          ? 'bg-amber-400'
                                          : 'bg-rose-500'
                                      }`}
                                    />
                                  )}
                                  <ExternalLink className="w-3 h-3 text-amber-300 opacity-70 group-hover/b:opacity-100" />
                                </div>
                              </div>
                              <div className="font-mono text-xs text-white truncate mt-1">
                                {urls.secondaryHost}
                              </div>
                            </a>
                          ) : (
                            <div className="flex flex-col justify-center items-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-600 font-mono text-[11px]">
                              Single-Star System (No -b)
                            </div>
                          )}
                        </div>

                        {(pHealth?.protectedByAccess || sHealth?.protectedByAccess) && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Protected by Cloudflare Access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
