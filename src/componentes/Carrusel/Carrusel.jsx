import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../Carrusel/Carrusel.css";
import carrusel1 from "../../imagenes/carrusel/img1_carrusel.jpg";
import carrusel2 from "../../imagenes/carrusel/img2_carrusel.jpg";
import carrusel3 from "../../imagenes/carrusel/img3_carrusel.jpeg";

const Carrusel = () => (
  <div className="carrusel-container">
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
      className="mySwiper"
    >
      <SwiperSlide>
        <div className="slide-wrapper">
          <img src={carrusel1} alt="Banner" />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="slide-wrapper">
          <img src={carrusel2} alt="Banner" />
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
);

export default Carrusel;
