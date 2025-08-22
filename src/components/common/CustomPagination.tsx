import { Button } from "antd";
import { nextSvg, previousSvg } from "../IconSvg/iconSvg";

interface CustomPaginationProps {
  pageIndex: number;
  hasNextPage: boolean;
  onChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  pageIndex,
  hasNextPage,
  onChange,
}) => {
  const pages = Array.from({ length: pageIndex }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 mt-4 justify-end">
      <Button
        disabled={pageIndex === 1}
        onClick={() => onChange(pageIndex - 1)}
        className={`w-[32px] flex items-center justify-center !p-0 !border-transparent !bg-transparent !shadow-none ${
          pageIndex !== 1 && "hover:!bg-[#0000000f] hover:!text-[#000000e0]"
        }`}
      >
        {previousSvg(12)}
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          type={page === pageIndex ? "primary" : "default"}
          onClick={() => onChange(page)}
          className={`w-[32px] flex items-center justify-center !p-0 !border-none !bg-[#fff] hover:!bg-[#0000000f] !shadow-none ${
            page === pageIndex &&
            "hover:!bg-[#fff] !text-[#1677ff] !border-[#1677ff] font-medium"
          }`}
        >
          {page}
        </Button>
      ))}

      {hasNextPage && (
        <Button
          type="default"
          onClick={() => onChange(pageIndex + 1)}
          className={`w-[32px] flex items-center justify-center !p-0 !border-none !bg-[#fff] hover:!bg-[#0000000f] !shadow-none`}
        >
          ...
        </Button>
      )}

      <Button
        disabled={!hasNextPage}
        onClick={() => onChange(pageIndex + 1)}
        className={`w-[32px] flex items-center justify-center !p-0 !border-transparent !bg-transparent !shadow-none ${
          hasNextPage && "hover:!bg-[#0000000f] hover:!text-[#000000e0]"
        }`}
      >
        {nextSvg(12)}
      </Button>
    </div>
  );
};

export default CustomPagination;
