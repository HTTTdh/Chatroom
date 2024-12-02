import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ImageSlider.css";

const ImageSlider = () => {
  const images = [
    "/1.png",
    "/2.png",
    "/3.png",
    "/4.png",
    "https://chat.zalo.me/assets/quick-message-onboard.3950179c175f636e91e3169b65d1b3e2.png",
  ];

  const settings = {
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };

  return (
    <div className="welcome-text homemain">
      <h1>Chào mừng bạn đã đến với </h1>
      <span
        className="Textlogo"
        style={{ fontSize: " 4rem", letterSpacing: "5px" }}
      >
        BKConnect
      </span>
      <p>
        Khám phá những tiện ích hỗ trợ làm việc, quản lý tệp tin và trò chuyện
        cùng người thân, bạn bè của bạn
      </p>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "auto",
          margin: "20px auto",
        }}
      >
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index}>
              <img
                src={img}
                alt={`Slide ${index}`}
                style={{ width: "100%", height: "auto", borderRadius: "10px" }}
              />
            </div>
          ))}
        </Slider>
      </div>
      <p>
        Hãy tìm kiếm kết nối với mọi người xung quanh và cùng trải nghiệm{" "}
        <span className="Textlogo">BKConnect</span> nhé!
      </p>
    </div>
  );
};

export default ImageSlider;
