import React from "react";
import "./Sidebar.css";
import { useAuth } from "../../hooks/useAuth";

const UnAuthenSidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        style={{ background: "white", height: "108px", gap: "10px" }}
      >
        <img src="/image.png" alt="Logo" className="logo" />
        <p className="Textlogo" style={{ marginTop: "16px" }}>
          BKConnect
        </p>
      </div>
    </div>
  );
};

export default UnAuthenSidebar;
