import type { Metadata } from "next";
import { readUsersAdminParams, UsersAdmin } from "@/features/admin";

export const metadata: Metadata = { title: "Usuarios" };

type UsersRouteProps = {
  searchParams: Promise<{
    search?: string | string[];
    page?: string | string[];
    user?: string | string[];
    academyRole?: string | string[];
  }>;
};

export default async function UsersRoute({ searchParams }: UsersRouteProps) {
  return <UsersAdmin {...readUsersAdminParams(await searchParams)} />;
}
