import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// 환경변수에서 값 불러오기
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_PLANT_APIKEY!,
  authDomain: process.env.NEXT_PUBLIC_PLANT_AUTHDOMAIN!,
  projectId: process.env.NEXT_PUBLIC_PLANT_PROJECTID!,
  storageBucket: process.env.NEXT_PUBLIC_PLANT_STORAGEBUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_PLANT_MESSAGINGSENDERID!,
  appId: process.env.NEXT_PUBLIC_PLANT_APPID!,
};

// 이미 초기화된 앱이 있으면 재사용, 없으면 새로 초기화
let plantApp: FirebaseApp;
if (!getApps().some((app) => app.name === "PLANT_APP")) {
  plantApp = initializeApp(firebaseConfig, "PLANT_APP");
} else {
  plantApp = getApps().find((app) => app.name === "PLANT_APP")!;
}

// 이 plantApp으로부터 Storage 인스턴스 생성
const plantStorage = getStorage(plantApp);

/**
 * Firebase Storage에 저장된 이미지의 download URL을 반환합니다.
 * @param imagePath Storage 내 이미지 경로 (예: 'images/plant.jpg')
 * @returns download URL (Promise<string>)
 */
export async function getPlantImageUrl(imagePath: string): Promise<string> {
  const imageRef = ref(plantStorage, imagePath);
  return await getDownloadURL(imageRef);
}

export { plantApp, plantStorage };
