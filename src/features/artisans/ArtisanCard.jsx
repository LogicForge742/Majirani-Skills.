import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, MapPin, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationBadge from "@/features/verification/VerificationBadge";

/** @typedef {import('@/types').Artisan} Artisan */

/**
 * Single artisan profile preview card.
 * @param {{ artisan: Artisan, onView?: (artisan: Artisan) => void }} props
 */
const ArtisanCard = ({ artisan, onView }) => {
  const previewPhotos = artisan.portfolio?.slice(0, 3) ?? [];

  return (
    <Card className="hover:shadow-lg transition-all border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary"
            aria-hidden="true"
          >
            {artisan.user?.name?.charAt(0) ?? artisan.name?.charAt(0) ?? "?"}
          </div>
          <VerificationBadge verified={artisan.verified} size="sm" />
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="font-bold text-lg mb-1 text-foreground">
          {artisan.user?.name ?? artisan.name}
        </h3>
        <p className="text-accent font-medium mb-2">{artisan.skill}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span>{artisan.location || [artisan.town, artisan.county].filter(Boolean).join(", ")}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
            <span className="font-semibold text-foreground">{artisan.rating ?? 0}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({artisan.reviewCount ?? artisan.reviews ?? 0} reviews)
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{artisan.experience} experience</p>

        {/* Portfolio preview strip */}
        {previewPhotos.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {previewPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-1 aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Portfolio"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {artisan.portfolio?.length > 3 && (
              <div className="flex-1 aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-400">
                  +{artisan.portfolio.length - 3}
                </span>
              </div>
            )}
          </div>
        )}

        {previewPhotos.length === 0 && artisan.portfolio !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Images className="w-3.5 h-3.5" />
            <span>No portfolio photos yet</span>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={() => onView?.(artisan)}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArtisanCard;