import { Search, UserCheck, MessageCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Tafuta Fundi",
    description: "Pata mafundi kwa huduma, eneo, na maoni katika mtaa wako",
  },
  {
    icon: UserCheck,
    title: "Angalia Wasifu",
    description: "Kagua kazi zao, maoni, na vyeti kabla ya kuchagua",
  },
  {
    icon: MessageCircle,
    title: "Wasiliana Moja kwa Moja",
    description: "Ongea na fundi kuhusu mradi wako na mahitaji yako",
  },
  {
    icon: Star,
    title: "Acha Maoni",
    description: "Shiriki uzoefu wako kusaidia wengine kufanya maamuzi bora",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Find trusted artisans in four simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="relative border-border">
                <CardContent className="pt-12 pb-8 text-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
