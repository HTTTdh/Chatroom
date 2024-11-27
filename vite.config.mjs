// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
// });
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    // cors: true,
  },
  plugins: [react()],
});
