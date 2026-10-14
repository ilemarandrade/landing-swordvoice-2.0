import World from "@/common/assets/icons/World";
import { Typography } from "@/common/components/typography";
import { ContactForm } from "@/features/home/components/contact-section/contact-form";

export function ContactSection() {
  return (
    <div
      id="contact_us"
      className="h-auto xl:min-h-screen w-full p-12 grid grid-cols-1 md:grid-cols-2 bg-contactUs bg-cover relative"
    >
      <div className="absolute inset-0 z-1 bg-black opacity-55"></div>
      <ContactForm />
      <div className="flex flex-col items-center p-4 z-10">
        <Typography
          variant="h1"
          className="text-center mb-8 text-secondary hidden md:block font-sedgwick"
        >
          Contáctanos
        </Typography>
        <div className="mb-6 w-full md:w-[90%] lg:w-[70%] max-w-md">
          <World />
        </div>
      </div>
    </div>
  );
}
