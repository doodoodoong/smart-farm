"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { useRouter } from "next/navigation";
import SplashCursor from "@/blocks/Animations/SplashCursor/SplashCursor";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: unknown) {
      const authError = error as AuthError;
      switch (authError.code) {
        case "auth/invalid-email":
          setError("유효하지 않은 이메일 주소입니다.");
          break;
        case "auth/user-disabled":
          setError("비활성화된 계정입니다.");
          break;
        case "auth/user-not-found":
          setError(
            "등록되지 않은 이메일입니다. 이메일 주소를 다시 확인해주세요."
          );
          break;
        case "auth/wrong-password":
          setError("비밀번호가 올바르지 않습니다. 다시 확인해주세요.");
          break;
        default:
          setError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      <SplashCursor />
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/plantgrowth.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/70 to-gray-800/80 z-5 pointer-events-none" />
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="ghost" className="text-gray-300">
            ← 홈으로 돌아가기
          </Button>
        </Link>
      </div>
      <div className="relative z-10 bg-gray-800/50 p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          로그인
        </h1>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            로그인
          </Button>
        </form>
        <Button
          onClick={() => router.push("/special-login")}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        >
          특수교육대상자 로그인
        </Button>
      </div>
    </main>
  );
}
