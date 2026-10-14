"use client";
import { Navbar } from "@/common/components/navbar";
import { SERVICES_SECTION_ID } from "@/features/home/constants/sections";
import { useIsPastSection } from "@/features/home/hooks/useIsPastSection";

export function HomeNavbar() {
  const isPastServices = useIsPastSection(SERVICES_SECTION_ID);
  return <Navbar changeLogo={isPastServices} />;
}
