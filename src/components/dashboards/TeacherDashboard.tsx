"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlantDiary {
  plantHeight: string;
  leafCount: string;
  waterAmount: string;
  plantColor: string;
  additionalNotes: string;
  createdAt: string;
  plantName: string;
  email: string;
  diaryId: string;
  plantId: string;
  lastModified: string;
}

interface Plant {
  plantName: string;
  temperature: string;
  humidity: string;
  createdAt: string;
  lastModified: string;
  plantId: string;
  email: string;
}

interface StudentData {
  email?: string;
  role?: string;
  plants?: {
    [key: string]: Plant;
  };
  diaries?: {
    [plantId: string]: {
      [diaryId: string]: PlantDiary;
    };
  };
}

interface Answer {
  answer: string;
  email: string;
  timestamp: number;
}

interface AnswerData {
  [questionType: string]: {
    [answerId: string]: Answer;
  };
}

interface UserData {
  [uid: string]: StudentData;
}

interface DiaryEntry {
  date: string;
  height: number;
  leaves: number;
  water: number;
  color: string;
  notes: string;
}

interface CustomTooltipPayload {
  color: string;
  notes: string;
  date: string;
  height: number;
  leaves: number;
  water: number;
  [key: string]: string | number;
}

export default function TeacherDashboard() {
  const [userData, setUserData] = useState<UserData>({});
  const [answerData, setAnswerData] = useState<AnswerData>({});
  const [studentCount, setStudentCount] = useState(0);
  const [plantCount, setPlantCount] = useState(0);
  const [todayRecords, setTodayRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersRef = ref(database, "users");
    const answersRef = ref(database, "answers");

    const unsubscribeUsers = onValue(
      usersRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          console.log("Firebase data received:", data);

          if (!data) {
            setError("데이터가 없습니다.");
            setLoading(false);
            return;
          }

          const filteredData: UserData = {};

          // 학생 데이터만 필터링 (diaries나 plants가 있는 사용자)
          Object.entries(data).forEach(([uid, userData]) => {
            console.log("Processing user:", uid, userData);

            const typedUserData = userData as StudentData;
            if (
              typedUserData &&
              typeof typedUserData === "object" &&
              (typedUserData.diaries || typedUserData.plants) &&
              typedUserData.role !== "teacher"
            ) {
              console.log("Found student:", typedUserData);
              filteredData[uid] = typedUserData;
            }
          });

          console.log("Filtered student data:", filteredData);
          setUserData(filteredData);

          // 통계 계산
          const studentCount = Object.keys(filteredData).length;
          let totalPlants = 0;
          let todayRecords = 0;
          const today = new Date().toISOString().split("T")[0];

          Object.values(filteredData).forEach((student) => {
            if (student.plants) {
              totalPlants += Object.keys(student.plants).length;
            }
            if (student.diaries) {
              Object.values(student.diaries).forEach((plantDiaries) => {
                Object.values(plantDiaries).forEach((diary: PlantDiary) => {
                  const diaryDate = new Date(diary.createdAt)
                    .toISOString()
                    .split("T")[0];
                  if (diaryDate === today) {
                    todayRecords++;
                  }
                });
              });
            }
          });

          console.log("Statistics:", {
            studentCount,
            totalPlants,
            todayRecords,
          });

          setStudentCount(studentCount);
          setPlantCount(totalPlants);
          setTodayRecords(todayRecords);
          setError(null);
        } catch (err) {
          console.error("Error processing data:", err);
          setError("데이터 처리 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setError("Firebase 연결 중 오류가 발생했습니다.");
        setLoading(false);
      }
    );

    const unsubscribeAnswers = onValue(
      answersRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            setAnswerData(data);
          }
        } catch (err) {
          console.error("Error processing answers:", err);
        }
      },
      (error) => {
        console.error("Firebase answers error:", error);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeAnswers();
    };
  }, []);

  const getStudentGrowthData = (studentData: StudentData): DiaryEntry[] => {
    const diaryEntries: DiaryEntry[] = [];

    if (studentData.diaries) {
      Object.values(studentData.diaries).forEach((plantDiaries) => {
        Object.values(plantDiaries).forEach((diary: PlantDiary) => {
          diaryEntries.push({
            date: new Date(diary.createdAt).toLocaleDateString(),
            height: Number(diary.plantHeight),
            leaves: Number(diary.leafCount),
            water: Number(diary.waterAmount),
            color: diary.plantColor,
            notes: diary.additionalNotes,
          });
        });
      });
    }

    return diaryEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white">데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">
              전체 학생 수
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              {studentCount}명
            </p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">
              관찰 식물 수
            </h3>
            <p className="text-3xl font-bold text-white mt-2">{plantCount}개</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-300">
              오늘의 관찰 기록
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              {todayRecords}건
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            학생별 관찰 기록
          </h2>
          <div className="space-y-8">
            {Object.entries(userData).length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                등록된 학생이 없습니다.
              </div>
            ) : (
              Object.entries(userData).map(([uid, student]) => {
                const studentEmail = student.plants
                  ? Object.values(student.plants)[0]?.email
                  : null;
                if (!studentEmail) return null;

                const studentAnswers = {
                  germination: Object.entries(
                    answerData.germination || {}
                  ).find(([, answer]) => answer.email === studentEmail)?.[1],
                  growth: Object.entries(answerData.growth || {}).find(
                    ([, answer]) => answer.email === studentEmail
                  )?.[1],
                };

                const growthData = getStudentGrowthData(student);

                return (
                  <div
                    key={uid}
                    className="space-y-6 bg-gray-700/30 p-6 rounded-lg"
                  >
                    <h3 className="text-xl font-semibold text-white border-b border-gray-600 pb-2">
                      {studentEmail}
                    </h3>

                    {/* 답변 섹션 */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">
                        학습 답변
                      </h4>
                      {studentAnswers.germination && (
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <p className="text-gray-300 font-medium">
                            씨가 싹트는데 필요한 조건:
                          </p>
                          <p className="text-white ml-4 mt-1">
                            {studentAnswers.germination.answer}
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            작성일:{" "}
                            {new Date(
                              studentAnswers.germination.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {studentAnswers.growth && (
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <p className="text-gray-300 font-medium">
                            식물이 자라나는데 필요한 조건:
                          </p>
                          <p className="text-white ml-4 mt-1">
                            {studentAnswers.growth.answer}
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            작성일:{" "}
                            {new Date(
                              studentAnswers.growth.timestamp
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 성장 기록 차트 */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">
                        성장 기록
                      </h4>
                      <ChartContainer
                        className="bg-gray-800/50 p-4 rounded-lg"
                        config={{
                          height: { color: "#10b981" },
                          leaves: { color: "#3b82f6" },
                          water: { color: "#6366f1" },
                        }}
                      >
                        <LineChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip
                            content={(props: TooltipProps<number, string>) => {
                              if (
                                props.active &&
                                props.payload &&
                                props.payload.length
                              ) {
                                const customPayload = props.payload[0]
                                  .payload as CustomTooltipPayload;
                                return (
                                  <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
                                    <p className="text-white font-semibold">
                                      {props.label}
                                    </p>
                                    {props.payload.map((entry) => (
                                      <p
                                        key={entry.name}
                                        style={{ color: entry.color }}
                                      >
                                        {entry.name}: {entry.value}
                                      </p>
                                    ))}
                                    <p className="text-gray-300 mt-2">
                                      식물 색상:{" "}
                                      {customPayload.color || "기록 없음"}
                                    </p>
                                    {customPayload.notes && (
                                      <p className="text-gray-300">
                                        관찰 노트: {customPayload.notes}
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="height"
                            name="키(cm)"
                            stroke="#10b981"
                          />
                          <Line
                            type="monotone"
                            dataKey="leaves"
                            name="잎 수"
                            stroke="#3b82f6"
                          />
                          <Line
                            type="monotone"
                            dataKey="water"
                            name="물 주기(ml)"
                            stroke="#6366f1"
                          />
                        </LineChart>
                      </ChartContainer>

                      {/* 최근 관찰 기록 */}
                      <div className="space-y-2">
                        <h4 className="text-lg font-medium text-white">
                          최근 관찰 기록
                        </h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          {growthData
                            .slice(-3)
                            .reverse()
                            .map((entry, index) => (
                              <div
                                key={index}
                                className="bg-gray-800/50 p-4 rounded-lg"
                              >
                                <p className="text-gray-300">{entry.date}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-white">
                                    키: {entry.height}cm
                                  </p>
                                  <p className="text-white">
                                    잎 수: {entry.leaves}개
                                  </p>
                                  <p className="text-white">
                                    물 주기: {entry.water}ml
                                  </p>
                                  <p className="text-white">
                                    식물 색상: {entry.color || "기록 없음"}
                                  </p>
                                  {entry.notes && (
                                    <p className="text-white">
                                      관찰 노트: {entry.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
