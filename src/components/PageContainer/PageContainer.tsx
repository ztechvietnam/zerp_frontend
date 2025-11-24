import React, { forwardRef } from "react";

export interface PageContainerProps {
  children?: React.ReactNode;
  /**
   * Toolbar trái
   */
  toolbarLeft?: React.ReactNode;
  /**
   * Toolbar phải
   */
  toolbarRight?: React.ReactNode;

  className?: string;
}

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ children, toolbarLeft, toolbarRight, className }, ref) => {
    const toolbarComp =
      toolbarLeft || toolbarRight ? (
        <div className="flex items-center h-[auto] pb-[10px]">
          <div className="flex items-center text-[15px] text-gray-600 font-sans">
            {toolbarLeft}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[15px] text-gray-600 font-sans">
            {toolbarRight}
          </div>
        </div>
      ) : null;

    return (
      <div ref={ref} className={`flex flex-col w-full h-full ${className}`}>
        {toolbarComp}
        {children}
      </div>
    );
  }
);

export default React.memo(PageContainer);
