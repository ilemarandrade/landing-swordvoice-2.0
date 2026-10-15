import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/common/api/getQueryClient";
import {
  AboutSection,
  BackToTopButton,
  ContactSection,
  HeroSection,
  SectionDivider,
  ServicesSection,
  SwordvoicesSection,
} from "@/features/home";
import {
  PathsSection,
  pathDetailQueryOptions,
  pathsQueryOptions,
} from "@/features/paths";

export default async function HomePage() {
  const queryClient = getQueryClient();
  // prefetchQuery no lanza: si la API falla, la sección muestra su error en el cliente.
  await queryClient.prefetchQuery(pathsQueryOptions());
  const paths = queryClient.getQueryData(pathsQueryOptions().queryKey);
  await Promise.all(
    (paths?.items ?? []).map((path) =>
      queryClient.prefetchQuery(pathDetailQueryOptions(path.slug)),
    ),
  );

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
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PathsSection />
      </HydrationBoundary>
      <ContactSection />
      <BackToTopButton />
    </main>
  );
}
