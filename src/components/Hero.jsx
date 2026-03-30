import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-artisans.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Pata <span className="text-primary">Fundi</span> wa Kuaminika Karibu Nawe
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with skilled carpenters, tailors, electricians, and more in your community. Quality work, verified professionals.
          </p>
          
          <div className="bg-card/90 backdrop-blur p-4 rounded-lg shadow-lg border border-border">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="What service do you need?"
                  className="pl-10 bg-background"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Your location"
                  className="pl-10 bg-background"
                />
              </div>
              <Button size="lg" variant="hero" className="md:w-auto">
                Search Artisans
              </Button>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Carpentry", "Plumbing", "Electrical", "Tailoring"].map((service) => (
              <Button 
                key={service}
                variant="outline" 
                size="sm"
                className="text-xs"
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
