import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-artisans.jpg";
import { Search } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/60" />
      </div>
      
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Connect with Trusted Local Artisans
          </h1>
          <p className="text-xl mb-8 text-muted-foreground">
            Find skilled carpenters, tailors, electricians, and more in your community. 
            Building trust, one connection at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Find Artisans
            </Button>
            <Button variant="secondary" size="lg">
              Join as Artisan
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
