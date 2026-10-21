import {
  AboutSection,
  BackToTopButton,
  ContactSection,
  HeroSection,
  SectionDivider,
  ServicesSection,
  SwordvoicesSection,
} from "@/features/home";
import { PathsSection } from "@/features/paths";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <SectionDivider />
      <ServicesSection />
      <SectionDivider />
      <AboutSection />
      <SectionDivider />
      <SwordvoicesSection />
      <PathsSection />
      <ContactSection />
      <BackToTopButton />
    </main>
  );
}
