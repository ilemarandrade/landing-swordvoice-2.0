"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SwordvoicesCard } from "@/features/home/components/swordvoices-section/swordvoices-carousel/swordvoices-card";
import { swordvoices } from "@/features/home/constants/swordvoices";
import { useSlidesToShow } from "@/features/home/hooks/useSlidesToShow";

const settings = {
  dots: true,
  speed: 500,
  arrows: false,
  infinite: true,
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

export function SwordVoicesCarousel() {
  const { slidesToShow } = useSlidesToShow();

  // react-slick no aplica cambios de slidesToShow tras montar: se remonta.
  return (
    <Slider
      key={slidesToShow}
      {...settings}
      slidesToShow={slidesToShow}
      autoplay={slidesToShow < 4}
      className="my-slider mb-24 mt-10 mx-4 [&_.slick-track]:flex [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full"
    >
      {swordvoices.map((swordvoice) => (
        <SwordvoicesCard
          key={swordvoice.name}
          swordvoice={swordvoice}
          className="mx-6"
        />
      ))}
    </Slider>
  );
}
