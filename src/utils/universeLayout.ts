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
}

export function generateAmbientStarfield(count = 240): BackgroundStar[] {
  const tints = ['#ffffff', '#e0f2fe', '#fef3c7', '#f3e8ff', '#bae6fd', '#fde68a'];
  const stars: BackgroundStar[] = [];

  for (let i = 0; i < count; i++) {
    const h1 = hashString(`bg-star-x-${i}`);
    const h2 = hashString(`bg-star-y-${i}`);
    const h3 = hashString(`bg-star-meta-${i}`);

    const x = ((h1 % 3600) - 1800);
    const y = ((h2 % 2600) - 1300);
    const layer = ((i % 3) + 1) as 1 | 2 | 3;
    const size = layer === 1 ? 1.1 : layer === 2 ? 1.7 : 2.5;
    const opacity = 0.2 + ((h3 % 65) / 100);
    const tint = tints[h3 % tints.length];
    const twinkleDuration = 3 + (h3 % 5);
    const twinkleDelay = (h1 % 40) / 10;

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
    });
  }

  return stars;
}
