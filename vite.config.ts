import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    host: true, // cho phép truy cập từ IP hoặc domain
    port: 5173,
    allowedHosts: ["zerp.hih.vn"],
    hmr: {
      host: "zerp.hih.vn", // 👈 để WebSocket trỏ đúng domain bạn đang dùng
      protocol: "wss", // nếu bạn đang dùng HTTPS
      clientPort: 443, // port thực tế bạn truy cập (https mặc định 443)
    },
  },
  optimizeDeps: {
    exclude: ['chunk-5QZXEGFM']
  }
});
