import React from "react";
import { Tooltip } from "antd";
import {
  iconAdd,
  iconComment,
  iconCopyLink,
  iconFontSize,
  iconMinus,
  iconPrint,
  iconSave,
  iconShareFacebook,
} from "../components/IconSvg/iconSvg";

interface StickyButtonProps {
  display: {
    changeFontSize: boolean;
    copyLink: boolean;
    shareFacebook: boolean;
    comment: boolean;
    savePost: boolean;
    printPost: boolean;
  };
  onIncreaseFontSize?: () => void;
  onDefaultFontSize?: () => void;
  onDecreaseFontSize?: () => void;
  copyLink?: () => void;
  comment?: () => void;
  onPrint?: () => void;
}

export const StickyButton: React.FC<StickyButtonProps> = ({
  display,
  onIncreaseFontSize,
  onDefaultFontSize,
  onDecreaseFontSize,
  copyLink,
  comment,
  onPrint,
}) => {
  return (
    <div>
      {display.changeFontSize && (
        <div className="cursor-pointer p-1 bg-white border border-[#dfe0e3] box-border rounded-full block text-center mb-2">
          <div
            className="flex w-6 h-6 box-border items-center justify-center bg-white"
            onClick={() => onIncreaseFontSize?.()}
          >
            {iconAdd}
          </div>
          <div
            className="my-4 flex items-center justify-center"
            onClick={() => onDefaultFontSize?.()}
          >
            {iconFontSize}
          </div>
          <div
            className="flex w-6 h-6 box-border items-center justify-center bg-white"
            onClick={() => onDecreaseFontSize?.()}
          >
            {iconMinus}
          </div>
        </div>
      )}

      {display.copyLink && (
        <Tooltip placement="left" title="Copy link bài viết">
          <div
            className="flex border border-[#dfe0e3] rounded-full w-8 h-8 box-border items-center justify-center bg-white mb-2 cursor-pointer"
            onClick={() => copyLink?.()}
          >
            {iconCopyLink}
          </div>
        </Tooltip>
      )}

      {display.shareFacebook && (
        <Tooltip placement="left" title="Chia sẻ Facebook">
          <div className="flex border border-[#dfe0e3] rounded-full w-8 h-8 box-border items-center justify-center bg-white mb-2 cursor-pointer">
            {iconShareFacebook}
          </div>
        </Tooltip>
      )}

      {display.comment && (
        <Tooltip placement="left" title="Comment">
          <div
            className="flex border border-[#dfe0e3] rounded-full w-8 h-8 box-border items-center justify-center bg-white mb-2 cursor-pointer"
            onClick={() => comment?.()}
          >
            {iconComment}
          </div>
        </Tooltip>
      )}

      {display.savePost && (
        <Tooltip placement="left" title="Lưu">
          <div className="flex border border-[#dfe0e3] rounded-full w-8 h-8 box-border items-center justify-center bg-white mb-2 cursor-pointer">
            {iconSave}
          </div>
        </Tooltip>
      )}

      {display.printPost && (
        <Tooltip placement="left" title="In bài viết">
          <div
            className="flex border border-[#dfe0e3] rounded-full w-8 h-8 box-border items-center justify-center bg-white mb-2 cursor-pointer"
            onClick={() => onPrint?.()}
          >
            {iconPrint}
          </div>
        </Tooltip>
      )}
    </div>
  );
};
