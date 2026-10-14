import { SectionDivider } from "@/features/home/components/atoms/SectionDivider";
import { AboutSection } from "@/features/home/components/organisms/AboutSection";
import { BackToTopButton } from "@/features/home/components/organisms/BackToTopButton";
import { ContactSection } from "@/features/home/components/organisms/ContactSection";
import { HeroSection } from "@/features/home/components/organisms/HeroSection";
import { HomeNavbar } from "@/features/home/components/organisms/HomeNavbar";
import { PathsSection } from "@/features/home/components/organisms/PathsSection";
import { ServicesSection } from "@/features/home/components/organisms/ServicesSection";
import { SwordvoicesSection } from "@/features/home/components/organisms/SwordvoicesSection";

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
