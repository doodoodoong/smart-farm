import GradientText from "@/blocks/TextAnimations/GradientText/GradientText";
import RotatingText from "@/blocks/TextAnimations/RotatingText/RotatingText";
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
        <h1 className="text-5xl font-extrabold bg-clip-text">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={4}
            showBorder={false}
            className="custom-class"
          >
            스마트 식물재배 관찰일지, git branch test
          </GradientText>
        </h1>
        <div className="text-xl mt-4 flex items-center justify-center gap-2">
          <span className="text-gray-300 text-2xl font-bold">식물 관찰은</span>
          <RotatingText
            texts={["쉽다", "할 수 있다", "신기하다", "귀찮지 않다"]}
            mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black font-bold overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={1500}
          />
        </div>
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
