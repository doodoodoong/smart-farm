"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, Save, Volume2 } from "lucide-react";
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
import { getPlantImageUrl } from "@/lib/plantImageFirebase";
import { analyzePlantAll } from "@/lib/plantIdApi";
import { PlantIdApiResponse } from "@/lib/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoModalButton from "@/components/VideoModalButton";

interface IdentifyResult {
  id: number;
  custom_id: string | null;
  meta_data: {
    latitude: number | null;
    longitude: number | null;
    date: string;
    datetime: string;
  };
  uploaded_datetime: number;
  finished_datetime: number;
  images: Array<{
    file_name: string;
    url: string;
  }>;
  suggestions: Array<{
    id: number;
    plant_name: string;
    probability: number;
    confirmed: boolean;
    plant_details: {
      language: string;
      scientific_name: string;
      structured_name: {
        genus: string;
        species: string;
      };
    };
  }>;
  modifiers: string[];
  secret: string;
  fail_cause: string | null;
  countable: boolean;
  feedback: unknown;
  is_plant: boolean;
  is_plant_probability: number;
  health_assessment?: {
    is_healthy: boolean;
    diseases: Array<{
      name: string;
      probability: number;
    }>;
  };
}

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
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    moisture: null,
  });
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [speciesResult, setSpeciesResult] = useState<IdentifyResult | null>(
    null
  );
  const [healthResult, setHealthResult] = useState<PlantIdApiResponse | null>(
    null
  );
  const [analyzeDialogOpen, setAnalyzeDialogOpen] = useState(false);
  const sampleImagePath = "plantcam/daily.jpg";
  const [translatedDiseaseNames, setTranslatedDiseaseNames] = useState<{
    [key: string]: string;
  }>({});

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

  useEffect(() => {
    let isMounted = true;
    const fetchSensorData = async () => {
      try {
        const res = await fetch("https://myplantcam.ngrok.app/sensor_data");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setSensorData({
            temperature: data.temperature,
            humidity: data.humidity,
            moisture: data.moisture,
          });
        }
      } catch {
        // 네트워크 오류 무시
      }
    };
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  // 질병명 추출
  const diseaseNames = [
    ...(speciesResult?.health_assessment?.diseases?.map((d) => d.name) || []),
    ...(healthResult?.result?.disease?.suggestions?.map((d) => d.name) || []),
  ];

  // 질병명 번역 useEffect
  useEffect(() => {
    const untranslated = diseaseNames.filter(
      (name) => !translatedDiseaseNames[name]
    );
    if (untranslated.length === 0) return;
    untranslated.forEach(async (name) => {
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: name, source: "en", target: "ko" }),
        });
        const data = await res.json();
        if (data.translatedText) {
          setTranslatedDiseaseNames((prev) => ({
            ...prev,
            [name]: data.translatedText,
          }));
        }
      } catch {}
    });
  }, [diseaseNames.join(",")]);

  // 분석 결과 렌더링 함수
  const renderAnalyzeResult = () => (
    <div className="mt-4 p-4 bg-gray-700/50 rounded-lg text-white">
      <h4 className="font-semibold mb-2">분석 결과</h4>
      {/* 식물 여부 및 확률 */}
      <div className="mb-2">
        <strong>식물 여부:</strong>{" "}
        {typeof speciesResult?.is_plant !== "undefined"
          ? speciesResult.is_plant
            ? "식물 맞음"
            : "식물 아님"
          : "-"}
        (확률:{" "}
        {typeof speciesResult?.is_plant_probability === "number"
          ? Math.round(speciesResult.is_plant_probability * 100)
          : 0}
        %)
      </div>
      {/* 건강상태(identify API에서 제공 시) */}
      {speciesResult?.health_assessment && (
        <div className="mb-2">
          <strong>건강상태:</strong>{" "}
          {speciesResult.health_assessment?.is_healthy ? "건강함" : "질병 의심"}
          {speciesResult.health_assessment?.diseases?.length > 0 && (
            <ul className="list-disc ml-6 mt-1">
              {speciesResult.health_assessment?.diseases.map(
                (d: { name: string; probability: number }, idx: number) => (
                  <li key={idx}>
                    {translatedDiseaseNames[d.name] || d.name} (확률:{" "}
                    {Math.round(d.probability * 100)}%)
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
      {/* 건강 진단(상세) - health assessment API */}
      {healthResult && healthResult.result && (
        <div className="mb-2">
          <strong>건강 진단(상세):</strong>
          <div className="mt-2">
            <div>
              <strong>건강 여부:</strong>{" "}
              {healthResult &&
              healthResult.result &&
              healthResult.result.is_healthy &&
              typeof healthResult.result.is_healthy.binary !== "undefined"
                ? healthResult.result.is_healthy.binary
                  ? "건강함"
                  : "건강하지 않음"
                : "-"}
              (확률:{" "}
              {healthResult &&
              healthResult.result &&
              healthResult.result.is_healthy &&
              typeof healthResult.result.is_healthy.probability === "number"
                ? Math.round(healthResult.result.is_healthy.probability * 100)
                : 0}
              %)
            </div>
            {healthResult &&
            healthResult.result &&
            healthResult.result.disease &&
            Array.isArray(healthResult.result.disease.suggestions) &&
            healthResult.result.disease.suggestions.length > 0 ? (
              <div className="mt-2">
                <strong>질병 의심:</strong>
                <ul className="list-disc ml-6 mt-1">
                  {healthResult.result.disease.suggestions.map((d, idx) => (
                    <li key={idx}>
                      {translatedDiseaseNames[d.name] || d.name} (확률:{" "}
                      {Math.round(d.probability * 100)}%)
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {analyzeError && <p className="text-red-500 mt-2">{analyzeError}</p>}
    </div>
  );

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
            <h1 className="text-2xl font-bold text-white mb-0 ml-4 flex items-center gap-2">
              식물 키우기
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full w-10 h-10 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow-lg flex items-center justify-center ml-2"
                      size="icon"
                      onClick={async () => {
                        const text =
                          "식물 키우기 페이지입니다. 각 문항과 답변 옆의 스피커 버튼을 누르면 음성 안내를 들을 수 있습니다.";
                        const res = await fetch("/api/tts", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text }),
                        });
                        if (res.ok) {
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const audio = new Audio(url);
                          audio.play();
                        } else {
                          alert("음성 생성에 실패했습니다.");
                        }
                      }}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-700">
                    <p>전체 안내 음성 듣기</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h1>
          </div>
          <div className="flex-1 -mx-6">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[calc(100vh-200px)] rounded-lg border border-gray-700"
            >
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full p-6">
                  <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50 flex flex-col">
                    {/* 실시간 영상 위쪽에 버튼 추가 */}
                    <div className="flex justify-end items-center p-2">
                      <Dialog
                        open={analyzeDialogOpen}
                        onOpenChange={setAnalyzeDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={async () => {
                              setAnalyzeDialogOpen(true);
                              setAnalyzeLoading(true);
                              setAnalyzeError(null);
                              setSpeciesResult(null);
                              setHealthResult(null);
                              try {
                                const imageUrl = await getPlantImageUrl(
                                  sampleImagePath
                                );
                                const { speciesResult, healthResult } =
                                  await analyzePlantAll(imageUrl);
                                setSpeciesResult(speciesResult);
                                setHealthResult(healthResult);
                              } catch (err) {
                                let message = "분석 중 오류가 발생했습니다.";
                                if (err instanceof Error) message = err.message;
                                setAnalyzeError(message);
                              } finally {
                                setAnalyzeLoading(false);
                              }
                            }}
                            disabled={analyzeLoading}
                          >
                            {analyzeLoading
                              ? "분석 중..."
                              : "식물 건강상태 분석하기"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 text-white border-gray-700">
                          <DialogHeader>
                            <DialogTitle>식물 건강상태 분석 결과</DialogTitle>
                          </DialogHeader>
                          <DialogDescription>
                            분석 결과를 아래에서 확인하세요.
                          </DialogDescription>
                          {analyzeLoading ? (
                            <div className="text-center py-8">분석 중...</div>
                          ) : (
                            renderAnalyzeResult()
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
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
                            <span className="text-white font-medium">
                              {sensorData.temperature !== null
                                ? `${sensorData.temperature}°C`
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">
                              습도
                            </span>
                            <span className="text-white font-medium">
                              {sensorData.humidity !== null
                                ? `${sensorData.humidity}%`
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-400 mr-2">
                              토양수분
                            </span>
                            <span className="text-white font-medium">
                              {sensorData.moisture !== null
                                ? `${sensorData.moisture}%`
                                : "-"}
                            </span>
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
                          <Label
                            htmlFor="leafCount"
                            className="text-white flex items-center gap-2"
                          >
                            잎이 몇 장 있나요?
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="rounded-full w-8 h-8 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                                    size="icon"
                                    onClick={async () => {
                                      const text = "잎이 몇 장 있나요?";
                                      const res = await fetch("/api/tts", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ text }),
                                      });
                                      if (res.ok) {
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        const audio = new Audio(url);
                                        audio.play();
                                      } else {
                                        alert("음성 생성에 실패했습니다.");
                                      }
                                    }}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                  <p>문항 읽어주기</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
                          <Label className="text-white flex items-center gap-2">
                            오늘 식물의 키가 전보다 <b>커졌나요?</b>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    className="rounded-full w-8 h-8 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                                    size="icon"
                                    onClick={async () => {
                                      const text =
                                        "오늘 식물의 키가 전보다 커졌나요?";
                                      const res = await fetch("/api/tts", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ text }),
                                      });
                                      if (res.ok) {
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        const audio = new Audio(url);
                                        audio.play();
                                      } else {
                                        alert("음성 생성에 실패했습니다.");
                                      }
                                    }}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                  <p>문항 읽어주기</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <div className="flex gap-6 mt-1">
                            {["예", "아니오", "잘 모르겠어요"].map(
                              (opt, idx) => (
                                <label
                                  key={opt}
                                  className="flex items-center gap-1 text-white"
                                >
                                  <input
                                    type="radio"
                                    name="grewTaller"
                                    value={["yes", "no", "unknown"][idx]}
                                    checked={
                                      diaryEntry.grewTaller ===
                                      ["yes", "no", "unknown"][idx]
                                    }
                                    onChange={handleRadioChange}
                                  />
                                  {opt}
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          className="rounded-full w-7 h-7 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                                          size="icon"
                                          tabIndex={-1}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            const text = opt;
                                            const res = await fetch(
                                              "/api/tts",
                                              {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: JSON.stringify({ text }),
                                              }
                                            );
                                            if (res.ok) {
                                              const blob = await res.blob();
                                              const url =
                                                URL.createObjectURL(blob);
                                              const audio = new Audio(url);
                                              audio.play();
                                            } else {
                                              alert(
                                                "음성 생성에 실패했습니다."
                                              );
                                            }
                                          }}
                                        >
                                          <Volume2 className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                        <p>이 답변 읽어주기</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </label>
                              )
                            )}
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  className="rounded-full w-8 h-8 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                                  size="icon"
                                  onClick={async () => {
                                    const text =
                                      "식물이 잘 자라고 있는지 나의 느낌을 선택해주세요.";
                                    const res = await fetch("/api/tts", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({ text }),
                                    });
                                    if (res.ok) {
                                      const blob = await res.blob();
                                      const url = URL.createObjectURL(blob);
                                      const audio = new Audio(url);
                                      audio.play();
                                    } else {
                                      alert("음성 생성에 실패했습니다.");
                                    }
                                  }}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                <p>문항 읽어주기</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            className="rounded-full w-7 h-7 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                                            size="icon"
                                            onClick={async () => {
                                              const text = `잎 개수: ${
                                                record.leafCount
                                              }장, 키가 커졌나요: ${
                                                record.grewTaller === "yes"
                                                  ? "예"
                                                  : record.grewTaller === "no"
                                                  ? "아니오"
                                                  : "잘 모르겠어요"
                                              }, 새 잎이 생겼나요: ${
                                                record.newLeaf === "yes"
                                                  ? "예"
                                                  : "아니오"
                                              }, 느낌: ${
                                                record.feeling === "happy"
                                                  ? "기쁨"
                                                  : record.feeling === "neutral"
                                                  ? "보통"
                                                  : "슬픔"
                                              }`;
                                              const res = await fetch(
                                                "/api/tts",
                                                {
                                                  method: "POST",
                                                  headers: {
                                                    "Content-Type":
                                                      "application/json",
                                                  },
                                                  body: JSON.stringify({
                                                    text,
                                                  }),
                                                }
                                              );
                                              if (res.ok) {
                                                const blob = await res.blob();
                                                const url =
                                                  URL.createObjectURL(blob);
                                                const audio = new Audio(url);
                                                audio.play();
                                              } else {
                                                alert(
                                                  "음성 생성에 실패했습니다."
                                                );
                                              }
                                            }}
                                          >
                                            <Volume2 className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                          <p>이 기록 읽어주기</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
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
          <VideoModalButton />
        </div>
      </div>
    </ScrollArea>
  );
}
