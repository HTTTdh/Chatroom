import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthContext, AuthProvider } from "./Context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatRoom from "./components/ChatRoom/index";
import Profile from "./components/MyProfile/profile";
import Notification from "./components/Notification/Notification";
import { StompClientProvider } from "./context/StompClientContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <StompClientProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/chat/:roomId" element={<ChatRoom />} />
            <Route path="/myprofile" element={<Profile />} />
            <Route path="/mynotification" element={<Notification />} />
          </Routes>
        </StompClientProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
