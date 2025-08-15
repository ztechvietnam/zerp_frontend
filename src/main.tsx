import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { App as AntdApp } from "antd";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import "dayjs/locale/vi";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ConfigProvider locale={viVN}>
        <AppWrapper>
          <AntdApp>
            <App />
          </AntdApp>
        </AppWrapper>
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>
);
