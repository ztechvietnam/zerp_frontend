import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { App as AntdApp } from "antd";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import "dayjs/locale/vi";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ConfigProvider locale={viVN}>
        <AppWrapper>
          <AntdApp>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AntdApp>
        </AppWrapper>
      </ConfigProvider>
    </ThemeProvider>
  </StrictMode>
);
