"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SwordvoicesCard from "@/components/SwordvoicesCard";
import swordvoices from "@/constants/swordvoices";
import { useRef } from "react";

const SwordVoicesModule =()=>{
    const slider = useRef<Slider>(null);

    const settings = {
      dots: true,
      speed: 500,
      arrows: false,
      infinite: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      variableWidth: true,
      customPaging: () => (
        <div
          style={{
            width: "20px",
            height: "20px",
          }}
          className="border-primary border-[3px] rounded-full bg-white dots"
        ></div>
      ),
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
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 590,
          settings: {
            centerMode: true,
            slidesToShow: 1,
            slidesToScroll: 1,
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
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation"
            />
          ))}
        </Slider>
      </>
    )
}

export default SwordVoicesModule