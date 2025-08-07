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
  "student1@test.co.kr": "김○○",
  "student2@test.co.kr": "김○○",
  "student3@test.co.kr": "이○○",
  "student4@test.co.kr": "주○○",
};

export const SPECIAL_STUDENT_NAMES: Record<string, string> = {
  "special@test.co.kr": "정○○",
};

// 기존 타입은 주석 처리
// export interface PlantIdHealthAssessment {
//   is_healthy: boolean;
//   diseases: Array<{
//     name: string;
//     probability: number;
//     details?: string;
//   }>;
// }
// export interface PlantIdSpecies {
//   scientific_name: string;
//   common_names: string[];
//   probability: number;
// }
// export interface PlantIdResult {
//   species: PlantIdSpecies[];
//   health_assessment?: PlantIdHealthAssessment;
//   // 필요에 따라 추가 필드 정의
// }

// plant.id API 예시 응답 구조에 맞는 타입 정의
export interface PlantIdApiIsPlant {
  probability: number;
  threshold: number;
  binary: boolean;
}

export interface PlantIdApiIsHealthy {
  binary: boolean;
  threshold: number;
  probability: number;
}

export interface PlantIdApiDiseaseSuggestionImage {
  id: string;
  url: string;
  license_name: string;
  license_url: string;
  citation: string;
  similarity: number;
  url_small: string;
}

export interface PlantIdApiDiseaseSuggestionDetails {
  language: string;
  entity_id: string;
}

export interface PlantIdApiDiseaseSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: PlantIdApiDiseaseSuggestionImage[];
  details: PlantIdApiDiseaseSuggestionDetails;
}

export interface PlantIdApiDiseaseQuestionOption {
  suggestion_index: number;
  entity_id: string;
  name: string;
  translation: string;
}

export interface PlantIdApiDiseaseQuestion {
  text: string;
  translation: string;
  options: {
    yes: PlantIdApiDiseaseQuestionOption;
    no: PlantIdApiDiseaseQuestionOption;
  };
}

export interface PlantIdApiDisease {
  suggestions: PlantIdApiDiseaseSuggestion[];
  question: PlantIdApiDiseaseQuestion;
}

export interface PlantIdApiResult {
  is_plant: PlantIdApiIsPlant;
  is_healthy: PlantIdApiIsHealthy;
  disease: PlantIdApiDisease;
}

export interface PlantIdApiResponse {
  access_token: string;
  model_version: string;
  custom_id: string | null;
  input: Record<string, unknown>;
  result: PlantIdApiResult;
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}
