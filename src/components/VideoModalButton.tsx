"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PlayCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VisuallyHidden: React.FC<React.PropsWithChildren> = ({ children }) => (
  <span
    style={{
      border: 0,
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);

interface VideoModalButtonProps {
  fixed?: boolean;
}

const VideoModalButton: React.FC<VideoModalButtonProps> = ({
  fixed = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={fixed ? "fixed bottom-6 right-24 z-50" : "z-50"}>
        {" "}
        {/* 챗봇 버튼과 겹치지 않게 우측 여백 조정 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className="rounded-full w-14 h-14 bg-[#FF0000] hover:bg-[#CC0000] text-white transition-colors duration-200 shadow-lg"
              >
                <PlayCircle className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-gray-700">
              <p>식물이 잘 자라는 조건</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-full aspect-video p-0 flex items-center justify-center">
          <VisuallyHidden>
            <DialogTitle id="video-dialog-title">
              식물이 잘 자라는 조건 유튜브 영상
            </DialogTitle>
          </VisuallyHidden>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/Jovfqe6-Eh8"
            title="식물이 잘 자라는 조건"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-labelledby="video-dialog-title"
            className="rounded-lg w-full h-[360px] md:h-[400px]"
          ></iframe>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoModalButton;
