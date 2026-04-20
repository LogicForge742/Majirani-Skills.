import { Card, CardContent } from "@/components/ui/card";
import { serviceCategories } from "@/data/serviceCategories";

/**
 * Grid of service category cards (carpentry, tailoring, etc.).
 */
const ServiceCategoriesGrid = () => {
  return (
    <section id="services" className="py-20 bg-muted/30" aria-labelledby="services-heading">
      <div className="container">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-4xl font-bold mb-4 text-foreground">
            Browse by Service
          </h2>
          <p className="text-xl text-muted-foreground">
            Find the perfect artisan for your needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {serviceCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.name}
                className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
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

export default ServiceCategoriesGrid;