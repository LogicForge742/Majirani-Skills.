import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/features/search/Hero";
import ServiceCategoriesGrid from "@/features/services/ServiceCategoriesGrid";
import FeaturedArtisans from "@/features/artisans/FeaturedArtisans";
import HowItWorks from "@/features/services/HowItWorks";

/**
 * Public landing page composing all marketing sections.
 */
const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <ServiceCategoriesGrid />
      <FeaturedArtisans />
      <HowItWorks />
    </MainLayout>
  );
};

export default Index;
