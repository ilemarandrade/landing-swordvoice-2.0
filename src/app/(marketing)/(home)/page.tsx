import {
  AboutSection,
  BackToTopButton,
  ContactSection,
  HeroSection,
  PathsSection,
  SectionDivider,
  ServicesSection,
  SwordvoicesSection,
} from "@/features/home";

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
      <SectionDivider className="relative top-2" />
      <PathsSection />
      <ContactSection />
      <BackToTopButton />
    </main>
  );
}
