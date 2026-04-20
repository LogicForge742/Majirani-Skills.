import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-artisans.jpg";
import { popularServices } from "@/data/serviceCategories";
import { useArtisanSearch } from "@/hooks/useArtisanSearch";
import SearchBar from "./SearchBar";

/**
 * Landing hero with headline, search bar, and popular service shortcuts.
 */
const Hero = () => {
  const { query, setQuery, location, setLocation, search, isLoading } = useArtisanSearch();

  return (
    <section className="relative min-h-[600px] flex items-center" aria-labelledby="hero-heading">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="presentation"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Pata <span className="text-primary">Fundi</span> wa Kuaminika Karibu Nawe
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with skilled carpenters, tailors, electricians, and more in your community. Quality work, verified professionals.
          </p>

          <SearchBar
            query={query}
            location={location}
            onQueryChange={setQuery}
            onLocationChange={setLocation}
            onSubmit={search}
            isLoading={isLoading}
          />

          <div className="mt-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularServices.map((service) => (
              <Button
                key={service}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setQuery(service)}
              >
                {service}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;