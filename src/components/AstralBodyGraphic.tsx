import React from 'react';
import { AstralType } from '../types/constellation';

interface AstralBodyGraphicProps {
  type: AstralType;
  size?: 'sm' | 'md' | 'lg';
  isHovered?: boolean;
}

export const ASTRAL_TYPE_META: Record<
  AstralType,
  { label: string; accent: string; badgeBg: string; border: string; summary: string }
> = {
  'blue-giant': {
    label: 'Blue Supergiant',
    accent: '#38bdf8',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    border: 'border-sky-400/40',
    summary: 'High-luminosity O/B-type hypergiant with bright cyan corona',
  },
  'golden-star': {
    label: 'Solar Main-Sequence',
    accent: '#fbbf24',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    border: 'border-amber-400/40',
    summary: 'Warm G-type golden star with four-point diffraction spikes',
  },
  'red-dwarf': {
    label: 'Crimson Giant / Dwarf',
    accent: '#fb7185',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    border: 'border-rose-400/40',
    summary: 'Deep crimson M-type stellar ember with convective flare',
  },
  'ringed-planet': {
    label: 'Ringed Gas Giant',
    accent: '#c084fc',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    border: 'border-purple-400/40',
    summary: 'Jovian astral world encircled by luminous inclination rings',
  },
  'pulsar': {
    label: 'Magnetar / Pulsar',
    accent: '#2dd4bf',
    badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
    border: 'border-teal-400/40',
    summary: 'Rapidly spinning neutron star with relativistic polar beams',
  },
  'nebula-core': {
    label: 'Nebula Protostar',
    accent: '#818cf8',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    border: 'border-indigo-400/40',
    summary: 'Ionized stellar nursery enveloped in multi-layered gas clouds',
  },
};

export const AstralBodyGraphic: React.FC<AstralBodyGraphicProps> = ({
  type,
  size = 'lg',
  isHovered = false,
}) => {
  const dim = size === 'sm' ? 28 : size === 'md' ? 42 : 68;
  const scaleClass = isHovered ? 'scale-110' : 'scale-100';

  if (type === 'blue-giant') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        <div
          className="absolute inset-0 rounded-full blur-md opacity-75 animate-pulse-slow"
          style={{
            background:
              'radial-gradient(circle, rgba(186,230,253,0.95) 0%, rgba(56,189,248,0.65) 45%, rgba(2,132,199,0) 75%)',
          }}
        />
        {/* Diffraction spikes */}
        <div className="absolute w-[135%] h-[1.5px] bg-gradient-to-r from-transparent via-sky-200/90 to-transparent" />
        <div className="absolute h-[135%] w-[1.5px] bg-gradient-to-b from-transparent via-sky-200/90 to-transparent" />
        {/* Core */}
        <div
          className="relative rounded-full shadow-[0_0_24px_rgba(56,189,248,0.95)]"
          style={{
            width: dim * 0.46,
            height: dim * 0.46,
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #e0f2fe 35%, #38bdf8 75%, #0284c7 100%)',
          }}
        />
      </div>
    );
  }

  if (type === 'golden-star') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        <div
          className="absolute inset-0 rounded-full blur-md opacity-80 animate-pulse-slow"
          style={{
            background:
              'radial-gradient(circle, rgba(254,243,199,0.95) 0%, rgba(251,191,36,0.6) 45%, rgba(217,119,6,0) 75%)',
          }}
        />
        <div className="absolute w-[125%] h-[1.5px] bg-gradient-to-r from-transparent via-amber-200/85 to-transparent" />
        <div className="absolute h-[125%] w-[1.5px] bg-gradient-to-b from-transparent via-amber-200/85 to-transparent" />
        <div
          className="relative rounded-full shadow-[0_0_22px_rgba(251,191,36,0.9)]"
          style={{
            width: dim * 0.44,
            height: dim * 0.44,
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #fef3c7 35%, #fbbf24 72%, #d97706 100%)',
          }}
        />
      </div>
    );
  }

  if (type === 'red-dwarf') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        <div
          className="absolute inset-1 rounded-full blur-md opacity-80 animate-pulse-slow"
          style={{
            background:
              'radial-gradient(circle, rgba(254,205,211,0.9) 0%, rgba(244,63,94,0.6) 48%, rgba(159,18,57,0) 75%)',
          }}
        />
        <div
          className="relative rounded-full shadow-[0_0_20px_rgba(244,63,94,0.9)]"
          style={{
            width: dim * 0.42,
            height: dim * 0.42,
            background:
              'radial-gradient(circle at 32% 32%, #fff1f2 0%, #fda4af 30%, #f43f5e 70%, #9f1239 100%)',
          }}
        />
      </div>
    );
  }

  if (type === 'ringed-planet') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        <div
          className="absolute inset-1 rounded-full blur-md opacity-65"
          style={{
            background:
              'radial-gradient(circle, rgba(216,180,254,0.7) 0%, rgba(168,85,247,0.35) 55%, rgba(88,28,135,0) 80%)',
          }}
        />
        {/* Tilted Planetary Ring SVG */}
        <svg
          viewBox="0 0 80 80"
          className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(192,132,252,0.7)]"
        >
          <defs>
            <linearGradient id="planetBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="40%" stopColor="#c084fc" />
              <stop offset="80%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e879f9" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          {/* Back ring arc */}
          <ellipse
            cx="40"
            cy="40"
            rx="34"
            ry="11"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="3.5"
            transform="rotate(-24 40 40)"
            strokeDasharray="106 106"
            strokeDashoffset="106"
            opacity="0.55"
          />
          {/* Planet sphere */}
          <circle cx="40" cy="40" r="15.5" fill="url(#planetBody)" />
          {/* Front ring arc */}
          <ellipse
            cx="40"
            cy="40"
            rx="34"
            ry="11"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="3.5"
            transform="rotate(-24 40 40)"
            strokeDasharray="110 110"
          />
        </svg>
      </div>
    );
  }

  if (type === 'pulsar') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Relativistic jets */}
        <div
          className="absolute w-[155%] h-[2.5px] -rotate-45 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.85) 35%, #ffffff 50%, rgba(56,189,248,0.85) 65%, transparent 100%)',
            boxShadow: '0 0 12px rgba(45,212,191,0.9)',
          }}
        />
        {/* Accretion shock ring */}
        <div
          className="absolute rounded-full border border-teal-300/60 rotate-45"
          style={{
            width: dim * 0.72,
            height: dim * 0.34,
            boxShadow: '0 0 14px rgba(45,212,191,0.55)',
          }}
        />
        {/* Neutron star core */}
        <div
          className="relative rounded-full bg-white shadow-[0_0_24px_#2dd4bf,0_0_8px_#ffffff]"
          style={{
            width: dim * 0.32,
            height: dim * 0.32,
          }}
        />
      </div>
    );
  }

  // nebula-core
  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
      style={{ width: dim, height: dim }}
    >
      <div
        className="absolute inset-0 rounded-full blur-md opacity-85 animate-pulse-slow"
        style={{
          background:
            'radial-gradient(circle, rgba(192,132,252,0.85) 0%, rgba(99,102,241,0.55) 45%, rgba(236,72,153,0.3) 68%, transparent 80%)',
        }}
      />
      <div
        className="absolute rounded-full border border-indigo-300/35 animate-spin-slow"
        style={{
          width: dim * 0.66,
          height: dim * 0.66,
          borderStyle: 'dashed',
        }}
      />
      <div
        className="relative rounded-full shadow-[0_0_20px_rgba(129,140,248,0.95)]"
        style={{
          width: dim * 0.38,
          height: dim * 0.38,
          background:
            'radial-gradient(circle at 35% 35%, #ffffff 0%, #e0e7ff 40%, #818cf8 78%, #4f46e5 100%)',
        }}
      />
    </div>
  );
};
