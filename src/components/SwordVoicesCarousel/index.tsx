"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SwordvoicesCard from "@/components/SwordvoicesCard";
import swordvoices from "@/constants/swordvoices";
import { useRef } from "react";

const SwordVoicesCarousel =()=>{
    const slider = useRef<Slider>(null);

    const settings = {
      infinite: false,
      dots: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 830,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 590,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
          },
        },
      ],
      autoplay: true,
      autoplaySpeed: 3000,
      pauseOnHover: true,
    };
    return(
        <>
        <Slider ref={slider} {...settings} className="my-slider mb-24 mt-10 mx-4">
          {swordvoices.map((swordvoice, index) => (
            <SwordvoicesCard
              key={`swordvoices-${index}`}
              linkedin={swordvoice.linkedin}
              github={swordvoice.github}
              portfolio={swordvoice.portfolio}
              name={swordvoice.name}
              photo={swordvoice.photo}
              rol={swordvoice.rol}
              description={swordvoice.description}
            />
          ))}
          
        </Slider>
      </>
    )
}

export default SwordVoicesCarousel