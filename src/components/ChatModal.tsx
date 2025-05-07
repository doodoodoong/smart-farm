"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OpenAI from "openai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "당신은 학생들의 식물관찰재배일지 작성 및 식물관찰 과학학습을 도와주는 AI 어시스턴트입니다. 초등학생들이 이해하기 쉽게 이야기해줘야하고 식물 관련 전문 과학지식을 가진 전문가입니다. 학생들이 물어보는 답을 직접적으로 알려주면 안되고 학생들이 스스로 해결할 수 있도록 힌트를 제공해주세요.",
          },
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user", content: input },
        ],
      });

      const botMessage: ChatMessage = {
        role: "assistant",
        content:
          response.choices[0]?.message?.content ||
          "죄송합니다. 응답을 생성하는데 문제가 발생했습니다.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("OpenAI API 오류:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "죄송합니다. 요청을 처리하는 동안 오류가 발생했습니다.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-[500px] h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-4 py-2 border-b shrink-0">
          <DialogTitle>챗봇 도우미</DialogTitle>
        </DialogHeader>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* 입력 영역 */}
        <form onSubmit={handleSubmit} className="p-4 border-t mt-auto shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "전송 중..." : "전송"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
