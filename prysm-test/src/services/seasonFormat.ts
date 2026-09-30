/**
 * Season label formatting — single source of truth for season display names.
 *
 * GPT sometimes returns duplicated labels ("OTOÑO OTOÑO PROFUNDO") or
 * placeholder substations ("N/A"). This normalizes them into one clean
 * Spanish label like "Otoño Profundo" or "Invierno".
 */

/** Lowercase + strip accents + collapse separators, for robust key matching. */
export function normalizeKey(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const NA_LIKE = /^(n\/?a|na|ninguna?|none|no aplica|sin subestaci[oó]n|vac[ií]a?|-)$/i;

/**
 * Build a clean season display label from GPT's estacion + subestacion.
 * - Drops N/A-like substations
 * - Removes consecutive duplicated words ("OTOÑO OTOÑO PROFUNDO" -> "Otoño Profundo")
 * - Never appends a substation that is already contained in the base label
 */
export function cleanSeasonLabel(estacion?: string, subestacion?: string): string {
  const est = (estacion || '').trim();
  let sub = (subestacion || '').trim();
  if (NA_LIKE.test(sub)) sub = '';

  // Dedupe consecutive repeated words in estacion (accent/case-insensitive)
  const words = est.split(/\s+/).filter(Boolean);
  const deduped: string[] = [];
  for (const w of words) {
    const prev = deduped[deduped.length - 1];
    if (!prev || normalizeKey(prev) !== normalizeKey(w)) deduped.push(w);
  }
  let base = deduped.join(' ');

  // Append substation only if it adds information not already present.
  // If the substation already contains the base ("Verano" + "Verano suave"),
  // prefer the more specific substation alone instead of duplicating.
  if (sub) {
    const baseNorm = normalizeKey(base);
    const subNorm = normalizeKey(sub);
    if (subNorm) {
      if (baseNorm.includes(subNorm)) {
        // base already contains it — keep base
      } else if (subNorm.includes(baseNorm) && baseNorm) {
        base = sub; // substation is the more specific label
      } else {
        base = base ? `${base} ${sub}` : sub;
      }
    }
  }

  if (!base) return 'Tu temporada';

  // Title case: "Otoño Profundo"
  return base
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
