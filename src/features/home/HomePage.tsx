import { SectionDivider } from "@/features/home/components/section-divider";
import { AboutSection } from "@/features/home/components/about-section";
import { BackToTopButton } from "@/features/home/components/back-to-top-button";
import { ContactSection } from "@/features/home/components/contact-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { HomeNavbar } from "@/features/home/components/home-navbar";
import { PathsSection } from "@/features/home/components/paths-section";
import { ServicesSection } from "@/features/home/components/services-section";
import { SwordvoicesSection } from "@/features/home/components/swordvoices-section";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeNavbar />
      <HeroSection />
      <SectionDivider />
      <ServicesSection />
      <SectionDivider />
      <AboutSection />
      <SectionDivider />
      <SwordvoicesSection />
      <SectionDivider className="relative top-2" />
      <PathsSection />
      <ContactSection />
      <BackToTopButton />
    </main>
  );
}
