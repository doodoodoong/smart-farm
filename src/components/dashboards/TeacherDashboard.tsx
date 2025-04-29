"use client";

import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300">전체 학생 수</h3>
          <p className="text-3xl font-bold text-white mt-2">25명</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300">관찰 식물 수</h3>
          <p className="text-3xl font-bold text-white mt-2">15개</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-300">
            오늘의 관찰 기록
          </h3>
          <p className="text-3xl font-bold text-white mt-2">8건</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">학생 목록</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((student) => (
            <div
              key={student}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-white">학생 {student}</h3>
                <p className="text-sm text-gray-400">마지막 관찰: 2024.03.20</p>
              </div>
              <Button variant="outline">관찰 기록 보기</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">최근 관찰 기록</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((record) => (
            <div key={record} className="p-4 bg-gray-700/30 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">
                  학생 {record} - 방울토마토
                </h3>
                <span className="text-sm text-gray-400">2024.03.20</span>
              </div>
              <p className="text-sm text-gray-300">새로운 잎이 나왔어요!</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
