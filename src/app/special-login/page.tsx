"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { database } from "@/lib/firebase";
import { ref, push } from "firebase/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuth, signInAnonymously, updateProfile } from "firebase/auth";

export default function SpecialLoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      // 1. 익명 인증
      const result = await signInAnonymously(auth);
      const user = result.user;
      // 2. 입력한 이름을 displayName에 저장
      await updateProfile(user, { displayName: name.trim() });
      // 3. 이름과 uid를 specialStudents에 저장
      const specialRef = ref(database, "specialStudents");
      await push(specialRef, {
        uid: user.uid,
        name: name.trim(),
        createdAt: Date.now(),
      });
      toast.success("이름이 성공적으로 저장되었습니다.");
      setName("");
      router.push("/special-dashboard");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "auth/operation-not-allowed"
      ) {
        toast.error(
          "Firebase 익명 인증이 활성화되어 있지 않습니다. 콘솔에서 익명 인증을 활성화하세요."
        );
      } else {
        toast.error("저장 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900/80 rounded-xl shadow-lg p-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          특수교육대상자 로그인
        </h1>
        <p className="text-gray-300 mb-6">이름을 입력해주세요</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="이름을 입력하세요"
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
    </main>
  );
}
