"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BlurText from "@/blocks/TextAnimations/BlurText/BlurText";

const questions = [
  "식물을 소중히 다룰 준비가 되었나요?",
  "기기 앞으로 이동했나요?",
  "식물 색깔을 확인하였나요?",
  "식물 키를 확인하였나요?",
  "비커에 줄어든 물의 양을 확인하였나요?",
  "관찰 후에는 주변을 깨끗이 정리했나요?",
];

export default function SpecialGrowingSplash() {
  const [step, setStep] = useState(0);
  const [allChecked, setAllChecked] = useState(false);
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);

  // 음성 안내 재생 함수
  const handlePlayTTS = async () => {
    setIsPlaying(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questions[step] }),
      });
      if (!res.ok) throw new Error("TTS 요청 실패");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } catch {
      setIsPlaying(false);
      alert("음성 안내를 재생할 수 없습니다.");
    }
  };

  const handleCheck = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setAllChecked(true);
    }
  };

  const handleGoToGrowing = () => {
    router.replace("/special-growing?fromSplash=1");
  };

  // 버튼 안내 문구
  const checkButtonText = "확인했어요!";
  const goToGrowingButtonText = "식물관찰 페이지로 이동하기";

  // 버튼 음성 안내 재생 함수
  const handlePlayButtonTTS = async (text: string) => {
    setIsPlaying(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("TTS 요청 실패");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } catch {
      setIsPlaying(false);
      alert("음성 안내를 재생할 수 없습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="mb-8 flex items-center gap-4">
        <BlurText
          key={step}
          text={questions[step]}
          animateBy="words"
          direction="top"
          className="text-7xl font-bold text-center"
        />
        <button
          onClick={handlePlayTTS}
          className={`ml-2 p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition ${
            isPlaying ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isPlaying}
          aria-label="음성 안내 듣기"
        >
          {/* 스피커 아이콘 (SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9v6h4l5 5V4l-5 5H9z"
            />
          </svg>
        </button>
      </div>
      {!allChecked ? (
        <div className="flex items-center gap-2 mt-2">
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition"
            onClick={handleCheck}
          >
            {checkButtonText}
          </button>
          <button
            onClick={() => handlePlayButtonTTS(checkButtonText)}
            className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition ${
              isPlaying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPlaying}
            aria-label="확인했어요 음성 안내 듣기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9v6h4l5 5V4l-5 5H9z"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition"
            onClick={handleGoToGrowing}
          >
            {goToGrowingButtonText}
          </button>
          <button
            onClick={() => handlePlayButtonTTS(goToGrowingButtonText)}
            className={`p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition ${
              isPlaying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isPlaying}
            aria-label="식물관찰 페이지로 이동하기 음성 안내 듣기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9v6h4l5 5V4l-5 5H9z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
