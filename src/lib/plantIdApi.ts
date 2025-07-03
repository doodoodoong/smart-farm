import { PlantIdApiResponse, PlantIdApiResult } from "./types";

/**
 * plant.id API에 이미지 URL을 전달해 식물 건강 상태를 분석합니다.
 * @param imageUrl Firebase Storage 등 외부 이미지의 다운로드 URL
 * @returns 분석 결과(PlantIdApiResult)
 */
export async function analyzePlantHealth(
  imageUrl: string
): Promise<PlantIdApiResult> {
  const apiKey = process.env.NEXT_PUBLIC_PLANT_ID_API_KEY;
  if (!apiKey) throw new Error("plant.id API Key가 설정되어 있지 않습니다.");

  const endpoint =
    "https://api.plant.id/v3/health_assessment?language=ko&details=local_name,description";

  const body = {
    images: [imageUrl],
    similar_images: true,
    health: "only",
    // 필요에 따라 latitude, longitude, datetime 등 추가 가능
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`plant.id API 오류: ${response.statusText}`);
  }

  const data: PlantIdApiResponse = await response.json();
  // 바로 result만 반환
  return data.result;
}

/**
 * 종 예측(identify)와 건강진단(health_assessment)을 모두 수행하는 통합 함수
 * @param imageUrl 이미지 URL
 * @returns { speciesResult, healthResult } 두 API의 결과를 모두 포함
 */
export async function analyzePlantAll(imageUrl: string): Promise<{
  speciesResult: IdentifyResult;
  healthResult: PlantIdApiResponse;
}> {
  const apiKey = process.env.NEXT_PUBLIC_PLANT_ID_API_KEY;
  if (!apiKey) throw new Error("plant.id API Key가 설정되어 있지 않습니다.");

  // 종 예측(identify)
  const identifyEndpoint = "https://api.plant.id/v2/identify?language=ko";
  const identifyBody = {
    images: [imageUrl],
    details: [
      "common_names",
      "description",
      "description_gpt",
      "description_all",
      "url",
      "name_authority",
      "wiki_description",
      "taxonomy",
      "synonyms",
      "edible_parts",
      "gbif_id",
      "health_assessment",
    ],
  };
  const identifyRes = await fetch(identifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify(identifyBody),
  });
  if (!identifyRes.ok) {
    throw new Error(`plant.id identify API 오류: ${identifyRes.statusText}`);
  }
  const speciesResult: IdentifyResult = await identifyRes.json();

  // 건강진단(health_assessment)
  const healthEndpoint =
    "https://api.plant.id/v3/health_assessment?language=ko";
  const healthBody = {
    images: [imageUrl],
    similar_images: true,
    health: "only",
  };
  const healthRes = await fetch(healthEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": apiKey,
    },
    body: JSON.stringify(healthBody),
  });
  if (!healthRes.ok) {
    throw new Error(
      `plant.id health_assessment API 오류: ${healthRes.statusText}`
    );
  }
  const healthResult: PlantIdApiResponse = await healthRes.json();

  return { speciesResult, healthResult };
}

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
      common_names?: string[];
      description?: string;
      description_gpt?: string;
      description_all?: string;
      url?: string;
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
