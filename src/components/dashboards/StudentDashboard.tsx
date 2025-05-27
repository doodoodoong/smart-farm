"use client";

import { useState } from "react";
import ChatbotButton from "@/components/ChatbotButton";
import { STUDENT_NAMES } from "@/lib/types";
import FlowingMenu from "@/blocks/Components/FlowingMenu/FlowingMenu";
interface StudentDashboardProps {
  email: string;
}

export default function StudentDashboard({ email }: StudentDashboardProps) {
  const studentName = STUDENT_NAMES[email] || email;
  const [isChatOpen, setIsChatOpen] = useState(false);
  const flowingItems = [
    {
      link: "/learning",
      text: "배운내용 확인하기",
      image: "https://picsum.photos/600/400?random-1",
    },
    {
      link: "/growing",
      text: "식물 관찰 일지 작성하기",
      image: "https://picsum.photos/600/400?random=2",
    },
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10,
          pointerEvents: "none",
        }}
      ></div>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {studentName} 관찰일지
          </h2>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          <div style={{ height: "300px", position: "relative" }}>
            <FlowingMenu items={flowingItems} />
          </div>
        </div>
        <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)} />
      </div>
    </>
  );
}
