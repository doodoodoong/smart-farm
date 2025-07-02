"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import ChatbotButton from "@/components/ChatbotButton";
import VideoModalButton from "@/components/VideoModalButton";
import { SPECIAL_STUDENT_NAMES } from "@/lib/types";
import { Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function StackButtonGroup({
  onChatClick,
  onVoiceClick,
}: {
  onChatClick: () => void;
  onVoiceClick: () => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
      {/* 음성안내 버튼 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="rounded-full w-14 h-14 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow-lg flex items-center justify-center"
              size="lg"
              onClick={onVoiceClick}
            >
              <Volume2 className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 text-white border-gray-700">
            <p>대시보드 안내 음성 듣기</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* 챗봇 버튼 */}
      <ChatbotButton fixed={false} onClick={onChatClick} />
      {/* 비디오 모달 버튼 */}
      <VideoModalButton fixed={false} />
    </div>
  );
}

export default function SpecialDashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.push("/special-login");
        return;
      }
      setEmail(user.email || "");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    // 초기값 설정
    setCurrentIndex(carouselApi.selectedScrollSnap());
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/special-login");
    } catch {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="text-white p-8">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 헤더 */}
      <header className="bg-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            {email
              ? `${
                  SPECIAL_STUDENT_NAMES[email] ?? email.split("@")[0]
                }의 관찰 일지`
              : "관찰 일지"}
          </h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-black hover:bg-gray-700/50 transition-colors duration-200 hover:text-white"
          >
            로그아웃
          </Button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <div className="w-full max-w-4xl mx-auto">
            <Carousel setApi={setCarouselApi}>
              <CarouselContent>
                <CarouselItem className="basis-full">
                  <Link
                    href="/special-learning"
                    className="block cursor-pointer"
                  >
                    <div className="bg-gray-800/50 rounded-xl p-6 h-[400px] flex items-center justify-center transition-colors hover:bg-gray-700/50">
                      <h3 className="text-2xl font-bold text-white">
                        지금까지 배운 내용 확인하기
                      </h3>
                    </div>
                  </Link>
                </CarouselItem>
                <CarouselItem className="basis-full">
                  <Link
                    href="/special-growing"
                    className="block cursor-pointer"
                  >
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
        </div>
      </main>

      {/* 오른쪽 하단 세로 버튼 그룹 */}
      <StackButtonGroup
        onChatClick={() => {}}
        onVoiceClick={async () => {
          const baseText =
            "특수교육대상자 대시보드입니다. 상단에는 로그아웃 버튼이 있습니다. 궁금한 점이 있으면 오른쪽 하단의 챗봇 버튼을 눌러 질문할 수 있습니다.";
          let text = "";
          if (currentIndex === 0) {
            text =
              "지금까지 배운 내용 확인하기 카드가 선택되어 있습니다. 이 카드를 누르면 학습 내용을 복습할 수 있습니다. " +
              baseText;
          } else if (currentIndex === 1) {
            text =
              "식물을 정해 키워보기 카드가 선택되어 있습니다. 이 카드를 누르면 식물 키우기 활동을 시작할 수 있습니다. " +
              baseText;
          } else {
            text = baseText;
          }
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
      />
    </div>
  );
}
