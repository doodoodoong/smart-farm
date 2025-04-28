"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("회원가입 기능은 현재 준비중입니다.");
  };

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

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: unknown) {
      const authError = error as AuthError;
      if (authError.code === "auth/popup-closed-by-user") {
        setError("로그인이 취소되었습니다. 다시 시도해주세요.");
      } else {
        setError("Google 로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" className="text-gray-300">
            ← 홈으로 돌아가기
          </Button>
        </Link>
      </div>
      <div className="bg-gray-800/50 p-8 rounded-xl shadow-xl w-full max-w-md">
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

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/50 text-gray-400">또는</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          className="w-full mt-6 bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 로그인
        </Button>

        <p className="mt-4 text-center text-sm text-gray-400">
          계정이 없으신가요?{" "}
          <a
            href="#"
            onClick={handleSignupClick}
            className="text-blue-400 hover:underline"
          >
            회원가입
          </a>
        </p>
      </div>
    </main>
  );
}
