export type AstralType =
  | 'blue-giant'
  | 'golden-star'
  | 'red-dwarf'
  | 'ringed-planet'
  | 'pulsar'
  | 'nebula-core';

export interface StarService {
  id: string;
  /** Friendly service display name (e.g., "Home Assistant", "Jellyfin Cinema") */
  name: string;
  /** Astronomical designation (e.g., "Alpha Draconis", "Beta Orionis (Rigel)") */
  starName: string;
  /**
   * Star subdomain slug (e.g., "draconis", "orionis", "centauri").
   * Automatically resolves to:
   * - Primary (-a): https://{starSlug}-a.{defaultDomain}
   * - Secondary (-b): https://{starSlug}-b.{defaultDomain}
   */
  starSlug: string;
  /**
   * Tags for filtering and grouping.
   * The first tag determines the primary Constellation cluster on the star map.
   */
  tags: string[];
  /** Brief description of the service */
  description?: string;
  /** Visual astral body class on the universe canvas */
  astralType: AstralType;
  /** Whether this star system has a Secondary (-b) companion endpoint */
  hasSecondary: boolean;
  /** Optional custom label for the Primary (-a) endpoint */
  primaryLabel?: string;
  /** Optional custom label for the Secondary (-b) endpoint */
  secondaryLabel?: string;
  /** Optional explicit override for the Primary (-a) URL */
  primaryUrl?: string;
  /** Optional explicit override for the Secondary (-b) URL */
  secondaryUrl?: string;
  /** Optional custom universe coordinates; if omitted, auto-arranged in its constellation */
  position?: {
    x: number;
    y: number;
  };
}

export interface ConstellationConfig {
  title: string;
  subtitle: string;
  /** Base domain used to construct {starSlug}-a.{defaultDomain} and {starSlug}-b.{defaultDomain} */
  defaultDomain: string;
  protocol: 'https' | 'http';
  openInNewTab: boolean;
  services: StarService[];
}

export interface ResolvedUrls {
  primaryUrl: string;
  secondaryUrl: string | null;
  primaryHost: string;
  secondaryHost: string | null;
}

export type HealthState = 'online' | 'degraded' | 'offline' | 'checking' | 'unknown';

export interface EndpointHealth {
  url: string;
  status: HealthState;
  code?: number;
  latencyMs?: number;
  protectedByAccess?: boolean;
  note?: string;
}

export interface PositionedStar {
  service: StarService;
  x: number;
  y: number;
  constellationTag: string;
  urls: ResolvedUrls;
}

export interface ConstellationCluster {
  tag: string;
  color: string;
  glowColor: string;
  centerX: number;
  centerY: number;
  radius: number;
  stars: PositionedStar[];
  edges: Array<{ from: PositionedStar; to: PositionedStar }>;
}
