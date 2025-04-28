import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
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
    </main>
  );
}
