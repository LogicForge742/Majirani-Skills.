import { Card, CardContent } from "@/components/ui/card";
import { Hammer, Scissors, Zap, Wrench, PaintBucket, Home } from "lucide-react";

const categories = [
  { name: "Carpentry", icon: Hammer, count: 45 },
  { name: "Tailoring", icon: Scissors, count: 38 },
  { name: "Electrical", icon: Zap, count: 32 },
  { name: "Plumbing", icon: Wrench, count: 28 },
  { name: "Painting", icon: PaintBucket, count: 26 },
  { name: "Home Repair", icon: Home, count: 52 },
];

const ServiceCategories = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Browse by Service</h2>
          <p className="text-xl text-muted-foreground">
            Find the perfect artisan for your needs
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.name}
                className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} artisans</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
