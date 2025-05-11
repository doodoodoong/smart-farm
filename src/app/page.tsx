import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* 배경 비디오 */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/plantgrowth.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* 내용 */}
      <div className="relative z-10 max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          스마트 식물재배 관찰일지
        </h1>
        <p className="text-xl text-gray-300 mt-4">자세히 보고 기록합시다</p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg text-lg">
              시작하기
            </Button>
          </Link>
        </div>
      </div>
      {/* 배경 그라데이션 오버레이(필요시) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900/70 to-gray-800/80 z-5 pointer-events-none" />
    </main>
  );
}
