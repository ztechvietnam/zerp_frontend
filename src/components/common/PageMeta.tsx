import { useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { ServiceBase } from "../../common/services/servicebase";
import { authService } from "../../common/services/auth/authService";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    ServiceBase.setConfig(import.meta.env.VITE_API_URL);
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      ServiceBase.setToken(savedToken);
      ServiceBase.setTokenRefresher(async () => {
        const rToken = localStorage.getItem("refresh_token");
        if (!rToken) throw new Error("No refresh token");

        const refreshed = await authService.refresh(rToken);
        localStorage.setItem("access_token", refreshed.token);
        ServiceBase.setToken(refreshed.token);
      });
    }
  }, []);

  return <HelmetProvider>{children}</HelmetProvider>;
};

export default PageMeta;
