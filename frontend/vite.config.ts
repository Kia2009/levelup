import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // این خط را اضافه کنید
    port: 5173, // پورت پیش‌فرض Vite است، می‌توانید تغییر دهید
  },
});
