import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./Context/AuthContext";
import { StompClientProvider } from "./context/StompClientContext";
import { WebRTCProvider } from "./context/WebRTC";
import ChatRoom from "./components/ChatRoom/index";
import CallRoom from "./components/CallRoom/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <StompClientProvider>
          <WebRTCProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/call/:roomId" element={<CallRoom />} />
            </Routes>
          </WebRTCProvider>
        </StompClientProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
