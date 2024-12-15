// Noti.js
import React from "react";
import "./styles.css";

const Noti = ({ message }) => {
  return message ? <div className="notification">{message}</div> : null;
};

export default Noti;
