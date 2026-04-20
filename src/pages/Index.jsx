import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/features/search/Hero";
import ServiceCategoriesGrid from "@/features/services/ServiceCategoriesGrid";
import FeaturedArtisans from "@/features/artisans/FeaturedArtisans";
import HowItWorks from "@/features/services/HowItWorks";

/**
 * Public landing page composing all marketing sections.
 */
const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ServiceCategoriesGrid />
        <FeaturedArtisans />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
