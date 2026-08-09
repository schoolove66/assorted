import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// 초기 카테고리 더미 데이터 정의
const DEFAULT_CATEGORIES = [
  { id: 'tab_lesson', title: '교수학습과정안', icon: '📘' },
  { id: 'tab_admin', title: '행정패키지', icon: '🗂️' },
  { id: 'tab1', title: '과학자적 사고로 일상 문제 해결 시뮬레이터', icon: '💡' },
  { id: 'tab2', title: '질병을 예방하는 건강 상식 게임', icon: '🦠' }
];

// 초기 웹앱 더미 데이터 정의
const DUMMY_DATA = [
  {
    category: 'tab_lesson',
    title: '생물의 특성과 교수학습과정안',
    description: '작은 생물의 관찰 및 생물과 비생물의 특징을 파악하고 일상 속 탐구를 연계하는 과학 수업 과정안입니다.',
    appUrl: 'https://vibe-trash-sorting-bot.vercel.app',
    imageUrl: '/thumbnails/sci_maze.png'
  },
  {
    category: 'tab_lesson',
    title: '산성과 염기성 중화 반응 교수학습과정안',
    description: '실험실 안전 수칙 준수와 함께 중화 반응의 기본 개념을 습득하는 가상 탐구 지도안입니다.',
    appUrl: 'https://vibe-chem-lab.vercel.app',
    imageUrl: '/thumbnails/sci_chemistry.png'
  },
  {
    category: 'tab_lesson',
    title: '바이러스 예방 및 세균 탐구 교수학습과정안',
    description: '감염병의 예방과 면역 체계에 관한 초/중등 과학 융합 탐구 활동 과정안입니다.',
    appUrl: 'https://vibe-virus-defender.vercel.app',
    imageUrl: '/thumbnails/health_shield.png'
  },
  {
    category: 'tab_lesson',
    title: '올바른 영양소와 건강 습관 지도안',
    description: '5대 영양소의 체내 역할과 식습관 형성을 위한 시뮬레이션 기반 에듀케이션 과정안입니다.',
    appUrl: 'https://vibe-healthy-habits.vercel.app',
    imageUrl: '/thumbnails/health_lifestyle.png'
  },
  {
    category: 'tab_lesson',
    title: '생태계 보전과 분리배출 융합 지도안',
    description: '환경 보전의 중요성과 AI 분리배출 로봇 모의 실험을 활용한 환경 과학 과정안입니다.',
    appUrl: 'https://vibe-trash-sorting-bot.vercel.app',
    imageUrl: '/thumbnails/sci_maze.png'
  },
  {
    category: 'tab_lesson',
    title: '화학 반응 속도와 온도 측정 수업 지도안',
    description: '온도에 따른 화학 반응 속도 변화를 디지털 계측기로 확인하는 과학 탐구 수업안입니다.',
    appUrl: 'https://vibe-chem-lab.vercel.app',
    imageUrl: '/thumbnails/sci_chemistry.png'
  },
  {
    category: 'tab1',
    title: '우리 동네 쓰레기 분리배출 봇',
    description: '과학적 관찰을 바탕으로 일상속 쓰레기 분리배출 방법을 인공지능 시뮬레이터로 학습하고 올바르게 분리배출하는 과학 탐구 웹앱입니다.',
    appUrl: 'https://vibe-trash-sorting-bot.vercel.app',
    imageUrl: '/thumbnails/sci_maze.png'
  },
  {
    category: 'tab1',
    title: '방구석 화학 연구소 시뮬레이터',
    description: '화학 반응의 원리를 재미있는 가상 실험으로 직접 체득하고, 일상에서 일어나는 산성/염기성 중화 반응 문제를 코딩으로 해결해 봅니다.',
    appUrl: 'https://vibe-chem-lab.vercel.app',
    imageUrl: '/thumbnails/sci_chemistry.png'
  },
  {
    category: 'tab2',
    title: '바이러스 디펜더: 세균 침투 방지 작전',
    description: '우리 몸에 침투하는 바이러스를 막기 위한 손씻기, 마스크 쓰기, 예방 접종의 중요성을 재미있게 퀴즈와 게임으로 배우는 에듀게임입니다.',
    appUrl: 'https://vibe-virus-defender.vercel.app',
    imageUrl: '/thumbnails/health_shield.png'
  },
  {
    category: 'tab2',
    title: '튼튼이의 하루: 건강 습관 타이쿤',
    description: '아침 기상부터 밤에 잠들기까지, 5대 영양소 섭취와 규칙적인 운동 등의 일상 루틴을 지켜가며 캐릭터의 건강 지수를 높이는 습관 형성 게임입니다.',
    appUrl: 'https://vibe-healthy-habits.vercel.app',
    imageUrl: '/thumbnails/health_lifestyle.png'
  }
];

// Firebase 설정 확인
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const isFirebaseConfigured = 
  Boolean(apiKey) && 
  Boolean(projectId) && 
  projectId !== 'your_project_id';

let db = null;
let storage = null;
let useFirebase = false;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    useFirebase = true;
    console.log("Firebase 및 Firestore/Storage가 성공적으로 초기화되었습니다.");
  } catch (error) {
    console.error("Firebase 초기화 중 에러 발생, LocalStorage 모드로 대체합니다:", error);
  }
} else {
  console.warn("Firebase 설정 상태 미흡:");
  console.warn("- VITE_FIREBASE_API_KEY 존재 여부:", Boolean(apiKey));
  console.warn("- VITE_FIREBASE_PROJECT_ID 존재 여부:", Boolean(projectId));
  console.warn("Firebase 환경 변수가 설정되지 않았거나 예시 값입니다. LocalStorage 모드로 동작합니다.");
}

// ----------------------------------------
// LocalStorage 헬퍼 함수
// ----------------------------------------

function getLocalCategories() {
  const localCats = localStorage.getItem('vibe_categories');
  if (!localCats) {
    localStorage.setItem('vibe_categories', JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(localCats);
}

function setLocalCategories(cats) {
  localStorage.setItem('vibe_categories', JSON.stringify(cats));
}

function getLocalProjects() {
  const localData = localStorage.getItem('vibe_projects');
  if (!localData) {
    const initializedData = DUMMY_DATA.map((item, idx) => ({
      id: `local_${Date.now()}_${idx}`,
      ...item
    }));
    localStorage.setItem('vibe_projects', JSON.stringify(initializedData));
    return initializedData;
  }
  return JSON.parse(localData);
}

function setLocalProjects(projects) {
  localStorage.setItem('vibe_projects', JSON.stringify(projects));
}

// ----------------------------------------
// 이미지 Canvas 압축 함수 (용량 다이어트)
// ----------------------------------------
function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDimension = 600; // 최대 가로/세로 길이를 600px로 축소
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // JPEG 포맷 화질 0.7 비율로 인코딩 (Base64 파일 크기 절약)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = (err) => reject(err);
      img.src = event.target.result; // onload/onerror 이벤트 리스너 등록 후에 src 할당
    };
    
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file); // onload/onerror 이벤트 리스너 등록 후에 readAsDataURL 호출
  });
}

// ----------------------------------------
// 공용 API 함수 목록
// ----------------------------------------

// ----------------------------------------
// LocalStorage -> Firebase 자동 마이그레이션 함수
// ----------------------------------------
export async function syncLocalToFirebase() {
  if (!useFirebase || !db) return;

  const isMigrated = localStorage.getItem('vibe_migrated_to_firebase');
  if (isMigrated === 'true') return;

  try {
    console.log("로컬 데이터(LocalStorage)를 Firebase 클라우드로 자동 마이그레이션 시작...");
    
    // 1. 카테고리 동기화
    const localCats = getLocalCategories();
    const catQuerySnapshot = await getDocs(collection(db, 'categories'));
    const existingCatIds = new Set();
    catQuerySnapshot.forEach(docSnap => existingCatIds.add(docSnap.id));

    for (const cat of localCats) {
      if (!existingCatIds.has(cat.id)) {
        await setDoc(doc(db, 'categories', cat.id), { title: cat.title, icon: cat.icon });
        console.log(`카테고리 클라우드 이관 완료: ${cat.title}`);
      }
    }

    // 2. 게시글(프로젝트) 동기화
    const localProjects = getLocalProjects();
    const projQuerySnapshot = await getDocs(collection(db, 'projects'));
    const existingTitles = new Set();
    projQuerySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.title) existingTitles.add(data.title);
    });

    for (const proj of localProjects) {
      // 제목 기준으로 중복 업로드 방지
      if (!existingTitles.has(proj.title)) {
        const { id, ...projectData } = proj;
        await addDoc(collection(db, 'projects'), projectData);
        console.log(`게시글 클라우드 이관 완료: ${proj.title}`);
      }
    }

    localStorage.setItem('vibe_migrated_to_firebase', 'true');
    console.log("로컬 데이터의 Firebase 자동 이관이 성공적으로 완료되었습니다.");
  } catch (error) {
    console.error("로컬 데이터 Firebase 이관 중 오류 발생:", error);
  }
}

// [1] 카테고리 관리 API
export async function getCategories() {
  if (useFirebase && db) {
    try {
      // 최초 연결 시 로컬 데이터를 Firebase로 자동 동기화 시도
      await syncLocalToFirebase();

      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories = [];
      querySnapshot.forEach((docSnapshot) => {
        categories.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      // DB가 비어 있으면 최초 1회 초기 카테고리 심기
      if (categories.length === 0) {
        console.log("Firebase 카테고리 데이터베이스 초기화 진행...");
        const promises = DEFAULT_CATEGORIES.map(async (cat) => {
          await setDoc(doc(db, 'categories', cat.id), { title: cat.title, icon: cat.icon });
          return cat;
        });
        return await Promise.all(promises);
      }
      return categories;
    } catch (error) {
      console.error("Firebase 카테고리 조회 실패, LocalStorage를 로드합니다:", error);
      return getLocalCategories();
    }
  } else {
    return getLocalCategories();
  }
}

export async function addCategory(category) {
  if (useFirebase && db) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), category);
      return { id: docRef.id, ...category };
    } catch (error) {
      console.error("Firebase 카테고리 추가 실패:", error);
      throw error;
    }
  } else {
    const cats = getLocalCategories();
    const newCat = {
      id: `cat_${Date.now()}`,
      ...category
    };
    cats.push(newCat);
    setLocalCategories(cats);
    return newCat;
  }
}

export async function deleteCategory(id) {
  if (useFirebase && db) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return id;
    } catch (error) {
      console.error("Firebase 카테고리 삭제 실패:", error);
      throw error;
    }
  } else {
    let cats = getLocalCategories();
    cats = cats.filter(c => c.id !== id);
    setLocalCategories(cats);
    return id;
  }
}

// [2] 웹앱 등록/수정/삭제 API
export async function getProjects() {
  if (useFirebase && db) {
    try {
      // 최초 연결 시 로컬 데이터를 Firebase로 자동 동기화 시도
      await syncLocalToFirebase();

      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projects = [];
      querySnapshot.forEach((docSnapshot) => {
        projects.push({ id: docSnapshot.id, ...docSnapshot.data() });
      });

      if (projects.length === 0) {
        console.log("Firebase DB가 비어 있어 초기 더미 데이터를 생성합니다.");
        const promises = DUMMY_DATA.map(async (item) => {
          const docRef = await addDoc(collection(db, 'projects'), item);
          return { id: docRef.id, ...item };
        });
        const initializedProjects = await Promise.all(promises);
        return initializedProjects;
      }
      return projects;
    } catch (error) {
      console.error("Firebase 웹앱 조회 실패, LocalStorage를 로드합니다:", error);
      return getLocalProjects();
    }
  } else {
    return getLocalProjects();
  }
}

export async function addProject(project) {
  if (useFirebase && db) {
    try {
      const docRef = await addDoc(collection(db, 'projects'), project);
      return { id: docRef.id, ...project };
    } catch (error) {
      console.error("Firebase 웹앱 추가 실패:", error);
      throw error;
    }
  } else {
    const projects = getLocalProjects();
    const newProject = {
      id: `local_${Date.now()}`,
      ...project
    };
    projects.push(newProject);
    setLocalProjects(projects);
    return newProject;
  }
}

export async function updateProject(id, updatedFields) {
  if (useFirebase && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, updatedFields);
      return { id, ...updatedFields };
    } catch (error) {
      console.error("Firebase 웹앱 업데이트 실패:", error);
      throw error;
    }
  } else {
    const projects = getLocalProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedFields };
      setLocalProjects(projects);
      return projects[index];
    }
    throw new Error("웹앱을 찾을 수 없습니다.");
  }
}

export async function deleteProject(id) {
  if (useFirebase && db) {
    try {
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error("Firebase 웹앱 삭제 실패:", error);
      throw error;
    }
  } else {
    let projects = getLocalProjects();
    projects = projects.filter(p => p.id !== id);
    setLocalProjects(projects);
    return id;
  }
}

// [3] 이미지 업로드 통합 핸들러
export async function uploadImage(file) {
  if (useFirebase && storage) {
    try {
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const storageRef = ref(storage, `thumbnails/${filename}`);
      
      // Firebase Storage 타임아웃 5초 설정 (타임아웃 발생 시 Base64로 자동 우회)
      const uploadPromise = (async () => {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      })();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Storage 업로드 시간 초과")), 5000)
      );

      return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (error) {
      console.warn("Firebase Storage 업로드 실패/타임아웃, Base64 압축으로 우회합니다:", error);
      return await compressImageFile(file);
    }
  } else {
    // LocalStorage 모드인 경우 캔버스 압축 후 Base64 문자열 반환
    return await compressImageFile(file);
  }
}

export function isFirebaseConnected() {
  return useFirebase;
}
