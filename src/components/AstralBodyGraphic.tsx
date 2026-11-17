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
    summary: 'High-luminosity O/B-type hypergiant with incandescent cyan corona',
  },
  'golden-star': {
    label: 'Solar Main-Sequence',
    accent: '#fbbf24',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    border: 'border-amber-400/40',
    summary: 'Warm G-type golden star with HDR solar flare & diffraction spikes',
  },
  'red-dwarf': {
    label: 'Crimson Giant / Dwarf',
    accent: '#fb7185',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    border: 'border-rose-400/40',
    summary: 'Deep crimson M-type stellar ember with 3D limb darkening',
  },
  'ringed-planet': {
    label: 'Ringed Gas Giant',
    accent: '#c084fc',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    border: 'border-purple-400/40',
    summary: '3D-shaded Jovian world encircled by luminous Cassini rings',
  },
  'pulsar': {
    label: 'Magnetar / Pulsar',
    accent: '#2dd4bf',
    badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
    border: 'border-teal-400/40',
    summary: 'Rapidly spinning neutron star with relativistic polar plasma jets',
  },
  'nebula-core': {
    label: 'Nebula Protostar',
    accent: '#818cf8',
    badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    border: 'border-indigo-400/40',
    summary: 'Ionized stellar nursery enveloped in volumetric HDR gas clouds',
  },
};

export const AstralBodyGraphic: React.FC<AstralBodyGraphicProps> = ({
  type,
  size = 'lg',
  isHovered = false,
}) => {
  const dim = size === 'sm' ? 30 : size === 'md' ? 46 : 78;
  const scaleClass = isHovered ? 'scale-110' : 'scale-100';

  if (type === 'blue-giant') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Outer HDR volumetric bloom */}
        <div
          className="absolute -inset-3 rounded-full blur-xl opacity-80 animate-pulse-slow mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(224,242,254,0.85) 0%, rgba(56,189,248,0.55) 35%, rgba(37,99,235,0.22) 65%, transparent 80%)',
          }}
        />
        {/* Chromosphere ring */}
        <div
          className="absolute inset-1 rounded-full blur-[3px] opacity-90"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.95) 20%, rgba(56,189,248,0.7) 55%, transparent 78%)',
          }}
        />
        {/* Primary 4-point + subtle diagonal HDR diffraction spikes */}
        <div className="absolute w-[165%] h-[1.5px] bg-gradient-to-r from-transparent via-sky-100 to-transparent opacity-90" />
        <div className="absolute h-[165%] w-[1.5px] bg-gradient-to-b from-transparent via-sky-100 to-transparent opacity-90" />
        <div className="absolute w-[110%] h-[1px] rotate-45 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
        <div className="absolute w-[110%] h-[1px] -rotate-45 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
        {/* 3D Spherical Star Core */}
        <div
          className="relative rounded-full"
          style={{
            width: dim * 0.44,
            height: dim * 0.44,
            background:
              'radial-gradient(circle at 32% 30%, #ffffff 0%, #f0f9ff 24%, #7dd3fc 56%, #0284c7 88%, #075985 100%)',
            boxShadow:
              '0 0 18px 2px rgba(255,255,255,0.85), 0 0 38px 6px rgba(56,189,248,0.8), inset -3px -3px 8px rgba(7,89,133,0.7)',
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
        {/* Outer HDR solar corona */}
        <div
          className="absolute -inset-3 rounded-full blur-xl opacity-80 animate-pulse-slow mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(254,249,195,0.85) 0%, rgba(251,191,36,0.55) 38%, rgba(234,88,12,0.22) 68%, transparent 82%)',
          }}
        />
        {/* Solar flare spikes */}
        <div className="absolute w-[150%] h-[1.5px] bg-gradient-to-r from-transparent via-amber-100 to-transparent opacity-90" />
        <div className="absolute h-[150%] w-[1.5px] bg-gradient-to-b from-transparent via-amber-100 to-transparent opacity-90" />
        <div className="absolute w-[95%] h-[1px] rotate-45 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
        <div className="absolute w-[95%] h-[1px] -rotate-45 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
        {/* 3D Solar Photosphere */}
        <div
          className="relative rounded-full"
          style={{
            width: dim * 0.44,
            height: dim * 0.44,
            background:
              'radial-gradient(circle at 30% 28%, #ffffff 0%, #fef9c3 22%, #fbbf24 55%, #ea580c 88%, #9a3412 100%)',
            boxShadow:
              '0 0 16px 2px rgba(254,240,138,0.9), 0 0 36px 6px rgba(245,158,11,0.75), inset -3px -3px 8px rgba(154,52,18,0.75)',
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
        {/* Crimson HDR flare halo */}
        <div
          className="absolute -inset-2.5 rounded-full blur-xl opacity-80 animate-pulse-slow mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(254,205,211,0.75) 0%, rgba(244,63,94,0.55) 40%, rgba(159,18,57,0.25) 70%, transparent 82%)',
          }}
        />
        <div className="absolute w-[125%] h-[1px] bg-gradient-to-r from-transparent via-rose-200/75 to-transparent" />
        <div className="absolute h-[125%] w-[1px] bg-gradient-to-b from-transparent via-rose-200/75 to-transparent" />
        {/* 3D Limb-Darkened Crimson Sphere */}
        <div
          className="relative rounded-full"
          style={{
            width: dim * 0.42,
            height: dim * 0.42,
            background:
              'radial-gradient(circle at 30% 30%, #fff1f2 0%, #fda4af 20%, #f43f5e 52%, #be123c 80%, #4c0519 100%)',
            boxShadow:
              '0 0 15px 2px rgba(253,164,175,0.7), 0 0 32px 5px rgba(244,63,94,0.75), inset -4px -4px 10px rgba(76,5,25,0.85)',
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
        {/* Ambient planetary atmospheric glow */}
        <div
          className="absolute -inset-2 rounded-full blur-xl opacity-70 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(232,121,249,0.5) 0%, rgba(168,85,247,0.3) 48%, rgba(56,189,248,0.12) 72%, transparent 85%)',
          }}
        />
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(192,132,252,0.65)]"
        >
          <defs>
            {/* 3D Spherical Planet Shading with Atmospheric Rim */}
            <radialGradient id="hdrPlanetSphere" cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="22%" stopColor="#e879f9" />
              <stop offset="52%" stopColor="#9333ea" />
              <stop offset="82%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#0f0321" />
            </radialGradient>
            {/* Specular Rim Highlight */}
            <linearGradient id="hdrRimLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            {/* Multi-band Cassini Ring Gradient */}
            <linearGradient id="hdrRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="28%" stopColor="#f0abfc" stopOpacity="0.95" />
              <stop offset="52%" stopColor="#38bdf8" stopOpacity="0.98" />
              <stop offset="76%" stopColor="#e879f9" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.35" />
            </linearGradient>
            <clipPath id="frontRingClip">
              <rect x="-20" y="50" width="140" height="60" />
            </clipPath>
            <clipPath id="backRingClip">
              <rect x="-20" y="-10" width="140" height="60" />
            </clipPath>
          </defs>

          {/* Back half of rings (behind planet) */}
          <g transform="rotate(-22 50 50)" clipPath="url(#backRingClip)" opacity="0.65">
            <ellipse
              cx="50"
              cy="50"
              rx="44"
              ry="13.5"
              fill="none"
              stroke="url(#hdrRingGrad)"
              strokeWidth="4.5"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="10.5"
              fill="none"
              stroke="url(#hdrRingGrad)"
              strokeWidth="2.2"
              strokeOpacity="0.7"
            />
          </g>

          {/* 3D Planet Sphere */}
          <circle cx="50" cy="50" r="19" fill="url(#hdrPlanetSphere)" />
          {/* Atmospheric Fresnel Rim */}
          <circle
            cx="50"
            cy="50"
            r="18.6"
            fill="none"
            stroke="url(#hdrRimLight)"
            strokeWidth="1.4"
          />

          {/* Front half of rings (occluding planet) */}
          <g transform="rotate(-22 50 50)" clipPath="url(#frontRingClip)">
            <ellipse
              cx="50"
              cy="50"
              rx="44"
              ry="13.5"
              fill="none"
              stroke="url(#hdrRingGrad)"
              strokeWidth="4.5"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="10.5"
              fill="none"
              stroke="url(#hdrRingGrad)"
              strokeWidth="2.2"
              strokeOpacity="0.85"
            />
          </g>
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
        {/* Magnetosphere HDR bloom */}
        <div
          className="absolute -inset-2.5 rounded-full blur-xl opacity-80 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(204,251,241,0.9) 0%, rgba(45,212,191,0.5) 42%, rgba(56,189,248,0.2) 70%, transparent 85%)',
          }}
        />
        {/* Relativistic Polar Plasma Jets */}
        <div
          className="absolute w-[185%] h-[3px] -rotate-45 rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.3) 20%, rgba(94,234,212,0.95) 42%, #ffffff 50%, rgba(94,234,212,0.95) 58%, rgba(45,212,191,0.3) 80%, transparent 100%)',
            boxShadow: '0 0 18px rgba(45,212,191,0.95)',
          }}
        />
        {/* Inner intense jet core */}
        <div className="absolute w-[110%] h-[1.5px] -rotate-45 bg-gradient-to-r from-transparent via-white to-transparent" />
        {/* Tilted 3D Accretion Torus */}
        <div
          className="absolute rounded-full border-2 border-teal-300/70 rotate-45"
          style={{
            width: dim * 0.78,
            height: dim * 0.32,
            boxShadow:
              '0 0 16px rgba(45,212,191,0.6), inset 0 0 10px rgba(56,189,248,0.45)',
          }}
        />
        {/* Neutron Star Core */}
        <div
          className="relative rounded-full bg-white"
          style={{
            width: dim * 0.3,
            height: dim * 0.3,
            boxShadow:
              '0 0 14px 3px #ffffff, 0 0 32px 6px rgba(45,212,191,0.95)',
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
      {/* Multi-lobed HDR Volumetric Nebula */}
      <div
        className="absolute -inset-3 rounded-full blur-xl opacity-85 animate-pulse-slow mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(232,121,249,0.75) 0%, rgba(99,102,241,0.55) 38%, rgba(56,189,248,0.35) 65%, transparent 82%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full blur-md opacity-75 mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 65% 60%, rgba(244,114,182,0.65) 0%, rgba(129,140,248,0.4) 50%, transparent 78%)',
        }}
      />
      {/* Swirling Protostellar Orbit Ring */}
      <div
        className="absolute rounded-full border border-indigo-200/50 animate-spin-slow"
        style={{
          width: dim * 0.7,
          height: dim * 0.7,
          borderStyle: 'dashed',
          boxShadow: '0 0 14px rgba(129,140,248,0.4)',
        }}
      />
      {/* Protostar Core */}
      <div
        className="relative rounded-full"
        style={{
          width: dim * 0.36,
          height: dim * 0.36,
          background:
            'radial-gradient(circle at 32% 30%, #ffffff 0%, #e0e7ff 32%, #818cf8 68%, #4338ca 100%)',
          boxShadow:
            '0 0 14px 2px #ffffff, 0 0 30px 5px rgba(129,140,248,0.9)',
        }}
      />
    </div>
  );
};
