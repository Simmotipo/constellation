import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit3,
  Globe,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  AstralType,
  ConstellationConfig,
  StarService,
} from '../types/constellation';
import { resolveServiceUrls } from '../utils/urlResolver';
import { AstralBodyGraphic, ASTRAL_TYPE_META } from './AstralBodyGraphic';

interface ConfigModalProps {
  isOpen: boolean;
  initialTab: 'services' | 'add' | 'json';
  editingServiceId: string | null;
  config: ConstellationConfig;
  hasLocalChanges: boolean;
  onUpdateConfig: (nextConfig: ConstellationConfig) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

const ASTRAL_TYPES: AstralType[] = [
  'blue-giant',
  'golden-star',
  'red-dwarf',
  'ringed-planet',
  'pulsar',
  'nebula-core',
];

const EMPTY_SERVICE: StarService = {
  id: '',
  name: '',
  starName: '',
  starSlug: '',
  tags: ['Core Systems'],
  description: '',
  astralType: 'blue-giant',
  hasSecondary: true,
  primaryLabel: 'Primary (-a)',
  secondaryLabel: 'Secondary (-b)',
  primaryUrl: '',
  secondaryUrl: '',
};

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  initialTab,
  editingServiceId,
  config,
  hasLocalChanges,
  onUpdateConfig,
  onResetToDefault,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'add' | 'json'>(initialTab);
  const [draftService, setDraftService] = useState<StarService>(EMPTY_SERVICE);
  const [tagsInput, setTagsInput] = useState('Core Systems');
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync tab and editing service when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (editingServiceId) {
      const found = config.services.find((s) => s.id === editingServiceId);
      if (found) {
        setDraftService({ ...found });
        setTagsInput(found.tags.join(', '));
        setIsEditingExisting(true);
        setActiveTab('add');
        return;
      }
    }
    setActiveTab(initialTab);
    if (initialTab === 'add') {
      setDraftService({ ...EMPTY_SERVICE });
      setTagsInput('Core Systems');
      setIsEditingExisting(false);
    }
  }, [isOpen, initialTab, editingServiceId, config.services]);

  useEffect(() => {
    setRawJson(JSON.stringify(config, null, 2));
    setJsonError(null);
  }, [config, activeTab]);

  if (!isOpen) return null;

  const existingTags = Array.from(
    new Set(config.services.flatMap((s) => s.tags.map((t) => t.trim())).filter(Boolean))
  );

  const previewUrls = resolveServiceUrls(
    {
      ...draftService,
      starSlug: draftService.starSlug || 'starname',
    },
    config
  );

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = (draftService.starSlug || draftService.name || 'star')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalService: StarService = {
      ...draftService,
      id: isEditingExisting && draftService.id ? draftService.id : `${cleanSlug}-${Date.now().toString(36)}`,
      name: draftService.name.trim() || cleanSlug.toUpperCase(),
      starName: draftService.starName.trim() || `Alpha ${cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1)}`,
      starSlug: cleanSlug,
      tags: parsedTags.length > 0 ? parsedTags : ['Uncharted Sector'],
      description: draftService.description?.trim() || undefined,
      primaryLabel: draftService.primaryLabel?.trim() || 'Primary (-a)',
      secondaryLabel: draftService.secondaryLabel?.trim() || 'Secondary (-b)',
      primaryUrl: draftService.primaryUrl?.trim() || undefined,
      secondaryUrl: draftService.secondaryUrl?.trim() || undefined,
    };

    const nextServices = isEditingExisting
      ? config.services.map((s) => (s.id === draftService.id ? finalService : s))
      : [...config.services, finalService];

    onUpdateConfig({
      ...config,
      services: nextServices,
    });

    setActiveTab('services');
    setIsEditingExisting(false);
  };

  const handleDeleteService = (id: string) => {
    onUpdateConfig({
      ...config,
      services: config.services.filter((s) => s.id !== id),
    });
  };

  const handleStartEdit = (svc: StarService) => {
    setDraftService({ ...svc });
    setTagsInput(svc.tags.join(', '));
    setIsEditingExisting(true);
    setActiveTab('add');
  };

  const handleStartAddNew = () => {
    setDraftService({ ...EMPTY_SERVICE });
    setTagsInput(existingTags[0] || 'Core Systems');
    setIsEditingExisting(false);
    setActiveTab('add');
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'constellation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJson) as ConstellationConfig;
      if (!parsed || !Array.isArray(parsed.services)) {
        setJsonError('JSON must contain a top-level "services" array.');
        return;
      }
      onUpdateConfig(parsed);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err?.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#070b18] border border-slate-700/90 shadow-[0_24px_90px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-white">
                Constellation Configuration & Star Registry
              </h2>
              <p className="text-xs text-slate-400">
                Manage stars, tags, and primary (-a) / secondary (-b) tunnel endpoints. Export JSON to commit to{' '}
                <code className="text-cyan-300 font-mono">src/config/constellation.json</code>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2.5 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Star Registry ({config.services.length})
            </button>
            <button
              type="button"
              onClick={handleStartAddNew}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'add'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEditingExisting ? 'Edit Star System' : 'Add Star System'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === 'json'
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              constellation.json
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasLocalChanges && (
              <button
                type="button"
                onClick={onResetToDefault}
                title="Discard browser edits and reload src/config/constellation.json"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Repo Default</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-mono transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download JSON</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SERVICES & GLOBAL DOMAIN SETTINGS */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Global Base Domain Card */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 font-display font-semibold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Global Cloudflare Tunnel Domain & Defaults</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Default Tunnel Base Domain
                    </label>
                    <input
                      type="text"
                      value={config.defaultDomain}
                      onChange={(e) =>
                        onUpdateConfig({ ...config, defaultDomain: e.target.value })
                      }
                      placeholder="yourdomain.com"
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate-500 font-mono">
                      Generates: STARNAME-a.{config.defaultDomain || 'domain.com'} &amp; -b
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Universe Title
                    </label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => onUpdateConfig({ ...config, title: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col justify-center gap-2 pt-3">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.openInNewTab}
                        onChange={(e) =>
                          onUpdateConfig({ ...config, openInNewTab: e.target.checked })
                        }
                        className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span>Open service links in a new tab by default</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm text-slate-200">
                    Registered Star Systems ({config.services.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleStartAddNew}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Star Service</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80 rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  {config.services.map((svc) => {
                    const resolved = resolveServiceUrls(svc, config);
                    return (
                      <div
                        key={svc.id}
                        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3.5 hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <AstralBodyGraphic type={svc.astralType} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-sm text-white truncate">
                                {svc.name}
                              </span>
                              <span className="font-mono text-[11px] text-cyan-300">
                                ★ {svc.starName}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-[11px]">
                              <span className="text-cyan-400">{resolved.primaryHost}</span>
                              {svc.hasSecondary && resolved.secondaryHost && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-amber-300">{resolved.secondaryHost}</span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {svc.tags.map((t) => (
                                <span
                                  key={t}
                                  className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(svc)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(svc.id)}
                            title="Delete star service"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD / EDIT STAR SERVICE FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveService} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Service Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftService.name}
                    onChange={(e) =>
                      setDraftService({ ...draftService, name: e.target.value })
                    }
                    placeholder="e.g. Jellyfin Media Server"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Star Subdomain Slug (STARNAME) *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftService.starSlug}
                    onChange={(e) =>
                      setDraftService({
                        ...draftService,
                        starSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                      })
                    }
                    placeholder="e.g. draconis, orionis, centauri"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Astronomical Star Designation
                  </label>
                  <input
                    type="text"
                    value={draftService.starName}
                    onChange={(e) =>
                      setDraftService({ ...draftService, starName: e.target.value })
                    }
                    placeholder="e.g. Alpha Draconis (Thuban)"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Tags (comma-separated; 1st tag = Constellation Sector) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Core Systems, Infrastructure, Critical"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  />
                  {existingTags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500 mr-1">
                        Quick add tag:
                      </span>
                      {existingTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const cur = tagsInput
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean);
                            if (!cur.includes(tag)) {
                              setTagsInput([...cur, tag].join(', '));
                            }
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Service Description
                </label>
                <input
                  type="text"
                  value={draftService.description || ''}
                  onChange={(e) =>
                    setDraftService({ ...draftService, description: e.target.value })
                  }
                  placeholder="Optional telemetry description shown when hovering the star..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Astral Body Visual Type Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2">
                  Astral Body Classification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {ASTRAL_TYPES.map((type) => {
                    const meta = ASTRAL_TYPE_META[type];
                    const selected = draftService.astralType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDraftService({ ...draftService, astralType: type })}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          selected
                            ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <AstralBodyGraphic type={type} size="sm" />
                        <div className="min-w-0">
                          <div className="font-display font-semibold text-xs text-white truncate">
                            {meta.label}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {meta.summary}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary (-a) and Secondary (-b) URL Configuration & Live Preview */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display font-semibold text-sm text-cyan-300">
                    Primary (-a) &amp; Secondary (-b) Tunnel Endpoints
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs text-amber-300 font-mono cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftService.hasSecondary}
                      onChange={(e) =>
                        setDraftService({
                          ...draftService,
                          hasSecondary: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700 bg-slate-950 text-amber-500"
                    />
                    <span>Enable Secondary (-b) Binary Companion Star</span>
                  </label>
                </div>

                {/* Live Resolved URLs Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/90 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Resolved Primary (-a) URL:
                    </span>
                    <span className="text-cyan-300 break-all">{previewUrls.primaryUrl}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Resolved Secondary (-b) URL:
                    </span>
                    <span className="text-amber-300 break-all">
                      {draftService.hasSecondary && previewUrls.secondaryUrl
                        ? previewUrls.secondaryUrl
                        : 'Disabled (Single-Star System)'}
                    </span>
                  </div>
                </div>

                {/* Optional Overrides & Custom Button Labels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Primary Button Label
                    </label>
                    <input
                      type="text"
                      value={draftService.primaryLabel || ''}
                      onChange={(e) =>
                        setDraftService({ ...draftService, primaryLabel: e.target.value })
                      }
                      placeholder="Primary (-a)"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      disabled={!draftService.hasSecondary}
                      value={draftService.secondaryLabel || ''}
                      onChange={(e) =>
                        setDraftService({ ...draftService, secondaryLabel: e.target.value })
                      }
                      placeholder="Secondary (-b)"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-white disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Custom Primary URL Override (leave blank for auto -a)
                    </label>
                    <input
                      type="text"
                      value={draftService.primaryUrl || ''}
                      onChange={(e) =>
                        setDraftService({ ...draftService, primaryUrl: e.target.value })
                      }
                      placeholder={`https://${draftService.starSlug || 'star'}-a.${config.defaultDomain}`}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Custom Secondary URL Override (leave blank for auto -b)
                    </label>
                    <input
                      type="text"
                      disabled={!draftService.hasSecondary}
                      value={draftService.secondaryUrl || ''}
                      onChange={(e) =>
                        setDraftService({ ...draftService, secondaryUrl: e.target.value })
                      }
                      placeholder={`https://${draftService.starSlug || 'star'}-b.${config.defaultDomain}`}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono text-white disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                >
                  {isEditingExisting ? 'Save Star Changes' : 'Ignite Star System'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RAW JSON EDITOR & EXPORT */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-1">
                <p>
                  <strong className="text-cyan-300">Git Workflow:</strong> Copy or download this JSON and save it to{' '}
                  <code className="font-mono text-amber-300">src/config/constellation.json</code> in your repository. Pushing to Git will automatically deploy your updated universe to Cloudflare Pages for free.
                </p>
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs font-mono text-rose-300">
                  {jsonError}
                </div>
              )}

              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                rows={16}
                spellCheck={false}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-cyan-100 focus:border-cyan-400 focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleApplyRawJson}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-display font-bold text-xs"
                >
                  Apply JSON Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
