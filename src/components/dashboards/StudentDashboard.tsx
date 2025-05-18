"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ChatbotButton from "@/components/ChatbotButton";
import { STUDENT_NAMES } from "@/lib/types";

interface StudentDashboardProps {
  email: string;
}

export default function StudentDashboard({ email }: StudentDashboardProps) {
  const studentName = STUDENT_NAMES[email] || email;
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {studentName} 관찰일지
        </h2>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <Carousel>
          <CarouselContent>
            <CarouselItem className="basis-full">
              <Link href="/learning" className="block cursor-pointer">
                <div className="bg-gray-800/50 rounded-xl p-6 h-[400px] flex items-center justify-center transition-colors hover:bg-gray-700/50">
                  <h3 className="text-2xl font-bold text-white">
                    지금까지 배운 내용 확인하기
                  </h3>
                </div>
              </Link>
            </CarouselItem>
            <CarouselItem className="basis-full">
              <Link href="/growing" className="block cursor-pointer">
                <div className="bg-gray-800/50 rounded-xl p-6 h-[400px] flex items-center justify-center transition-colors hover:bg-gray-700/50">
                  <h3 className="text-2xl font-bold text-white">
                    식물을 정해 키워보기
                  </h3>
                </div>
              </Link>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)} />
    </div>
  );
}
