import {
  ConstellationCluster,
  ConstellationConfig,
  PositionedStar,
  StarService,
} from '../types/constellation';
import { resolveServiceUrls } from './urlResolver';

const CLUSTER_PALETTES = [
  { color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.16)' }, // Cyan
  { color: '#c084fc', glowColor: 'rgba(192, 132, 252, 0.16)' }, // Purple / Nebula
  { color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.15)' }, // Solar Amber
  { color: '#34d399', glowColor: 'rgba(52, 211, 153, 0.15)' }, // Emerald
  { color: '#fb7185', glowColor: 'rgba(251, 113, 133, 0.15)' }, // Crimson Rose
  { color: '#818cf8', glowColor: 'rgba(129, 140, 248, 0.16)' }, // Indigo
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Computes Minimum Spanning Tree edges for stars within a constellation
 * so connecting lines form a clean astronomical constellation path.
 */
function buildConstellationEdges(
  stars: PositionedStar[]
): Array<{ from: PositionedStar; to: PositionedStar }> {
  if (stars.length <= 1) return [];

  const visited = new Set<number>([0]);
  const edges: Array<{ from: PositionedStar; to: PositionedStar }> = [];

  while (visited.size < stars.length) {
    let bestFrom = -1;
    let bestTo = -1;
    let bestDist = Infinity;

    for (const i of visited) {
      for (let j = 0; j < stars.length; j++) {
        if (visited.has(j)) continue;
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < bestDist) {
          bestDist = dist;
          bestFrom = i;
          bestTo = j;
        }
      }
    }

    if (bestFrom !== -1 && bestTo !== -1) {
      visited.add(bestTo);
      edges.push({ from: stars[bestFrom], to: stars[bestTo] });
    } else {
      break;
    }
  }

  return edges;
}

export function computeUniverseLayout(config: ConstellationConfig): {
  stars: PositionedStar[];
  clusters: ConstellationCluster[];
  allTags: string[];
} {
  const tagSet = new Set<string>();
  const clusterGroups = new Map<string, StarService[]>();

  for (const svc of config.services) {
    const primaryTag = svc.tags?.[0]?.trim() || 'Uncharted Sector';
    for (const t of svc.tags || []) {
      if (t.trim()) tagSet.add(t.trim());
    }
    if (!clusterGroups.has(primaryTag)) {
      clusterGroups.set(primaryTag, []);
    }
    clusterGroups.get(primaryTag)!.push(svc);
  }

  const clusterNames = Array.from(clusterGroups.keys());
  const allPositionedStars: PositionedStar[] = [];
  const clusters: ConstellationCluster[] = [];

  clusterNames.forEach((tag, clusterIdx) => {
    const groupServices = clusterGroups.get(tag) || [];
    const palette = CLUSTER_PALETTES[clusterIdx % CLUSTER_PALETTES.length];

    // Default sector center on a ring if services don't have explicit positions
    const angle = (clusterIdx / Math.max(1, clusterNames.length)) * Math.PI * 2 - Math.PI * 0.75;
    const ringRadius = clusterNames.length === 1 ? 0 : 480;
    const defaultSectorX = Math.cos(angle) * ringRadius;
    const defaultSectorY = Math.sin(angle) * ringRadius * 0.72;

    const clusterStars: PositionedStar[] = groupServices.map((svc, idx) => {
      const urls = resolveServiceUrls(svc, config);
      if (
        svc.position &&
        typeof svc.position.x === 'number' &&
        typeof svc.position.y === 'number'
      ) {
        return {
          service: svc,
          x: svc.position.x,
          y: svc.position.y,
          constellationTag: tag,
          urls,
        };
      }

      // Deterministic organic placement within the sector for services without explicit coordinates
      const h = hashString(`${svc.id}-${svc.starSlug}-${idx}`);
      const subAngle = ((idx / Math.max(1, groupServices.length)) * Math.PI * 2) + ((h % 100) / 100) * 0.8;
      const subDist = 110 + (idx % 3) * 85 + (h % 55);
      const x = Math.round(defaultSectorX + Math.cos(subAngle) * subDist);
      const y = Math.round(defaultSectorY + Math.sin(subAngle) * subDist);

      return {
        service: svc,
        x,
        y,
        constellationTag: tag,
        urls,
      };
    });

    allPositionedStars.push(...clusterStars);

    // Compute centroid and bounding radius for the constellation nebula & label
    const centerX =
      clusterStars.reduce((acc, s) => acc + s.x, 0) / Math.max(1, clusterStars.length);
    const centerY =
      clusterStars.reduce((acc, s) => acc + s.y, 0) / Math.max(1, clusterStars.length);

    let maxDist = 160;
    for (const s of clusterStars) {
      const d = Math.hypot(s.x - centerX, s.y - centerY) + 110;
      if (d > maxDist) maxDist = d;
    }

    clusters.push({
      tag,
      color: palette.color,
      glowColor: palette.glowColor,
      centerX,
      centerY,
      radius: maxDist,
      stars: clusterStars,
      edges: buildConstellationEdges(clusterStars),
    });
  });

  return {
    stars: allPositionedStars,
    clusters,
    allTags: Array.from(tagSet),
  };
}

export interface BackgroundStar {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  tint: string;
  layer: 1 | 2 | 3;
  twinkleDuration: number;
  twinkleDelay: number;
  hasFlare: boolean;
}

export interface DeepSpaceNebula {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  primaryColor: string;
  secondaryColor: string;
  opacity: number;
  layer: 1 | 2;
}

export function generateAmbientStarfield(count = 340): BackgroundStar[] {
  const tints = [
    '#ffffff',
    '#e0f2fe',
    '#7dd3fc',
    '#fef3c7',
    '#fde68a',
    '#f3e8ff',
    '#c4b5fd',
    '#fecdd3',
  ];
  const stars: BackgroundStar[] = [];

  for (let i = 0; i < count; i++) {
    const h1 = hashString(`bg-star-x-${i}`);
    const h2 = hashString(`bg-star-y-${i}`);
    const h3 = hashString(`bg-star-meta-${i}`);

    const x = (h1 % 4200) - 2100;
    const y = (h2 % 3000) - 1500;
    // Weight more stars into far deep-field layer 1, fewer into foreground layer 3
    const layerRoll = i % 10;
    const layer: 1 | 2 | 3 = layerRoll < 5 ? 1 : layerRoll < 8 ? 2 : 3;
    const size =
      layer === 1
        ? 0.9 + (h3 % 6) * 0.1
        : layer === 2
        ? 1.5 + (h3 % 8) * 0.12
        : 2.2 + (h3 % 10) * 0.15;
    const opacity =
      layer === 1
        ? 0.18 + (h3 % 45) / 100
        : layer === 2
        ? 0.35 + (h3 % 50) / 100
        : 0.55 + (h3 % 40) / 100;
    const tint = tints[h3 % tints.length];
    const twinkleDuration = 2.8 + (h3 % 6);
    const twinkleDelay = (h1 % 50) / 10;
    const hasFlare = layer === 3 && h3 % 7 === 0;

    stars.push({
      id: i,
      x,
      y,
      size,
      opacity,
      tint,
      layer,
      twinkleDuration,
      twinkleDelay,
      hasFlare,
    });
  }

  return stars;
}

export function generateDeepSpaceNebulae(): DeepSpaceNebula[] {
  return [
    {
      id: 1,
      x: -560,
      y: -320,
      width: 980,
      height: 620,
      rotation: -22,
      primaryColor: 'rgba(56, 189, 248, 0.22)',
      secondaryColor: 'rgba(99, 102, 241, 0.14)',
      opacity: 0.75,
      layer: 1,
    },
    {
      id: 2,
      x: 540,
      y: -240,
      width: 900,
      height: 580,
      rotation: 18,
      primaryColor: 'rgba(192, 132, 252, 0.22)',
      secondaryColor: 'rgba(236, 72, 153, 0.12)',
      opacity: 0.7,
      layer: 1,
    },
    {
      id: 3,
      x: -360,
      y: 340,
      width: 860,
      height: 520,
      rotation: 14,
      primaryColor: 'rgba(244, 63, 94, 0.16)',
      secondaryColor: 'rgba(251, 191, 36, 0.11)',
      opacity: 0.65,
      layer: 2,
    },
    {
      id: 4,
      x: 420,
      y: 310,
      width: 920,
      height: 560,
      rotation: -16,
      primaryColor: 'rgba(45, 212, 191, 0.16)',
      secondaryColor: 'rgba(56, 189, 248, 0.12)',
      opacity: 0.65,
      layer: 2,
    },
    {
      id: 5,
      x: 0,
      y: -40,
      width: 1450,
      height: 460,
      rotation: -12,
      primaryColor: 'rgba(129, 140, 248, 0.12)',
      secondaryColor: 'rgba(56, 189, 248, 0.08)',
      opacity: 0.55,
      layer: 1,
    },
  ];
}
