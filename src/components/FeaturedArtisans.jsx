import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const artisans = [
  {
    id: 1,
    name: "John Mwangi",
    skill: "Fundi Seremala",
    location: "Nairobi East",
    rating: 4.9,
    reviews: 127,
    experience: "15 years",
    verified: true,
  },
  {
    id: 2,
    name: "Amina Hassan",
    skill: "Fundi Mshoni",
    location: "Westlands",
    rating: 5.0,
    reviews: 93,
    experience: "10 years",
    verified: true,
  },
  {
    id: 3,
    name: "David Ochieng",
    skill: "Fundi Stima",
    location: "Kilimani",
    rating: 4.8,
    reviews: 156,
    experience: "12 years",
    verified: true,
  },
  {
    id: 4,
    name: "Grace Wambui",
    skill: "Interior Painter",
    location: "Karen",
    rating: 4.9,
    reviews: 84,
    experience: "8 years",
    verified: true,
  },
];

const FeaturedArtisans = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Featured Artisans</h2>
          <p className="text-xl text-muted-foreground">
            Trusted professionals with proven track records
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artisans.map((artisan) => (
            <Card key={artisan.id} className="hover:shadow-lg transition-all border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary">
                    {artisan.name.charAt(0)}
                  </div>
                  {artisan.verified && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold text-lg mb-1 text-foreground">{artisan.name}</h3>
                <p className="text-accent font-medium mb-2">{artisan.skill}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  {artisan.location}
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">{artisan.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({artisan.reviews} reviews)
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {artisan.experience} experience
                </p>
                
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtisans;
