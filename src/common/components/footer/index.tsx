import Link from "next/link";
import { ButtonLink } from "@/common/components/button-link";
import { FooterColumn } from "@/common/components/footer/footer-column";
import { accountLinks, legalLinks } from "@/common/constants/footerLinks";
import { navLinks } from "@/common/constants/navLinks";
import { routes } from "@/common/constants/routes";
import { SITE_NAME } from "@/common/constants/site";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-primary bg-black text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-10 px-4 pb-8 pt-10 md:px-12 md:pt-16">
        <div className="flex max-w-[360px] flex-[1_1_280px] flex-col gap-3.5">
          <Link
            href={routes.HOME}
            className="font-sedgwick text-4xl text-white no-underline"
          >
            Swordvoice
          </Link>
          <p className="text-[15px] leading-relaxed text-[#C9C9D6]">
            <strong className="text-white">Academia online</strong> no
            tradicional. Mentorías para developers y diseñadores que quieren su
            primer trabajo en tech.
          </p>
        </div>
        <FooterColumn title="Explorar" links={navLinks} />
        <FooterColumn title="Cuenta" links={accountLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-[13px] text-[#9A9AAE] md:px-12">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos
            reservados.
          </span>
          <ButtonLink href={routes.REGISTER} label="Registrarme" />
        </div>
      </div>
    </footer>
  );
}
