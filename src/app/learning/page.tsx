"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Textarea } from "@/components/ui/textarea";
import { database } from "@/lib/firebase";
import { ref, push, onValue, set, remove } from "firebase/database";
import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Answer {
  id?: string;
  email: string;
  answer: string;
  timestamp: number;
}

interface PlantConditionsDialogProps {
  title: string;
  description: string;
  question: string;
  category: string;
  userEmail: string;
}

function PlantConditionsDialog({
  title,
  description,
  question,
  category,
  userEmail,
}: PlantConditionsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [answer, setAnswer] = React.useState("");
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = React.useState<Answer | null>(null);
  const [deleteAlert, setDeleteAlert] = React.useState<{
    isOpen: boolean;
    answer: Answer | null;
  }>({
    isOpen: false,
    answer: null,
  });

  React.useEffect(() => {
    if (!category || !auth.currentUser) return;

    const answersRef = ref(database, `answers/${category}`);
    const unsubscribe = onValue(
      answersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const answersArray = Object.entries(data).map(([key, value]) => ({
            ...(value as Answer),
            id: key,
          }));
          answersArray.sort((a, b) => b.timestamp - a.timestamp);
          setAnswers(answersArray);
        } else {
          setAnswers([]);
        }
      },
      (error) => {
        console.error("Error fetching answers:", error);
        setError(
          "답변을 불러오는데 실패했습니다. 로그인이 필요할 수 있습니다."
        );
      }
    );

    return () => unsubscribe();
  }, [category]);

  const handleSubmit = async () => {
    if (!answer.trim() || !category) return;
    if (!auth.currentUser) {
      setError("답변을 제출하려면 로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const newAnswer: Answer = {
      email: userEmail,
      answer: answer.trim(),
      timestamp: Date.now(),
    };

    try {
      if (editingAnswer?.id) {
        const answerRef = ref(
          database,
          `answers/${category}/${editingAnswer.id}`
        );
        await set(answerRef, {
          ...newAnswer,
          timestamp: editingAnswer.timestamp,
        });
        setEditingAnswer(null);
      } else {
        await push(ref(database, `answers/${category}`), newAnswer);
      }
      setAnswer("");
      setOpen(false);
    } catch (error) {
      console.error("Error saving answer:", error);
      setError("답변 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ans: Answer) => {
    setEditingAnswer(ans);
    setAnswer(ans.answer);
  };

  const handleCancelEdit = () => {
    setEditingAnswer(null);
    setAnswer("");
  };

  const handleDeleteClick = (ans: Answer) => {
    setDeleteAlert({
      isOpen: true,
      answer: ans,
    });
  };

  const handleDeleteConfirm = async () => {
    const ans = deleteAlert.answer;
    if (!ans?.id || !category) return;

    setIsLoading(true);
    setError(null);

    try {
      const answerRef = ref(database, `answers/${category}/${ans.id}`);
      await remove(answerRef);
      setDeleteAlert({ isOpen: false, answer: null });
    } catch (error) {
      console.error("Error deleting answer:", error);
      setError("답변 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteAlert({ isOpen: false, answer: null });
  };

  const content = (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg">질문에 답해보세요</h3>
          <p className="text-sm text-gray-500">{question}</p>
          <div className="space-y-2">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="여기에 답변을 작성해주세요..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading
                  ? "제출 중..."
                  : editingAnswer
                  ? "답변 수정하기"
                  : "답변 제출하기"}
              </Button>
              {editingAnswer && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  수정 취소
                </Button>
              )}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">다른 학생들의 답변</h3>
          {answers.length > 0 ? (
            answers
              .filter((ans) => ans.email !== userEmail)
              .map((ans, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg space-y-2"
                >
                  <p className="text-sm text-gray-600">{ans.answer}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(ans.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-500">
              아직 다른 학생들의 답변이 없습니다.
            </p>
          )}

          {answers.some((ans) => ans.email === userEmail) && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">내가 작성한 답변</h3>
              {answers
                .filter((ans) => ans.email === userEmail)
                .map((ans, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 rounded-lg space-y-2 relative group"
                  >
                    <p className="text-sm text-gray-600">{ans.answer}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        {new Date(ans.timestamp).toLocaleString()}
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(ans)}
                          className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                          disabled={isLoading}
                          title="답변 수정하기"
                        >
                          <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(ans)}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          disabled={isLoading}
                          title="답변 삭제하기"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteAlert.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleDeleteCancel();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              정말로 이 답변을 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 답변이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isLoading}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isLoading ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            질문에 답하기
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          질문에 답하기
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}

export default function LearningPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string>("");

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white mb-6 hover:bg-white -ml-4 hover:text-black"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          돌아가기
        </Button>

        <h1 className="text-2xl font-bold text-white mb-8">
          지금까지 배운 내용
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800/50 border-0">
            <CardHeader>
              <CardTitle className="text-white">
                씨가 싹트는데 필요한 조건
              </CardTitle>
              <CardDescription className="text-gray-400">
                씨앗이 싹을 틔우기 위해 필요한 기본적인 조건들을 알아봅니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlantConditionsDialog
                title="씨가 싹트는데 필요한 조건"
                description="씨앗이 싹을 틔우기 위해 필요한 기본적인 조건들을 알아봅니다."
                question="씨가 싹트는데 필요한 것은 무엇인가요?"
                category="germination"
                userEmail={userEmail}
              />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-0">
            <CardHeader>
              <CardTitle className="text-white">
                식물이 자라는데 필요한 조건
              </CardTitle>
              <CardDescription className="text-gray-400">
                건강한 식물로 자라기 위해 필요한 핵심 요소들을 알아봅니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlantConditionsDialog
                title="식물이 자라는데 필요한 조건"
                description="건강한 식물로 자라기 위해 필요한 핵심 요소들을 알아봅니다."
                question="식물이 잘 자라기 위해 필요한 것은 무엇인가요?"
                category="growth"
                userEmail={userEmail}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
