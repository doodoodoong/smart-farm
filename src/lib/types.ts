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
  "teacher1@test.co.kr": "teacher",
  "admin@test.co.kr": "admin",
};
