import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyUsSection from "@/components/WhyUsSection";
import ProductsSection from "@/components/ProductsSection";
import OurWorkSection from "@/components/OurWorkSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SEO from "@/components/SEO";

const Index = () => (
  <>
    <SEO
      title="Triple A Tech Solutions | Kenya's Trusted Security & Tech Partner"
      description="Leading physical security, cyber security & IT solutions provider in Kenya. CCTV, access control, penetration testing, network security & more."
      path="/"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Triple A Tech Solutions",
        description: "Comprehensive physical security, cyber security & tech solutions in Kenya",
        url: "https://triple-a-tech-solutions.lovable.app",
        telephone: "+254112860205",
        email: "info@tripleatechsolutions.co.ke",
        address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
      }}
    />
    <Navbar />
    <main className="pt-16">
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ProductsSection />
      <OurWorkSection />
      <TestimonialsSection />
      <ContactSection />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Index;
