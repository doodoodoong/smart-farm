"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, Save } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatbotButton from "@/components/ChatbotButton";

interface DiaryEntry {
  diaryId: string;
  plantId: string;
  leafCount: string;
  grewTaller: "yes" | "no" | "unknown";
  newLeaf: "yes" | "no";
  feeling: "happy" | "neutral" | "sad";
  createdAt: string;
  lastModified: string;
  email: string;
  name: string;
}

export default function SpecialGrowingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [diaryEntry, setDiaryEntry] = useState<
    Omit<DiaryEntry, "diaryId" | "createdAt" | "lastModified">
  >({
    plantId: "",
    leafCount: "",
    grewTaller: "unknown",
    newLeaf: "no",
    feeling: "neutral",
    email: "",
    name: "",
  });
  const [diaryRecords, setDiaryRecords] = useState<DiaryEntry[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleFirebaseError = (error: unknown, context: string) => {
    let errorMessage = `${context} 저장 중 오류가 발생했습니다.`;
    if (error && typeof error === "object" && "code" in error) {
      if ((error as { code?: string }).code === "PERMISSION_DENIED") {
        errorMessage =
          "데이터베이스 접근 권한이 없습니다. 로그인 상태를 확인해주세요.";
        if (!user) {
          errorMessage = "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
          router.push("/special-login");
        }
      } else if ((error as { code?: string }).code === "NETWORK_ERROR") {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
    }
    toast.error("저장 실패", { description: errorMessage });
  };

  useEffect(() => {
    if (!user) return;
    const diariesRef = ref(database, `users/${user.uid}/specialDiaries`);
    const unsubscribeDiaries = onValue(diariesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const diariesData = snapshot.val();
          const allDiaries: DiaryEntry[] = [];
          Object.values(
            diariesData as Record<string, Record<string, DiaryEntry>>
          ).forEach((plantDiaries) => {
            Object.values(plantDiaries as Record<string, DiaryEntry>).forEach(
              (diary) => {
                allDiaries.push(diary as DiaryEntry);
              }
            );
          });
          allDiaries.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setDiaryRecords(allDiaries);
        } else {
          setDiaryRecords([]);
        }
      } catch (error) {
        console.error("재배일지 로딩 오류:", error);
        handleFirebaseError(error, "재배일지");
      }
    });
    return () => {
      unsubscribeDiaries();
    };
  }, [user, router]);

  const handleSaveDiary = async () => {
    if (!user || (!user.displayName && !user.email)) {
      toast.error("저장 실패", {
        description: "로그인이 필요합니다.",
      });
      return;
    }
    try {
      const diaryId = Date.now().toString();
      const diaryRef = ref(
        database,
        `users/${user.uid}/specialDiaries/${
          diaryEntry.plantId || "default"
        }/${diaryId}`
      );
      const newDiaryEntry: DiaryEntry = {
        diaryId,
        plantId: diaryEntry.plantId || "",
        leafCount: diaryEntry.leafCount,
        grewTaller: diaryEntry.grewTaller,
        newLeaf: diaryEntry.newLeaf,
        feeling: diaryEntry.feeling,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        email: user.email ?? "",
        name: user.displayName ?? user.email ?? "",
      };
      await set(diaryRef, newDiaryEntry);
      toast.success("재배일지 저장 완료", {
        description: "재배일지가 성공적으로 저장되었습니다.",
      });
      setDiaryEntry((prev) => ({
        ...prev,
        leafCount: "",
        grewTaller: "unknown",
        newLeaf: "no",
        feeling: "neutral",
      }));
    } catch (error) {
      console.error("Firebase 저장 오류:", error);
      handleFirebaseError(error, "재배일지");
    }
  };

  const handleDiaryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDiaryEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDiaryEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              돌아가기
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-white mb-8">식물 키우기</h1>
          <div className="flex-1 -mx-6">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[calc(100vh-200px)] rounded-lg border border-gray-700"
            >
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full p-6">
                  <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Video className="h-5 w-5 mr-2" color="#fff" />
                          <h2 className="text-lg font-semibold text-white">
                            실시간 영상
                          </h2>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">
                              온도
                            </span>
                            <span className="text-white font-medium">25°C</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">
                              습도
                            </span>
                            <span className="text-white font-medium">60%</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">
                              토양수분
                            </span>
                            <span className="text-white font-medium">45%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="w-full h-full overflow-hidden rounded-lg">
                        <iframe
                          src="https://myplantcam.ngrok.app/video_feed"
                          className="w-full h-full"
                          style={{ border: "none", background: "#222" }}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          title="식물 스트리밍 영상"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={30}>
                <div className="h-full p-6">
                  <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50">
                    <div className="p-6 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">
                          재배일지 작성
                        </h2>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="leafCount" className="text-white">
                            잎이 몇 장 있나요?
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="leafCount"
                              name="leafCount"
                              type="number"
                              min="0"
                              value={diaryEntry.leafCount}
                              onChange={handleDiaryChange}
                              className="bg-gray-700 text-white border-gray-600 w-32"
                              placeholder="숫자 입력"
                            />
                            <span className="text-white">장</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">
                            오늘 식물의 키가 전보다 <b>커졌나요?</b>
                          </Label>
                          <div className="flex gap-6 mt-1">
                            <label className="flex items-center gap-1 text-white">
                              <input
                                type="radio"
                                name="grewTaller"
                                value="yes"
                                checked={diaryEntry.grewTaller === "yes"}
                                onChange={handleRadioChange}
                              />
                              예
                            </label>
                            <label className="flex items-center gap-1 text-white">
                              <input
                                type="radio"
                                name="grewTaller"
                                value="no"
                                checked={diaryEntry.grewTaller === "no"}
                                onChange={handleRadioChange}
                              />
                              아니오
                            </label>
                            <label className="flex items-center gap-1 text-white">
                              <input
                                type="radio"
                                name="grewTaller"
                                value="unknown"
                                checked={diaryEntry.grewTaller === "unknown"}
                                onChange={handleRadioChange}
                              />
                              잘 모르겠어요
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">
                            식물에 <b>새 잎이 생겼나요?</b>
                          </Label>
                          <div className="flex gap-6 mt-1">
                            <label className="flex items-center gap-1 text-white">
                              <input
                                type="radio"
                                name="newLeaf"
                                value="yes"
                                checked={diaryEntry.newLeaf === "yes"}
                                onChange={handleRadioChange}
                              />
                              예
                            </label>
                            <label className="flex items-center gap-1 text-white">
                              <input
                                type="radio"
                                name="newLeaf"
                                value="no"
                                checked={diaryEntry.newLeaf === "no"}
                                onChange={handleRadioChange}
                              />
                              아니오
                            </label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">
                            식물이 잘 자라고 있는지 나의 느낌을 선택해주세요.
                          </Label>
                          <div className="flex gap-6 mt-1">
                            <button
                              type="button"
                              className={`text-3xl px-2 py-1 rounded-full border-2 ${
                                diaryEntry.feeling === "happy"
                                  ? "border-yellow-400 bg-yellow-100/10"
                                  : "border-transparent"
                              }`}
                              onClick={() =>
                                setDiaryEntry((prev) => ({
                                  ...prev,
                                  feeling: "happy",
                                }))
                              }
                              aria-label="기쁨"
                            >
                              😊
                            </button>
                            <button
                              type="button"
                              className={`text-3xl px-2 py-1 rounded-full border-2 ${
                                diaryEntry.feeling === "neutral"
                                  ? "border-gray-400 bg-gray-100/10"
                                  : "border-transparent"
                              }`}
                              onClick={() =>
                                setDiaryEntry((prev) => ({
                                  ...prev,
                                  feeling: "neutral",
                                }))
                              }
                              aria-label="보통"
                            >
                              😐
                            </button>
                            <button
                              type="button"
                              className={`text-3xl px-2 py-1 rounded-full border-2 ${
                                diaryEntry.feeling === "sad"
                                  ? "border-blue-400 bg-blue-100/10"
                                  : "border-transparent"
                              }`}
                              onClick={() =>
                                setDiaryEntry((prev) => ({
                                  ...prev,
                                  feeling: "sad",
                                }))
                              }
                              aria-label="슬픔"
                            >
                              😢
                            </button>
                          </div>
                        </div>
                        <Button
                          onClick={handleSaveDiary}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          재배일지 저장
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={30}>
                <div className="h-full p-6">
                  <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50">
                    <div className="p-6 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-semibold text-white">
                            재배일지 기록
                          </h2>
                        </div>
                        <ScrollArea className="flex-grow h-[calc(100vh-280px)]">
                          <div className="space-y-4 pr-4">
                            {diaryRecords.length === 0 ? (
                              <p className="text-gray-400 text-center py-8">
                                아직 작성된 재배일지가 없습니다.
                              </p>
                            ) : (
                              diaryRecords.map((record) => (
                                <div
                                  key={`${record.plantId}-${record.createdAt}`}
                                  className="p-4 rounded-lg bg-gray-700/50 border border-gray-600 space-y-2"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs text-gray-400">
                                      {new Date(
                                        record.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                    <p>잎 개수: {record.leafCount}장</p>
                                    <p>
                                      키가 커졌나요:{" "}
                                      {record.grewTaller === "yes"
                                        ? "예"
                                        : record.grewTaller === "no"
                                        ? "아니오"
                                        : "잘 모르겠어요"}
                                    </p>
                                    <p>
                                      새 잎이 생겼나요:{" "}
                                      {record.newLeaf === "yes"
                                        ? "예"
                                        : "아니오"}
                                    </p>
                                    <p>
                                      느낌:{" "}
                                      {record.feeling === "happy"
                                        ? "😊"
                                        : record.feeling === "neutral"
                                        ? "😐"
                                        : "😢"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)} />
        </div>
      </div>
    </ScrollArea>
  );
}
