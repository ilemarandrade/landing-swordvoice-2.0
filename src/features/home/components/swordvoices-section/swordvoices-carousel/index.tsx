"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import type { Mentor } from "@/features/home/schemas/mentor.schema";
import { SwordvoicesCard } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card";
import { useSlidesToShow } from "@/features/home/hooks/useSlidesToShow";

const settings = {
  dots: true,
  speed: 500,
  arrows: false,
  slidesToScroll: 1,
  customPaging: () => (
    <div
      style={{
        width: "20px",
        height: "20px",
      }}
      className="border-primary border-[3px] rounded-full bg-white dots mt-4"
    ></div>
  ),
  autoplaySpeed: 3000,
  pauseOnHover: true,
};

type SwordVoicesCarouselProps = { mentors: Mentor[] };

export function SwordVoicesCarousel({ mentors }: SwordVoicesCarouselProps) {
  const { slidesToShow } = useSlidesToShow();
  // Con menos mentores que huecos no hay nada que girar: se muestran todos
  // y no se duplican cards en el bucle.
  const shown = Math.min(slidesToShow, mentors.length);
  const loops = mentors.length > shown;

  // react-slick no aplica cambios de slidesToShow tras montar: se remonta.
  return (
    <Slider
      key={shown}
      {...settings}
      slidesToShow={shown}
      infinite={loops}
      autoplay={loops && slidesToShow < 4}
      className="my-slider mb-24 mt-10 mx-4 [&_.slick-track]:flex [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full"
    >
      {mentors.map((mentor) => (
        <SwordvoicesCard key={mentor.id} mentor={mentor} className="mx-6" />
      ))}
    </Slider>
  );
}
