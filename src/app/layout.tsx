import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swordvoice Academy",
  description:
    "Swordvoice.com has being designed to be an Online Community of professionals, amateurs, self-taught and enthusiats web and mobile app developers, UI/UX designers and tech adicts that want to be up to date about the latest technologies, programing languages and paradigms, coding practices, FrontEnd and BackEnd frameworks and libraries, news, and trends.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
