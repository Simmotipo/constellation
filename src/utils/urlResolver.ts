import { ConstellationConfig, ResolvedUrls, StarService } from '../types/constellation';

function normalizeUrl(raw: string, defaultProtocol: 'https' | 'http'): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `${defaultProtocol}://${trimmed}`;
}

function extractHost(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return u.host + (u.pathname && u.pathname !== '/' ? u.pathname : '');
  } catch {
    return urlStr.replace(/^https?:\/\//i, '');
  }
}

export function resolveServiceUrls(
  service: StarService,
  config: Pick<ConstellationConfig, 'defaultDomain' | 'protocol'>
): ResolvedUrls {
  const protocol = config.protocol || 'https';
  const cleanDomain = (config.defaultDomain || 'domain.com')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
  const cleanSlug = (service.starSlug || service.id || 'star')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  const primaryUrl = service.primaryUrl?.trim()
    ? normalizeUrl(service.primaryUrl, protocol)
    : `${protocol}://${cleanSlug}-a.${cleanDomain}`;

  const secondaryUrl = service.hasSecondary
    ? service.secondaryUrl?.trim()
      ? normalizeUrl(service.secondaryUrl, protocol)
      : `${protocol}://${cleanSlug}-b.${cleanDomain}`
    : null;

  return {
    primaryUrl,
    secondaryUrl,
    primaryHost: extractHost(primaryUrl),
    secondaryHost: secondaryUrl ? extractHost(secondaryUrl) : null,
  };
}
