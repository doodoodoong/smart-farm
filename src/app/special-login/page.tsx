"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SpecialLoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("아이디를 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      const email = `${name.trim()}@test.co.kr`;
      const password = "123456";
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("로그인 성공! 대시보드로 이동합니다.");
      localStorage.setItem("specialStudentName", name.trim());
      await router.replace("/special-dashboard");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error) {
        const err = error as { code: string };
        if (err.code === "auth/user-not-found") {
          toast.error("존재하지 않는 아이디입니다.");
        } else if (err.code === "auth/wrong-password") {
          toast.error("비밀번호가 올바르지 않습니다.");
        } else {
          toast.error("로그인 중 오류가 발생했습니다.");
        }
      } else {
        toast.error("알 수 없는 오류가 발생했습니다.");
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 left-4">
        <Link href="/login">
          <Button
            variant="ghost"
            className="text-gray-300 flex items-center gap-1 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">뒤로가기</span>
          </Button>
        </Link>
      </div>
      <div className="max-w-md w-full bg-gray-900/80 rounded-xl shadow-lg p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          특수교육대상자 로그인
        </h1>
        <p className="text-gray-300 mb-6">아이디를 입력해주세요</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="아이디를 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 text-white border-gray-700"
            disabled={loading}
            maxLength={20}
            autoFocus
          />
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg"
            disabled={loading}
          >
            {loading ? "저장 중..." : "제출하기"}
          </Button>
        </form>
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
                  const text =
                    "특수교육대상자 로그인 페이지입니다. 아이디를 입력하고 아래 파란색 버튼을 눌러주세요. 이전 페이지로 돌아가려면 왼쪽 상단의 버튼을 눌러주세요.";
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
              <p>특수교육대상자 로그인 안내 음성 듣기</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </main>
  );
}
