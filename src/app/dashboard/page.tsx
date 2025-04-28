"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface PlantRecord {
  id: string;
  name: string;
  date: string;
  height: number;
  leaves: number;
  notes: string;
  lastWatered: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [showNewRecordForm, setShowNewRecordForm] = useState(false);
  const [plantRecords, setPlantRecords] = useState<PlantRecord[]>([
    {
      id: "1",
      name: "방울토마토",
      date: "2024-03-20",
      height: 15,
      leaves: 6,
      notes: "새로운 잎이 나왔어요!",
      lastWatered: "2024-03-20",
    },
  ]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 새로운 기록 추가 로직 구현
    setShowNewRecordForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* 헤더 */}
      <header className="bg-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">나의 식물 관찰 일지</h1>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => setShowNewRecordForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              새로운 관찰 기록하기
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-black hover:bg-gray-700/50 transition-colors duration-200 hover:text-white"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto p-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">
              관찰 중인 식물
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              {plantRecords.length}개
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">최근 관찰일</h3>
            <p className="text-3xl font-bold text-white mt-2">2024.03.20</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">다음 물주기</h3>
            <p className="text-3xl font-bold text-white mt-2">2024.03.23</p>
          </div>
        </div>

        {/* 식물 기록 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantRecords.map((record) => (
            <div key={record.id} className="bg-gray-800/50 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{record.name}</h3>
                <span className="text-sm text-gray-400">{record.date}</span>
              </div>
              <div className="space-y-2 text-gray-300">
                <p>키: {record.height}cm</p>
                <p>잎 개수: {record.leaves}개</p>
                <p>마지막 물주기: {record.lastWatered}</p>
                <p className="text-sm text-gray-400 mt-4">{record.notes}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="w-full">
                  자세히 보기
                </Button>
                <Button variant="outline" className="w-full">
                  수정하기
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 새 기록 추가 모달 */}
      {showNewRecordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">
              새로운 관찰 기록
            </h2>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  식물 이름
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mt-1"
                  placeholder="식물 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  키 (cm)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mt-1"
                  placeholder="식물의 키를 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  잎 개수
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mt-1"
                  placeholder="잎의 개수를 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  관찰 내용
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mt-1"
                  rows={4}
                  placeholder="관찰한 내용을 자유롭게 적어주세요"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNewRecordForm(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  저장하기
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
