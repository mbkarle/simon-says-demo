import React from "react";
import "./simon.css";
import Slider from "../slider";

const Simon = ({ duration, remaining = duration, simonSays, instruction }) => {
  return (
    <div className="simon-container">
      <div className="simon-text">{simonSays ? "Simon Says:" : "..."}</div>
      <div className="simon-text">{instruction}</div>
      <Slider percent={remaining/duration}/>
    </div>
  );
};

export default Simon;
