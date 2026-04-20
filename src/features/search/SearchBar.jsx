import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

/**
 * Service + location search input pair with submit button.
 * Controlled component — parent owns the state.
 *
 * @param {{
 *   query: string,
 *   location: string,
 *   onQueryChange: (v: string) => void,
 *   onLocationChange: (v: string) => void,
 *   onSubmit: () => void,
 *   isLoading?: boolean
 * }} props
 */
const SearchBar = ({ query, location, onQueryChange, onLocationChange, onSubmit, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border"
      role="search"
      aria-label="Find an artisan"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="search-service" className="sr-only">Service</label>
          <Input
            id="search-service"
            placeholder="What service do you need?"
            className="pl-10 bg-background"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="search-location" className="sr-only">Location</label>
          <Input
            id="search-location"
            placeholder="Your location"
            className="pl-10 bg-background"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" variant="hero" className="md:w-auto" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search Artisans"}
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;