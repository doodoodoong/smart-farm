"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChatModal from "./ChatModal";

interface ChatbotButtonProps {
  onClick?: () => void;
  fixed?: boolean;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  onClick,
  fixed = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
    onClick?.();
  };

  return (
    <>
      <div className={fixed ? "fixed bottom-6 right-6 z-50" : "z-50"}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleClick}
                size="lg"
                className="rounded-full w-14 h-14 bg-primary hover:bg-white hover:text-primary transition-colors duration-200 shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-gray-700">
              <p>모르는게 있을 때 물어보세요</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ChatbotButton;
