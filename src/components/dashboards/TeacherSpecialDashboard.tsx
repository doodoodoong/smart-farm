"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  {
    question: "식물은 어떤 부분으로 이루어져 있나요? (여러 개 선택 가능)",
    options: ["뿌리", "줄기", "잎", "꽃", "열매"],
  },
  {
    question: "잎은 무엇을 하나요?",
    options: ["꽃을 피워요", "햇빛을 받아 음식(양분)을 만들어요", "흙을 파요"],
  },
  {
    question: "줄기는 어떤 일을 하나요?",
    options: [
      "꽃을 잡아요",
      "물과 양분을 나르며 식물을 지탱해요",
      "잎을 먹어요",
    ],
  },
  {
    question:
      "식물이 잘 자라기 위해 필요한 것은 무엇인가요? (3가지 이상 고르기)",
    options: ["햇빛", "물", "바람", "흙", "노래"],
  },
];

interface SpecialAnswer {
  name: string;
  uid: string;
  email: string;
  timestamp: number;
  answers: { [idx: number]: boolean[] };
}

interface SpecialDiary {
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

interface SpecialStudent {
  name: string;
  email: string;
  answers?: SpecialAnswer;
  diaries: SpecialDiary[];
}

export default function TeacherSpecialDashboard() {
  const [students, setStudents] = useState<Record<string, SpecialStudent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (!data) {
            setStudents({});
            setLoading(false);
            return;
          }
          // 이메일 기준으로 학생 데이터 모으기
          const studentMap: Record<string, SpecialStudent> = {};
          Object.values(data).forEach((user: unknown) => {
            if (
              !user ||
              typeof user !== "object" ||
              (!("specialAnswers" in user) && !("specialDiaries" in user))
            )
              return;
            const u = user as {
              specialAnswers?: SpecialAnswer;
              specialDiaries?: Record<string, Record<string, SpecialDiary>>;
              email?: string;
            };
            // email을 string으로 안전하게 변환
            const emailRaw =
              u.specialAnswers?.email || u.specialDiaries?.email || u.email;
            const email =
              typeof emailRaw === "string" ? emailRaw : String(emailRaw ?? "");
            if (!email || email === "undefined" || email === "null") return;
            // 답변
            let answers: SpecialAnswer | undefined = undefined;
            if (u.specialAnswers) {
              answers = {
                name: u.specialAnswers.name,
                uid: u.specialAnswers.uid,
                email: u.specialAnswers.email,
                timestamp: u.specialAnswers.timestamp,
                answers: u.specialAnswers.answers,
              };
            }
            // 일지
            const diaries: SpecialDiary[] = [];
            if (u.specialDiaries) {
              Object.values(u.specialDiaries).forEach((plantDiaries) => {
                if (
                  plantDiaries &&
                  typeof plantDiaries === "object" &&
                  !Array.isArray(plantDiaries)
                ) {
                  if (
                    "diaryId" in plantDiaries &&
                    "createdAt" in plantDiaries
                  ) {
                    diaries.push(plantDiaries as unknown as SpecialDiary);
                  } else if (
                    typeof plantDiaries === "object" &&
                    !Array.isArray(plantDiaries) &&
                    Object.values(
                      plantDiaries as Record<string, unknown>
                    ).every(
                      (d) =>
                        d &&
                        typeof d === "object" &&
                        "diaryId" in d &&
                        "createdAt" in d
                    )
                  ) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    Object.values(plantDiaries as any).forEach((diary) => {
                      diaries.push(diary as SpecialDiary);
                    });
                  }
                }
              });
              diaries.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            }
            studentMap[email] = {
              name:
                answers?.name ||
                (Array.isArray(diaries) && diaries.length > 0
                  ? diaries[0].name
                  : undefined) ||
                (typeof email === "string" && email.includes("@")
                  ? email.split("@")[0]
                  : email),
              email,
              answers,
              diaries: Array.isArray(diaries) ? diaries : [],
            };
          });
          setStudents(studentMap);
          setError(null);
        } catch {
          setError("데이터 처리 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Firebase 연결 중 오류가 발생했습니다.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="relative h-16 flex items-center px-6 mb-2">
        <Link
          href="/dashboard"
          className="absolute left-6 top-1/2 -translate-y-1/2"
        >
          <Button
            variant="ghost"
            className="text-white flex items-center gap-2 p-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">뒤로가기</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white mx-auto">
          특수교육대상자 대시보드
        </h1>
      </header>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-6 p-6">
          {Object.keys(students).length === 0 ? (
            <div className="text-gray-400 text-center py-4">
              등록된 학생이 없습니다.
            </div>
          ) : (
            Object.values(students).map((student) => (
              <Card
                key={student.email}
                className="bg-gray-800/50 border-0 shadow-xl mb-8"
              >
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    {student.name}{" "}
                    <span className="text-gray-400 text-base ml-2">
                      ({student.email})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 답변 섹션 */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">
                      학습 답변
                    </h4>
                    {student.answers ? (
                      <ol className="space-y-4">
                        {QUESTIONS.map((q, qIdx) => (
                          <li key={qIdx}>
                            <div className="text-white font-medium mb-1">
                              {q.question}
                            </div>
                            <ul className="flex flex-wrap gap-2">
                              {q.options.map((opt, oIdx) =>
                                student.answers?.answers?.[qIdx]?.[oIdx] ? (
                                  <li
                                    key={oIdx}
                                    className="bg-green-600 text-white rounded px-2 py-1 text-sm"
                                  >
                                    {opt}
                                  </li>
                                ) : null
                              )}
                              {(!student.answers?.answers?.[qIdx] ||
                                student.answers.answers[qIdx].every(
                                  (v) => !v
                                )) && (
                                <li className="text-gray-400 text-sm">
                                  (선택 없음)
                                </li>
                              )}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="text-gray-400">답변 기록이 없습니다.</div>
                    )}
                  </div>
                  {/* 일지 섹션 */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      재배일지
                    </h4>
                    {student.diaries.length === 0 ? (
                      <div className="text-gray-400">
                        재배일지 기록이 없습니다.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {student.diaries.map((diary) => (
                          <div
                            key={diary.diaryId}
                            className="bg-gray-700/40 rounded-lg p-4"
                          >
                            <div className="flex flex-wrap gap-4 mb-2">
                              <span className="text-white font-medium">
                                식물ID: {diary.plantId}
                              </span>
                              <span className="text-white">
                                잎 수: {diary.leafCount}
                              </span>
                              <span className="text-white">
                                키 성장:{" "}
                                {diary.grewTaller === "yes"
                                  ? "예"
                                  : diary.grewTaller === "no"
                                  ? "아니오"
                                  : "잘 모르겠음"}
                              </span>
                              <span className="text-white">
                                새 잎:{" "}
                                {diary.newLeaf === "yes" ? "예" : "아니오"}
                              </span>
                              <span className="text-white">
                                느낌:{" "}
                                {diary.feeling === "happy"
                                  ? "😊"
                                  : diary.feeling === "neutral"
                                  ? "😐"
                                  : "😢"}
                              </span>
                            </div>
                            <div className="text-gray-400 text-sm">
                              작성일:{" "}
                              {new Date(diary.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
