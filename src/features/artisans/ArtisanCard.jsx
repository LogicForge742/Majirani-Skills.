import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

/** @typedef {import('@/types').Artisan} Artisan */

/**
 * Single artisan profile preview card.
 * @param {{ artisan: Artisan, onView?: (artisan: Artisan) => void }} props
 */
const ArtisanCard = ({ artisan, onView }) => {
  return (
    <Card className="hover:shadow-lg transition-all border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary"
            aria-hidden="true"
          >
            {artisan.name.charAt(0)}
          </div>
          {artisan.verified && (
            <Badge className="bg-primary/10 text-primary border-primary/20">Verified</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold text-lg mb-1 text-foreground">{artisan.name}</h3>
        <p className="text-accent font-medium mb-2">{artisan.skill}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span>{artisan.location}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
            <span className="font-semibold text-foreground">{artisan.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({artisan.reviews} reviews)</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{artisan.experience} experience</p>

        <Button variant="outline" className="w-full" onClick={() => onView?.(artisan)}>
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArtisanCard;