"use client";
import GradientText from "@/blocks/TextAnimations/GradientText/GradientText";
import RotatingText from "@/blocks/TextAnimations/RotatingText/RotatingText";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* 배경 비디오 */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/plantgrowth.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* 내용 */}
      <div className="relative z-10 max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-extrabold bg-clip-text">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={4}
            showBorder={false}
            className="custom-class"
          >
            스마트 식물재배 관찰일지
          </GradientText>
        </h1>
        <div className="text-xl mt-4 flex items-center justify-center gap-2">
          <span className="text-gray-300 text-2xl font-bold">식물 관찰은</span>
          <RotatingText
            texts={["쉽다", "할 수 있다", "신기하다", "귀찮지 않다"]}
            mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black font-bold overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={1500}
          />
        </div>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg text-lg">
              시작하기
            </Button>
          </Link>
        </div>
        {/* 읽어주기 버튼 - 오른쪽 하단 고정, 원형, Tooltip */}
        <TooltipProvider>
          <div className="fixed bottom-6 right-24 z-50">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="rounded-full w-14 h-14 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow-lg flex items-center justify-center"
                  size="lg"
                  onClick={async () => {
                    const text = "스마트 식물재배 관찰일지";
                    const res = await fetch("/api/tts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ text }),
                    });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const audio = new Audio(url);
                      audio.play();
                    } else {
                      alert("음성 생성에 실패했습니다.");
                    }
                  }}
                >
                  <Volume2 className="w-6 h-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white border-gray-700">
                <p>이 페이지를 음성으로 듣기</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {/* 배경 그라데이션 오버레이(필요시) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/70 to-gray-800/80 z-5 pointer-events-none" />
    </main>
  );
}
