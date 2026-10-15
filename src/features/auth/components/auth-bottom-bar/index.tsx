import Link from "next/link";
import { routes } from "@/common/constants/routes";
import { SITE_NAME } from "@/common/constants/site";

export function AuthBottomBar() {
  return (
    <div className="relative z-10 flex flex-wrap justify-between gap-3 bg-black px-4 py-4 text-[13px] text-[#9A9AAE] md:px-12">
      <span>
        © {new Date().getFullYear()} {SITE_NAME}
      </span>
      <span className="flex gap-5">
        <Link href={routes.TERMS} className="text-[#C9C9D6] hover:text-primary">
          Términos
        </Link>
        <Link href={routes.PRIVACY} className="text-[#C9C9D6] hover:text-primary">
          Privacidad
        </Link>
      </span>
    </div>
  );
}
