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
} from "@/components/ui/carousel";
import ChatbotButton from "@/components/ChatbotButton";
import { SPECIAL_STUDENT_NAMES } from "@/lib/types";

export default function SpecialDashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            <Carousel>
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
          <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)} />
        </div>
      </main>
    </div>
  );
}
