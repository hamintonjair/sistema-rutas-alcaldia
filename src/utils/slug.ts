import { AttentionRoute, Entity } from '../types';

/**
 * Converts a text string into a URL-friendly slug.
 * Removes diacritics (tildes/accents), special characters, and trims dashes.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Finds a route by matching ID, exact slug of name, or slug of serviceName.
 */
export function matchRoute(param: string | undefined, routes: AttentionRoute[]): AttentionRoute | undefined {
  if (!param) return undefined;
  const cleanParam = decodeURIComponent(param).trim().toLowerCase();
  
  // 1. Direct ID match
  const byId = routes.find((r) => r.id.toLowerCase() === cleanParam);
  if (byId) return byId;

  // 2. Slug match by route name
  const byNameSlug = routes.find((r) => slugify(r.name) === cleanParam);
  if (byNameSlug) return byNameSlug;

  // 3. Slug match by service name
  const byServiceSlug = routes.find((r) => slugify(r.serviceName) === cleanParam);
  if (byServiceSlug) return byServiceSlug;

  return undefined;
}

/**
 * Finds an entity by matching ID, code (sigla), or slug of name.
 */
export function matchEntity(param: string | undefined, entities: Entity[]): Entity | undefined {
  if (!param) return undefined;
  const cleanParam = decodeURIComponent(param).trim().toLowerCase();

  // 1. Direct ID match
  const byId = entities.find((e) => e.id.toLowerCase() === cleanParam);
  if (byId) return byId;

  // 2. Match by code / sigla
  const byCode = entities.find(
    (e) => e.code.toLowerCase() === cleanParam || (e.sigla && e.sigla.toLowerCase() === cleanParam)
  );
  if (byCode) return byCode;

  // 3. Match by name slug
  const byNameSlug = entities.find((e) => slugify(e.name) === cleanParam);
  if (byNameSlug) return byNameSlug;

  return undefined;
}
