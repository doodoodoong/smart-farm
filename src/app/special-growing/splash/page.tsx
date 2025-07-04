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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="mb-8">
        <BlurText
          key={step}
          text={questions[step]}
          animateBy="words"
          direction="top"
          className="text-7xl font-bold text-center"
        />
      </div>
      {!allChecked ? (
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 transition"
          onClick={handleCheck}
        >
          확인했어요!
        </button>
      ) : (
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={handleGoToGrowing}
        >
          식물관찰 페이지로 이동하기
        </button>
      )}
    </div>
  );
}
