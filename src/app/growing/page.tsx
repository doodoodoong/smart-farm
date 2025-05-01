"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Pencil,
  Trash2,
  Save,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { database } from "@/lib/firebase";
import { ref, set, remove, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlantInfo {
  plantId: string;
  plantName: string;
  temperature: string;
  humidity: string;
  createdAt: string;
  lastModified: string;
}

interface DiaryEntry {
  diaryId: string;
  plantId: string;
  plantName: string;
  leafCount: string;
  plantHeight: string;
  waterAmount: string;
  plantColor: string;
  additionalNotes: string;
  createdAt: string;
  lastModified: string;
}

export default function GrowingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<"info" | "diary">("info");
  const [plantInfo, setPlantInfo] = useState<PlantInfo>({
    plantId: "",
    plantName: "",
    temperature: "",
    humidity: "",
    createdAt: "",
    lastModified: "",
  });
  const [diaryEntry, setDiaryEntry] = useState<
    Omit<DiaryEntry, "diaryId" | "createdAt" | "lastModified">
  >({
    plantId: "",
    plantName: "",
    leafCount: "",
    plantHeight: "",
    waterAmount: "",
    plantColor: "",
    additionalNotes: "",
  });
  const [diaryRecords, setDiaryRecords] = useState<DiaryEntry[]>([]);
  const [savedPlant, setSavedPlant] = useState<PlantInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    temperature: "",
    humidity: "",
  });

  const validateNumber = (value: string, min: number, max: number) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "temperature" || name === "humidity") {
      // 숫자와 하이픈(-)만 허용
      const sanitizedValue = value.replace(/[^\d-]/g, "");

      // 유효성 검사
      let error = "";
      if (sanitizedValue) {
        if (name === "temperature") {
          if (!validateNumber(sanitizedValue, -20, 40)) {
            error = "온도는 -20°C에서 40°C 사이여야 합니다";
          }
        } else if (name === "humidity") {
          if (!validateNumber(sanitizedValue, 0, 100)) {
            error = "습도는 0%에서 100% 사이여야 합니다";
          }
        }
      }

      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));

      setPlantInfo((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else {
      setPlantInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSavePlantInfo = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다", {
        description: "식물 정보를 저장하려면 먼저 로그인해주세요.",
      });
      return;
    }

    if (!plantInfo.plantName || !plantInfo.temperature || !plantInfo.humidity) {
      toast.error("입력 오류", {
        description: "모든 필드를 입력해주세요.",
      });
      return;
    }

    if (
      !validateNumber(plantInfo.temperature, -20, 40) ||
      !validateNumber(plantInfo.humidity, 0, 100)
    ) {
      toast.error("입력 오류", {
        description: "온도나 습도가 허용 범위를 벗어났습니다.",
      });
      return;
    }

    try {
      const plantId = savedPlant?.plantId || Date.now().toString();
      const plantRef = ref(database, `users/${user.uid}/plants/${plantId}`);

      const updatedPlantInfo: PlantInfo = {
        plantId,
        plantName: plantInfo.plantName,
        temperature: plantInfo.temperature,
        humidity: plantInfo.humidity,
        lastModified: new Date().toISOString(),
        createdAt: savedPlant?.createdAt || new Date().toISOString(),
      };

      await set(plantRef, updatedPlantInfo);

      toast.success(savedPlant ? "수정 완료" : "저장 완료", {
        description: savedPlant
          ? "식물 정보가 성공적으로 수정되었습니다."
          : "식물 정보가 성공적으로 저장되었습니다.",
      });

      setSavedPlant(updatedPlantInfo);
      setDiaryEntry((prev) => ({
        ...prev,
        plantId,
        plantName: plantInfo.plantName,
      }));
    } catch (error) {
      console.error("Firebase 저장 오류:", error);
      handleFirebaseError(error, "식물 정보");
    }
  };

  const handleSaveDiary = async () => {
    if (!user || !savedPlant) {
      toast.error("저장 실패", {
        description: "먼저 식물 정보를 저장해주세요.",
      });
      return;
    }

    try {
      const diaryId = Date.now().toString();
      const diaryRef = ref(
        database,
        `users/${user.uid}/diaries/${savedPlant.plantId}/${diaryId}`
      );

      const newDiaryEntry: DiaryEntry = {
        diaryId,
        plantId: savedPlant.plantId,
        plantName: savedPlant.plantName,
        leafCount: diaryEntry.leafCount,
        plantHeight: diaryEntry.plantHeight,
        waterAmount: diaryEntry.waterAmount,
        plantColor: diaryEntry.plantColor,
        additionalNotes: diaryEntry.additionalNotes,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      await set(diaryRef, newDiaryEntry);

      toast.success("재배일지 저장 완료", {
        description: "재배일지가 성공적으로 저장되었습니다.",
      });

      // 재배일지 입력 필드 초기화
      setDiaryEntry((prev) => ({
        ...prev,
        leafCount: "",
        plantHeight: "",
        waterAmount: "",
        plantColor: "",
        additionalNotes: "",
      }));
    } catch (error) {
      console.error("Firebase 저장 오류:", error);
      handleFirebaseError(error, "재배일지");
    }
  };

  const handleFirebaseError = (error: unknown, context: string) => {
    let errorMessage = `${context} 저장 중 오류가 발생했습니다.`;
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "PERMISSION_DENIED") {
        errorMessage =
          "데이터베이스 접근 권한이 없습니다. 로그인 상태를 확인해주세요.";
        if (!user) {
          errorMessage = "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
          router.push("/login");
        }
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "네트워크 연결을 확인해주세요.";
      }
    }
    toast.error("저장 실패", { description: errorMessage });
  };

  const handleEdit = () => {
    if (savedPlant) {
      setPlantInfo(savedPlant);
      setIsEditing(true);
      setErrors({
        temperature: "",
        humidity: "",
      });
    }
  };

  const handleDelete = async () => {
    if (!user || !savedPlant?.plantId) {
      toast.error("권한 오류", {
        description: "삭제 권한이 없습니다. 로그인 상태를 확인해주세요.",
      });
      return;
    }

    try {
      const plantRef = ref(
        database,
        `users/${user.uid}/plants/${savedPlant.plantId}`
      );
      await remove(plantRef);

      toast.success("삭제 완료", {
        description: "식물 정보가 삭제되었습니다.",
      });

      setSavedPlant(null);
      setPlantInfo({
        plantId: "",
        plantName: "",
        temperature: "",
        humidity: "",
        createdAt: "",
        lastModified: "",
      });
      setErrors({
        temperature: "",
        humidity: "",
      });
    } catch (error) {
      console.error("Firebase 삭제 오류:", error);

      let errorMessage = "식물 정보 삭제 중 오류가 발생했습니다.";
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "PERMISSION_DENIED") {
          errorMessage = "삭제 권한이 없습니다. 로그인 상태를 확인해주세요.";
          if (!user) {
            errorMessage = "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
            router.push("/login");
          }
        }
      }

      toast.error("삭제 실패", {
        description: errorMessage,
      });
    }
  };

  // 실시간 데이터 동기화
  useEffect(() => {
    if (!user) return;

    // 식물 정보 실시간 동기화
    const plantsRef = ref(database, `users/${user.uid}/plants`);
    const diariesRef = ref(database, `users/${user.uid}/diaries`);

    const unsubscribePlants = onValue(plantsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const plants = snapshot.val();
          const uniquePlants = Object.values(
            plants as Record<string, PlantInfo>
          );

          // 중복 제거 및 정렬
          const filteredPlants = uniquePlants
            .filter(
              (plant, index, self) =>
                index === self.findIndex((p) => p.plantId === plant.plantId)
            )
            .sort((a, b) => a.plantName.localeCompare(b.plantName));

          // 가장 최근 식물 정보 설정
          if (filteredPlants.length > 0 && !savedPlant) {
            const mostRecent = filteredPlants.sort(
              (a, b) =>
                new Date(b.lastModified).getTime() -
                new Date(a.lastModified).getTime()
            )[0];
            setPlantInfo(mostRecent);
            setSavedPlant(mostRecent);
            setErrors({
              temperature: "",
              humidity: "",
            });
          }
        }
      } catch (error) {
        console.error("식물 정보 로딩 오류:", error);
        handleFirebaseError(error, "식물 정보");
      }
    });

    // 재배일지 실시간 동기화
    const unsubscribeDiaries = onValue(diariesRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const diariesData = snapshot.val();
          const allDiaries: DiaryEntry[] = [];

          // 모든 식물의 재배일지를 하나의 배열로 변환
          Object.values(
            diariesData as Record<string, Record<string, DiaryEntry>>
          ).forEach((plantDiaries) => {
            Object.values(plantDiaries).forEach((diary) => {
              allDiaries.push(diary);
            });
          });

          // 날짜순으로 정렬
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
      unsubscribePlants();
      unsubscribeDiaries();
    };
  }, [user, router, savedPlant]);

  const handleDiaryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDiaryEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderInfoStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="plantName" className="text-white">
          기르고자 하는 식물을 작성해주세요
        </Label>
        <Input
          id="plantName"
          name="plantName"
          value={plantInfo.plantName}
          onChange={handleInputChange}
          className="bg-gray-700 text-white border-gray-600"
          placeholder="예: 방울토마토"
        />
      </div>

      <div>
        <Label className="text-white mb-4 block">
          식물이 잘 자라기 위한 조건을 아래에 작성해주세요
        </Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temperature" className="text-white pl-4">
              적합한 온도
            </Label>
            <Input
              id="temperature"
              name="temperature"
              value={plantInfo.temperature}
              onChange={handleInputChange}
              className={`bg-gray-700 text-white border-gray-600 ${
                errors.temperature ? "border-red-500" : ""
              }`}
              placeholder="예: 25"
            />
            {errors.temperature && (
              <p className="text-sm text-red-500 mt-1">{errors.temperature}</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              -20°C ~ 40°C 사이의 숫자를 입력하세요
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="humidity" className="text-white pl-4">
              적합한 습도
            </Label>
            <Input
              id="humidity"
              name="humidity"
              value={plantInfo.humidity}
              onChange={handleInputChange}
              className={`bg-gray-700 text-white border-gray-600 ${
                errors.humidity ? "border-red-500" : ""
              }`}
              placeholder="예: 60"
            />
            {errors.humidity && (
              <p className="text-sm text-red-500 mt-1">{errors.humidity}</p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              0% ~ 100% 사이의 숫자를 입력하세요
            </p>
          </div>
        </div>
      </div>

      {savedPlant && !isEditing && (
        <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-white">저장된 정보</h3>
            <div className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-blue-400 hover:text-blue-300"
              >
                <Pencil className="h-4 w-4 mr-1" />
                수정
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle>식물 정보 삭제</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      정말로 이 식물 정보를 삭제하시겠습니까? 이 작업은 되돌릴
                      수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                      취소
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 text-white hover:bg-red-500"
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="space-y-2 text-gray-300">
            <p>식물: {savedPlant.plantName}</p>
            <p>적정 온도: {savedPlant.temperature}°C</p>
            <p>적정 습도: {savedPlant.humidity}%</p>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4">
        <Button
          onClick={handleSavePlantInfo}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!!errors.temperature || !!errors.humidity}
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? "수정사항 저장" : "정보 저장"}
        </Button>

        {savedPlant && (
          <Button
            onClick={() => setCurrentStep("diary")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            재배일지 작성하기
          </Button>
        )}
      </div>
    </div>
  );

  return (
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
                        <Video className="h-5 w-5 mr-2" />
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
                    <div className="text-center text-gray-400">
                      <p className="mb-2">스트리밍 영상이 여기에 표시됩니다</p>
                      <p className="text-sm">16:9 비율로 표시될 예정</p>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={30}>
              <div className="h-full p-6">
                <div className="h-full rounded-lg border border-gray-700 bg-gray-800/50">
                  {currentStep === "info" ? (
                    <div className="p-6">{renderInfoStep()}</div>
                  ) : (
                    <div className="p-6 h-full">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">
                          재배일지 작성
                        </h2>
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentStep("info")}
                          className="text-white hover:bg-white hover:text-black"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          이전 단계로
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="leafCount" className="text-white">
                              잎의 개수는 몇개인가요?
                            </Label>
                            <Input
                              id="leafCount"
                              name="leafCount"
                              value={diaryEntry.leafCount}
                              onChange={handleDiaryChange}
                              className="bg-gray-700 text-white border-gray-600"
                              placeholder="예: 5개"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="plantHeight" className="text-white">
                              식물의 길이는 얼마인가요?
                            </Label>
                            <Input
                              id="plantHeight"
                              name="plantHeight"
                              value={diaryEntry.plantHeight}
                              onChange={handleDiaryChange}
                              className="bg-gray-700 text-white border-gray-600"
                              placeholder="예: 10cm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="waterAmount"
                              className="text-white flex items-center gap-2"
                            >
                              물은 얼마나 공급되었나요?
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="text-xs cursor-help text-white border-white/40 hover:bg-white/10"
                                    >
                                      <HelpCircle className="h-3 w-3 mr-1" />
                                      도움말
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                    <p>
                                      비커의 눈금을 정확하게 측정하여
                                      작성해주세요
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <Input
                              id="waterAmount"
                              name="waterAmount"
                              value={diaryEntry.waterAmount}
                              onChange={handleDiaryChange}
                              className="bg-gray-700 text-white border-gray-600"
                              placeholder="예: 100ml"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="plantColor" className="text-white">
                              식물의 색깔은 어떠한가요?
                            </Label>
                            <Input
                              id="plantColor"
                              name="plantColor"
                              value={diaryEntry.plantColor}
                              onChange={handleDiaryChange}
                              className="bg-gray-700 text-white border-gray-600"
                              placeholder="예: 진한 초록색"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="additionalNotes"
                            className="text-white"
                          >
                            그 외 관찰내용을 작성해주세요
                          </Label>
                          <Textarea
                            id="additionalNotes"
                            name="additionalNotes"
                            value={diaryEntry.additionalNotes}
                            onChange={handleDiaryChange}
                            className="min-h-[100px] bg-gray-700 text-white border-gray-600"
                            placeholder="예: 잎이 시들어 보이지만 새로운 잎이 나오기 시작했다..."
                          />
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
                  )}
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
                                  <h3 className="text-white font-medium">
                                    {record.plantName}
                                  </h3>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      record.createdAt
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                  <p>잎 개수: {record.leafCount}</p>
                                  <p>길이: {record.plantHeight}</p>
                                  <p>물 공급량: {record.waterAmount}</p>
                                  <p>색깔: {record.plantColor}</p>
                                </div>
                                {record.additionalNotes && (
                                  <p className="text-sm text-gray-400 mt-2 border-t border-gray-600 pt-2">
                                    {record.additionalNotes}
                                  </p>
                                )}
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
      </div>
    </div>
  );
}
