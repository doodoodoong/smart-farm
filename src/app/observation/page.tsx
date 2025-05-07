"use client";

import { useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, push, onValue, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Observation {
  id: string;
  content: string;
  timestamp: number;
  userId: string;
  userName: string;
}

export default function ObservationPage() {
  const [content, setContent] = useState("");
  const [observations, setObservations] = useState<Observation[]>([]);
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    // 관찰 기록 실시간 동기화
    const observationsRef = ref(database, "observations");
    onValue(observationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const observationList = Object.entries(data).map(([id, value]) => ({
          id,
          ...(value as Omit<Observation, "id">),
        }));
        setObservations(
          observationList.sort((a, b) => b.timestamp - a.timestamp)
        );
      } else {
        setObservations([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !auth.currentUser) return;

    try {
      const observationsRef = ref(database, "observations");
      await push(observationsRef, {
        content: content.trim(),
        timestamp: Date.now(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "익명",
      });
      setContent("");
    } catch (error) {
      console.error("Error saving observation:", error);
      alert("관찰 내용 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (observationId: string) => {
    if (!auth.currentUser) return;

    try {
      const observationRef = ref(database, `observations/${observationId}`);
      await remove(observationRef);
    } catch (error) {
      console.error("Error deleting observation:", error);
      alert("관찰 내용 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">식물 관찰 일지</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘의 관찰 내용을 기록해주세요..."
            className="mb-4 h-32"
          />
          <Button type="submit" disabled={!content.trim()}>
            기록하기
          </Button>
        </form>

        <div className="space-y-4">
          {observations.map((observation) => (
            <Card key={observation.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    {observation.userName} •{" "}
                    {new Date(observation.timestamp).toLocaleString()}
                  </p>
                  <p className="whitespace-pre-wrap">{observation.content}</p>
                </div>
                {auth.currentUser?.uid === observation.userId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(observation.id)}
                  >
                    삭제
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
