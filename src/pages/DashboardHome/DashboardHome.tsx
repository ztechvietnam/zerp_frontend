import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { environments } from "../../components/constant/constant";
import UserDropdown from "../../components/header/UserDropdown";

const LOCAL_STORAGE_KEY = "selectedEnvironment";

export default function DashboardHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const savedEnv = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedEnv) {
      const env = environments.find((e) => e.key === savedEnv);
      if (env) {
        navigate(env.path, { replace: true });
      }
    }
  }, [navigate]);

  const handleSelect = (envKey: string, path: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, envKey);
    navigate(path);
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundImage: `url('/images/background/bg.jpg')`,
        width: "100%",
        height: "100%",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <header className="sticky top-0 flex w-full z-1000 shadow-[0_2px_6px_0_rgba(1,41,112,0.1)]">
        <div className="flex items-center justify-end grow flex-row lg:px-6 h-[55.6px]">
          <div
            className={`flex items-center w-auto gap-4py-4 justify-end px-0 shadow-none`}
          >
            <UserDropdown />
          </div>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl bg-white border-[1px] border-solid border-[#E8E8E8] rounded-xl p-[40px]">
          {environments.map((env) => (
            <div
              key={env.key}
              className="bg-[#f2fbff] shadow-md transition-all hover:shadow-xl cursor-pointer p-6 flex items-center gap-4 rounded-lg border border-solid border-[#91D5FF]"
              onClick={() => handleSelect(env.key, env.path)}
            >
              <div
                className="bg-[#FFFFFF] h-[64px] min-h-[64px] w-[64px] min-w-[64px] rounded-xl flex items-center justify-center iconHomepage"
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.12) 0px 8px 24px 0px, rgba(0, 0, 0, 0.04) 0px 2.59px 3.46px 0px, rgba(0, 0, 0, 0.08) 0px -1px 2px 0px",
                }}
              >
                {env.icon}
              </div>
              <div className="text-[16px] font-bold leading-[20.8px] text-[#262626] uppercase">
                {env.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
