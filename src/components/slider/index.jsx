import React from "react";
import "./slider.css";

const Slider = ({ percent = 1 }) => {
  const style = {
    width: `${percent * 100}%`,
    backgroundColor: `rgb(${(1-percent) * 255}, 0, ${percent * 255})`,
  };
  return (
    <div className="slider-container">
      <div className="slider-slide" style={style}/>
    </div>
  );
};

export default Slider;
