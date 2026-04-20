import { useEffect, useState } from "react";
import { getFeaturedArtisans } from "@/services/artisansService";
import ArtisanCard from "./ArtisanCard";

/** @typedef {import('@/types').Artisan} Artisan */

/**
 * Section that loads and renders the featured artisans grid.
 * Uses the service layer so it can later swap to a real API.
 */
const FeaturedArtisans = () => {
  /** @type {[Artisan[], Function]} */
  const [artisans, setArtisans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getFeaturedArtisans()
      .then((data) => mounted && setArtisans(data))
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="artisans" className="py-20" aria-labelledby="artisans-heading">
      <div className="container">
        <div className="text-center mb-12">
          <h2 id="artisans-heading" className="text-4xl font-bold mb-4 text-foreground">
            Featured Artisans
          </h2>
          <p className="text-xl text-muted-foreground">
            Trusted professionals with proven track records
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading artisans...</p>
        ) : artisans.length === 0 ? (
          <p className="text-center text-muted-foreground">No artisans available right now.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArtisans;