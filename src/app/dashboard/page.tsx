"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { USER_ROLES, type UserRole } from "@/lib/types";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const email = user.email || "";
      const role = USER_ROLES[email] || "student";
      setUserRole(role);
      setUserEmail(email);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  if (!userRole || !userEmail) {
    return <div>로딩 중...</div>;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case "student":
        return <StudentDashboard email={userEmail} />;
      case "teacher":
        return <TeacherDashboard />;
      default:
        return <div>잘못된 접근입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 헤더 */}
      <header className="bg-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            {userRole === "student" && "나의 식물 관찰 일지"}
            {userRole === "teacher" && "교사 관리 페이지"}
            {userRole === "admin" && "관리자 대시보드"}
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
      <main className="max-w-7xl mx-auto p-6">{renderDashboard()}</main>
    </div>
  );
}
