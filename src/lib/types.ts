export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  email: string;
  role: UserRole;
  name: string;
  class?: string; // 학생인 경우 반 정보
}

export interface PlantRecord {
  id: string;
  name: string;
  date: string;
  height: number;
  leaves: number;
  notes: string;
  lastWatered: string;
}

export const USER_ROLES: Record<string, UserRole> = {
  "student1@test.co.kr": "student",
  "student2@test.co.kr": "student",
  "student3@test.co.kr": "student",
  "student4@test.co.kr": "student",
  "student5@test.co.kr": "student",
  "teacher1@test.co.kr": "teacher",
  "admin@test.co.kr": "admin",
};

export const STUDENT_NAMES: Record<string, string> = {
  "student1@test.co.kr": "김석경",
  "student2@test.co.kr": "김하준",
  "student3@test.co.kr": "이성은",
  "student4@test.co.kr": "주민서",
};

export const SPECIAL_STUDENT_NAMES: Record<string, string> = {
  "special@test.co.kr": "정하윤",
};
