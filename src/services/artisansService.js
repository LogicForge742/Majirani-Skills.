import { featuredArtisans } from "@/data/artisans";

/** @typedef {import('@/types').Artisan} Artisan */

/**
 * Mock service layer. Replace these with real API calls (e.g. fetch / Cloud)
 * without touching components.
 */

/** @returns {Promise<Artisan[]>} */
export async function getFeaturedArtisans() {
  return Promise.resolve(featuredArtisans);
}

/**
 * @param {{ query?: string, location?: string }} [params]
 * @returns {Promise<Artisan[]>}
 */
export async function searchArtisans(params = {}) {
  const { query = "", location = "" } = params;
  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();

  const results = featuredArtisans.filter((a) => {
    const matchQuery = !q || a.skill.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    const matchLocation = !loc || a.location.toLowerCase().includes(loc);
    return matchQuery && matchLocation;
  });

  return Promise.resolve(results);
}