import React, { useId } from 'react';
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
    summary: 'Deep crimson M-type stellar ember with convective plasma turbulence',
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
  const uid = useId().replace(/:/g, '');
  const dim = size === 'sm' ? 30 : size === 'md' ? 46 : 78;
  const scaleClass = isHovered ? 'scale-110' : 'scale-100';

  if (type === 'blue-giant') {
    const coreSize = dim * 0.44;
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Outer HDR volumetric corona */}
        <div
          className="absolute -inset-4 rounded-full blur-xl animate-stellar-breath mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(224,242,254,0.9) 0%, rgba(56,189,248,0.6) 34%, rgba(37,99,235,0.22) 64%, transparent 78%)',
          }}
        />
        {/* Counter-rotating coronal plasma streamers */}
        <div
          className="absolute -inset-1.5 rounded-full blur-[4px] opacity-85 animate-corona-cw mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(186,230,253,0.85) 25deg, transparent 55deg, rgba(56,189,248,0.75) 110deg, transparent 145deg, rgba(224,242,254,0.9) 200deg, transparent 240deg, rgba(56,189,248,0.8) 305deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 25%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle, black 25%, transparent 72%)',
          }}
        />
        <div
          className="absolute -inset-1 rounded-full blur-[3px] opacity-75 animate-corona-ccw mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 45deg, rgba(56,189,248,0.75) 0deg, transparent 40deg, rgba(255,255,255,0.85) 95deg, transparent 150deg, rgba(56,189,248,0.8) 220deg, transparent 275deg, rgba(186,230,253,0.85) 320deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 28%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 28%, transparent 70%)',
          }}
        />
        {/* Subtle Optical Airy Diffraction Ring */}
        <div
          className="absolute rounded-full border border-sky-200/20 pointer-events-none"
          style={{ width: dim * 0.78, height: dim * 0.78 }}
        />
        {/* Tapered Optical Diffraction Spikes */}
        <div className="absolute inset-0 flex items-center justify-center animate-flare-shimmer">
          <div
            className="absolute w-[180%] h-[2px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(186,230,253,0.85) 28%, rgba(56,189,248,0.3) 58%, transparent 100%)',
            }}
          />
          <div
            className="absolute h-[180%] w-[2px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(186,230,253,0.85) 28%, rgba(56,189,248,0.3) 58%, transparent 100%)',
            }}
          />
          <div
            className="absolute w-[115%] h-[1px] rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(125,211,252,0.6) 35%, transparent 100%)',
            }}
          />
          <div
            className="absolute w-[115%] h-[1px] -rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(125,211,252,0.6) 35%, transparent 100%)',
            }}
          />
        </div>
        {/* 3D Boiling Photosphere Core */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            width: coreSize,
            height: coreSize,
            background:
              'radial-gradient(circle at 35% 35%, #ffffff 0%, #e0f2fe 28%, #38bdf8 62%, #0284c7 88%, #0c4a6e 100%)',
            boxShadow:
              '0 0 16px 3px rgba(255,255,255,0.92), 0 0 38px 8px rgba(56,189,248,0.85), inset -3px -3px 7px rgba(12,74,110,0.8)',
          }}
        >
          {/* Animated convective granulation cells */}
          <div
            className="absolute -inset-2 opacity-55 mix-blend-overlay animate-corona-cw"
            style={{
              background:
                'conic-gradient(from 0deg, #ffffff, #0284c7, #bae6fd, #0369a1, #ffffff, #38bdf8, #0c4a6e, #ffffff)',
            }}
          />
          {/* White-hot center hotspot */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 36% 34%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 38%, transparent 72%)',
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'golden-star') {
    const coreSize = dim * 0.44;
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Outer HDR solar corona */}
        <div
          className="absolute -inset-4 rounded-full blur-xl animate-stellar-breath mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(254,249,195,0.9) 0%, rgba(251,191,36,0.58) 36%, rgba(234,88,12,0.24) 66%, transparent 80%)',
          }}
        />
        {/* Counter-rotating solar prominences & coronal rays */}
        <div
          className="absolute -inset-1.5 rounded-full blur-[4px] opacity-85 animate-corona-cw mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 15deg, transparent 0deg, rgba(254,240,138,0.85) 30deg, transparent 65deg, rgba(245,158,11,0.8) 120deg, transparent 165deg, rgba(254,249,195,0.9) 215deg, transparent 260deg, rgba(234,88,12,0.75) 315deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 25%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle, black 25%, transparent 72%)',
          }}
        />
        <div
          className="absolute -inset-1 rounded-full blur-[3px] opacity-75 animate-corona-ccw mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 90deg, rgba(251,191,36,0.8) 0deg, transparent 50deg, rgba(255,255,255,0.85) 110deg, transparent 170deg, rgba(245,158,11,0.8) 235deg, transparent 290deg, rgba(254,240,138,0.85) 330deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 28%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 28%, transparent 70%)',
          }}
        />
        {/* Tapered Solar Diffraction Spikes */}
        <div className="absolute inset-0 flex items-center justify-center animate-flare-shimmer">
          <div
            className="absolute w-[165%] h-[2px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(254,240,138,0.85) 28%, rgba(251,191,36,0.3) 58%, transparent 100%)',
            }}
          />
          <div
            className="absolute h-[165%] w-[2px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(254,240,138,0.85) 28%, rgba(251,191,36,0.3) 58%, transparent 100%)',
            }}
          />
          <div
            className="absolute w-[105%] h-[1px] rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(253,224,71,0.55) 35%, transparent 100%)',
            }}
          />
          <div
            className="absolute w-[105%] h-[1px] -rotate-45"
            style={{
              background:
                'radial-gradient(ellipse at center, #ffffff 0%, rgba(253,224,71,0.55) 35%, transparent 100%)',
            }}
          />
        </div>
        {/* 3D Boiling Solar Photosphere */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            width: coreSize,
            height: coreSize,
            background:
              'radial-gradient(circle at 34% 32%, #ffffff 0%, #fef08a 24%, #f59e0b 58%, #ea580c 84%, #7c2d12 100%)',
            boxShadow:
              '0 0 16px 3px rgba(254,249,195,0.92), 0 0 36px 7px rgba(245,158,11,0.8), inset -3px -3px 8px rgba(124,45,18,0.85)',
          }}
        >
          {/* Animated convective solar granulation */}
          <div
            className="absolute -inset-2 opacity-60 mix-blend-overlay animate-corona-cw"
            style={{
              background:
                'conic-gradient(from 0deg, #ffffff, #ea580c, #fde047, #9a3412, #ffffff, #f59e0b, #7c2d12, #ffffff)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 32%, rgba(255,255,255,0.9) 0%, rgba(254,240,138,0.3) 42%, transparent 75%)',
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'red-dwarf') {
    const coreSize = dim * 0.42;
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Crimson HDR flare halo */}
        <div
          className="absolute -inset-3 rounded-full blur-xl animate-stellar-breath mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(254,205,211,0.8) 0%, rgba(244,63,94,0.58) 38%, rgba(159,18,57,0.28) 68%, transparent 82%)',
          }}
        />
        {/* Convective coronal prominences */}
        <div
          className="absolute -inset-1 rounded-full blur-[3px] opacity-80 animate-corona-ccw mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(251,113,133,0.85) 40deg, transparent 90deg, rgba(244,63,94,0.75) 160deg, transparent 210deg, rgba(253,164,175,0.85) 280deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 26%, transparent 68%)',
            WebkitMaskImage: 'radial-gradient(circle, black 26%, transparent 68%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center animate-flare-shimmer">
          <div
            className="absolute w-[135%] h-[1.5px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #fff1f2 0%, rgba(251,113,133,0.75) 32%, transparent 100%)',
            }}
          />
          <div
            className="absolute h-[135%] w-[1.5px]"
            style={{
              background:
                'radial-gradient(ellipse at center, #fff1f2 0%, rgba(251,113,133,0.75) 32%, transparent 100%)',
            }}
          />
        </div>
        {/* 3D Limb-Darkened Convective Crimson Sphere */}
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            width: coreSize,
            height: coreSize,
            background:
              'radial-gradient(circle at 32% 30%, #fff1f2 0%, #fda4af 18%, #f43f5e 48%, #be123c 76%, #4c0519 100%)',
            boxShadow:
              '0 0 15px 2px rgba(253,164,175,0.75), 0 0 32px 6px rgba(244,63,94,0.78), inset -4px -4px 10px rgba(76,5,25,0.9)',
          }}
        >
          {/* Boiling convective cells & magnetic starspots */}
          <div
            className="absolute -inset-2 opacity-65 mix-blend-overlay animate-corona-cw"
            style={{
              background:
                'conic-gradient(from 20deg, #fda4af, #4c0519, #fb7185, #881337, #fff1f2, #9f1239, #4c0519, #fda4af)',
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'ringed-planet') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Ambient planetary atmospheric glow */}
        <div
          className="absolute -inset-2 rounded-full blur-xl opacity-75 animate-stellar-breath mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(232,121,249,0.52) 0%, rgba(168,85,247,0.32) 48%, rgba(56,189,248,0.14) 72%, transparent 85%)',
          }}
        />
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(192,132,252,0.65)]"
        >
          <defs>
            <radialGradient id={`planetSphere-${uid}`} cx="32%" cy="28%" r="70%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="20%" stopColor="#e879f9" />
              <stop offset="48%" stopColor="#9333ea" />
              <stop offset="78%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#090214" />
            </radialGradient>
            <linearGradient id={`planetBands-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b0764" stopOpacity="0.4" />
              <stop offset="22%" stopColor="#f0abfc" stopOpacity="0.35" />
              <stop offset="38%" stopColor="#581c87" stopOpacity="0.45" />
              <stop offset="52%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="68%" stopColor="#7e22ce" stopOpacity="0.4" />
              <stop offset="84%" stopColor="#f0abfc" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#090214" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id={`rimLight-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#f0abfc" stopOpacity="0.65" />
              <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`ringGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
              <stop offset="24%" stopColor="#f0abfc" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.98" />
              <stop offset="76%" stopColor="#e879f9" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.35" />
            </linearGradient>
            <clipPath id={`frontRing-${uid}`}>
              <rect x="-20" y="50" width="140" height="60" />
            </clipPath>
            <clipPath id={`backRing-${uid}`}>
              <rect x="-20" y="-10" width="140" height="60" />
            </clipPath>
            <clipPath id={`sphereClip-${uid}`}>
              <circle cx="50" cy="50" r="19" />
            </clipPath>
          </defs>

          {/* Back half of rings (behind planet) */}
          <g transform="rotate(-22 50 50)" clipPath={`url(#backRing-${uid})`} opacity="0.62">
            <ellipse
              cx="50"
              cy="50"
              rx="45"
              ry="13.5"
              fill="none"
              stroke={`url(#ringGrad-${uid})`}
              strokeWidth="4.8"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36.5"
              ry="10.5"
              fill="none"
              stroke={`url(#ringGrad-${uid})`}
              strokeWidth="2.2"
              strokeOpacity="0.75"
            />
          </g>

          {/* 3D Planet Sphere + Atmospheric Cloud Bands */}
          <g clipPath={`url(#sphereClip-${uid})`}>
            <circle cx="50" cy="50" r="19" fill={`url(#planetSphere-${uid})`} />
            <rect
              x="28"
              y="28"
              width="44"
              height="44"
              fill={`url(#planetBands-${uid})`}
              transform="rotate(-22 50 50)"
            />
            {/* Deep terminator shadow on night side */}
            <circle
              cx="58"
              cy="56"
              r="19"
              fill="none"
              stroke="rgba(5, 2, 14, 0.55)"
              strokeWidth="8"
            />
          </g>

          {/* Atmospheric Fresnel Rim */}
          <circle
            cx="50"
            cy="50"
            r="18.7"
            fill="none"
            stroke={`url(#rimLight-${uid})`}
            strokeWidth="1.3"
          />

          {/* Front half of rings (occluding planet) + animated ring shimmer */}
          <g transform="rotate(-22 50 50)" clipPath={`url(#frontRing-${uid})`}>
            <ellipse
              cx="50"
              cy="50"
              rx="45"
              ry="13.5"
              fill="none"
              stroke={`url(#ringGrad-${uid})`}
              strokeWidth="4.8"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="36.5"
              ry="10.5"
              fill="none"
              stroke={`url(#ringGrad-${uid})`}
              strokeWidth="2.2"
              strokeOpacity="0.88"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="41"
              ry="12"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="6 18"
              strokeOpacity="0.65"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="48"
                dur="4s"
                repeatCount="indefinite"
              />
            </ellipse>
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'pulsar') {
    return (
      <div
        className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
        style={{ width: dim, height: dim }}
      >
        {/* Magnetosphere HDR bloom */}
        <div
          className="absolute -inset-3 rounded-full blur-xl animate-stellar-breath mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle, rgba(204,251,241,0.92) 0%, rgba(45,212,191,0.55) 40%, rgba(56,189,248,0.22) 70%, transparent 85%)',
          }}
        />
        {/* Expanding Synchrotron Shockwave Ring */}
        <div
          className="absolute rounded-full border border-teal-300/50 animate-pulsar-wave"
          style={{ width: dim * 0.65, height: dim * 0.65 }}
        />
        {/* Rapidly spinning magnetic plasma disk */}
        <div
          className="absolute inset-1 rounded-full blur-[2px] opacity-80 animate-corona-fast mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(94,234,212,0.9) 45deg, transparent 90deg, rgba(56,189,248,0.85) 180deg, transparent 225deg, rgba(204,251,241,0.9) 315deg, transparent 360deg)',
            maskImage: 'radial-gradient(circle, black 22%, transparent 68%)',
            WebkitMaskImage: 'radial-gradient(circle, black 22%, transparent 68%)',
          }}
        />
        {/* Relativistic Polar Plasma Jets */}
        <div
          className="absolute w-[195%] h-[3.5px] -rotate-45 rounded-full animate-flare-shimmer"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.35) 20%, rgba(94,234,212,0.95) 42%, #ffffff 50%, rgba(94,234,212,0.95) 58%, rgba(45,212,191,0.35) 80%, transparent 100%)',
            boxShadow: '0 0 18px rgba(45,212,191,0.95)',
          }}
        />
        <div className="absolute w-[120%] h-[1.5px] -rotate-45 bg-gradient-to-r from-transparent via-white to-transparent" />
        {/* Tilted 3D Accretion Torus */}
        <div
          className="absolute rounded-full border-2 border-teal-200/75 rotate-45"
          style={{
            width: dim * 0.78,
            height: dim * 0.32,
            boxShadow:
              '0 0 16px rgba(45,212,191,0.65), inset 0 0 10px rgba(56,189,248,0.5)',
          }}
        />
        {/* Blinding Neutron Star Core */}
        <div
          className="relative rounded-full bg-white"
          style={{
            width: dim * 0.28,
            height: dim * 0.28,
            boxShadow:
              '0 0 16px 4px #ffffff, 0 0 34px 8px rgba(45,212,191,0.95)',
          }}
        />
      </div>
    );
  }

  // nebula-core
  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-300 pointer-events-none ${scaleClass}`}
      style={{ width: dim, height: dim }}
    >
      {/* Multi-lobed HDR Volumetric Nebula */}
      <div
        className="absolute -inset-4 rounded-full blur-xl animate-stellar-breath mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(232,121,249,0.8) 0%, rgba(99,102,241,0.58) 38%, rgba(56,189,248,0.35) 65%, transparent 82%)',
        }}
      />
      {/* Counter-rotating ionized gas clouds */}
      <div
        className="absolute -inset-1.5 rounded-full blur-[4px] opacity-85 animate-corona-cw mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(244,114,182,0.8), rgba(129,140,248,0.75), rgba(56,189,248,0.7), rgba(192,132,252,0.85), rgba(244,114,182,0.8))',
          maskImage: 'radial-gradient(circle, black 22%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle, black 22%, transparent 72%)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full blur-md opacity-75 animate-corona-ccw mix-blend-screen"
        style={{
          background:
            'radial-gradient(circle at 65% 60%, rgba(244,114,182,0.7) 0%, rgba(129,140,248,0.45) 50%, transparent 78%)',
        }}
      />
      {/* Swirling Protostellar Accretion Ring */}
      <div
        className="absolute rounded-full border border-indigo-200/55 animate-spin-slow"
        style={{
          width: dim * 0.72,
          height: dim * 0.72,
          borderStyle: 'dashed',
          boxShadow: '0 0 14px rgba(129,140,248,0.45)',
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
            '0 0 14px 3px #ffffff, 0 0 32px 6px rgba(129,140,248,0.95)',
        }}
      />
    </div>
  );
};
