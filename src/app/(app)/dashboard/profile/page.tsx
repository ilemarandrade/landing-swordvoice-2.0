import type { Metadata } from "next";
import { ProfileSection } from "@/features/profile";

export const metadata: Metadata = { title: "Mi perfil" };

export default function ProfilePage() {
  return <ProfileSection />;
}
