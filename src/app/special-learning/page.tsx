"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, set, get } from "firebase/database";
import ChatbotButton from "@/components/ChatbotButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoModalButton from "@/components/VideoModalButton";

const QUESTIONS = [
  {
    question: "식물은 어떤 부분으로 이루어져 있나요? (여러 개 선택 가능)",
    options: ["뿌리", "줄기", "잎", "꽃", "열매"],
    minSelect: 1,
    maxSelect: 5,
  },
  {
    question: "잎은 무엇을 하나요?",
    options: ["꽃을 피워요", "햇빛을 받아 음식(양분)을 만들어요", "흙을 파요"],
    minSelect: 1,
    maxSelect: 1,
  },
  {
    question: "줄기는 어떤 일을 하나요?",
    options: [
      "꽃을 잡아요",
      "물과 양분을 나르며 식물을 지탱해요",
      "잎을 먹어요",
    ],
    minSelect: 1,
    maxSelect: 1,
  },
  {
    question:
      "식물이 잘 자라기 위해 필요한 것은 무엇인가요? (3가지 이상 고르기)",
    options: ["햇빛", "물", "바람", "흙", "노래"],
    minSelect: 3,
    maxSelect: 5,
  },
];

export default function SpecialLearningPage() {
  const [answers, setAnswers] = useState<{ [idx: number]: boolean[] }>({});
  const [name, setName] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  function getEmailId(email: string) {
    return email.split("@")[0];
  }

  const fetchSpecialAnswersByUid = async (uid: string) => {
    const answerRef = ref(database, `users/${uid}/specialAnswers`);
    const answerSnap = await get(answerRef);
    if (answerSnap.exists()) {
      return answerSnap.val();
    }
    return null;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      alert("로그인이 필요합니다. 다시 로그인 해주세요.");
      router.push("/special-login");
      return;
    }
    setUid(user.uid);

    // 이름이 DB에 저장되어 있다면 가져오기
    const fetchNameAndAnswers = async () => {
      setLoading(true);
      const nameRef = ref(database, `specialStudents/${user.uid}/name`);
      const nameSnap = await get(nameRef);
      if (nameSnap.exists()) {
        setName(nameSnap.val());
      } else {
        setName(
          user.displayName ||
            (user.email ? getEmailId(user.email) : "이름 없음")
        );
      }
      const data = await fetchSpecialAnswersByUid(user.uid);
      if (data && data.answers) {
        setAnswers(data.answers);
      }
      setLoading(false);
    };
    fetchNameAndAnswers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/special-login");
    } catch {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="text-white p-8">로딩 중...</div>;
  }

  const handleCheck = (qIdx: number, oIdx: number) => {
    setAnswers((prev) => {
      const prevArr =
        prev[qIdx] || Array(QUESTIONS[qIdx].options.length).fill(false);
      const newArr = [...prevArr];
      newArr[oIdx] = !newArr[oIdx];
      return { ...prev, [qIdx]: newArr };
    });
  };

  const handleSubmit = async () => {
    if (!uid) return;
    setSubmitLoading(true);
    setSubmitSuccess(null);
    setSubmitError(null);
    try {
      const user = auth.currentUser;
      const data = {
        name: name,
        uid: uid,
        email: user?.email || null,
        timestamp: Date.now(),
        answers,
      };
      const answerRef = ref(database, `users/${uid}/specialAnswers`);
      await set(answerRef, data);
      setSubmitSuccess("제출이 완료되었습니다!");
      localStorage.setItem("specialStudentName", name);
    } catch {
      setSubmitError("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="bg-gray-800/50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-[120px]">
            <Link href="/special-dashboard">
              <Button variant="ghost" className="text-white p-2">
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">뒤로가기</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            {name}의 관찰 일지
          </h1>
          <div className="flex items-center gap-2 min-w-[120px] justify-end">
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
      <main className="max-w-7xl mx-auto p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-gray-800/50 border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">식물의 구조와 성장</CardTitle>
                <CardDescription className="text-gray-400">
                  아래 문항에 답해보세요. (체크박스 선택)
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full w-10 h-10 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow-lg flex items-center justify-center ml-2"
                      size="icon"
                      onClick={async () => {
                        const text =
                          "식물의 구조와 성장. 아래 문항에 답해보세요. 각 문항 옆의 스피커 버튼을 누르면 문항을 음성으로 들을 수 있습니다.";
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
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="space-y-8">
                {QUESTIONS.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <div className="font-semibold text-base text-white mb-1 flex items-center gap-2">
                      {q.question}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="rounded-full w-8 h-8 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                              size="icon"
                              onClick={async () => {
                                const text = q.question;
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
                    <div className="flex flex-wrap gap-4">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2 cursor-pointer min-w-[90px] text-white"
                        >
                          <input
                            type="checkbox"
                            checked={!!answers[qIdx]?.[oIdx]}
                            onChange={() => handleCheck(qIdx, oIdx)}
                            className="accent-green-500 w-5 h-5"
                          />
                          <span>{opt}</span>
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
                                <p>이 답변 읽어주기</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-8">
              <Button
                onClick={handleSubmit}
                disabled={submitLoading || !uid}
                variant="outline"
              >
                {submitLoading ? "제출 중..." : "제출"}
              </Button>
            </div>
            {submitSuccess && (
              <>
                <p className="text-green-400 text-right mt-2">
                  {submitSuccess}
                </p>
              </>
            )}
            <div className="mt-6 bg-gray-700/40 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">내가 제출한 답</h3>
              <ol className="space-y-4">
                {QUESTIONS.map((q, qIdx) => (
                  <li key={qIdx}>
                    <div className="text-white font-medium mb-1 flex items-center gap-2">
                      {q.question}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              className="rounded-full w-7 h-7 bg-green-500 hover:bg-white hover:text-green-500 transition-colors duration-200 shadow flex items-center justify-center ml-1"
                              size="icon"
                              onClick={async () => {
                                let answerText = "";
                                if (
                                  answers[qIdx] &&
                                  answers[qIdx].some(Boolean)
                                ) {
                                  answerText = q.options
                                    .filter((_, oIdx) => answers[qIdx]?.[oIdx])
                                    .join(", ");
                                } else {
                                  answerText = "선택 없음";
                                }
                                const text = `${q.question} 답변: ${answerText}`;
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
                            <p>답변 읽어주기</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {q.options.map((opt, oIdx) =>
                        answers[qIdx]?.[oIdx] ? (
                          <li
                            key={oIdx}
                            className="bg-green-600 text-white rounded px-2 py-1 text-sm"
                          >
                            {opt}
                          </li>
                        ) : null
                      )}
                      {(!answers[qIdx] || answers[qIdx].every((v) => !v)) && (
                        <li className="text-gray-400 text-sm">(선택 없음)</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
            {submitError && (
              <p className="text-red-400 text-right mt-2">{submitError}</p>
            )}
          </CardContent>
        </Card>
      </main>
      <ChatbotButton onClick={() => setIsChatOpen(!isChatOpen)} />
      <VideoModalButton />
    </div>
  );
}
