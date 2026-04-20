import { useState } from "react";
import { searchArtisans } from "@/services/artisansService";

/** @typedef {import('@/types').Artisan} Artisan */

/**
 * Hook that manages artisan search query state and results.
 * Wired to the mock service today; swap the service for a real API later.
 */
export function useArtisanSearch() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  /** @type {[Artisan[], Function]} */
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function search() {
    setIsLoading(true);
    try {
      const data = await searchArtisans({ query, location });
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  }

  return { query, setQuery, location, setLocation, results, isLoading, search };
}