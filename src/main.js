import { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  getCategories,
  addCategory,
  deleteCategory,
  uploadImage,
  isFirebaseConnected 
} from './firebase.js';

// ----------------------------------------
// 애플리케이션 상태 관리
// ----------------------------------------
let appProjects = [];
let appCategories = [];
let activeTab = '';
const defaultAdminPassword = '1234';

// DOM 요소 캐싱
const projectsContainer = document.getElementById('projects-container');
const adminLauncherBtn = document.getElementById('admin-launcher-btn');
const dbStatusBadge = document.getElementById('db-status-badge');
const dbStatusText = document.getElementById('db-status-text');

// 모달 및 폼 캐싱
const privacyModal = document.getElementById('privacy-modal');
const termsModal = document.getElementById('terms-modal');
const authModal = document.getElementById('auth-modal');
const adminModal = document.getElementById('admin-modal');

const openPrivacyBtn = document.getElementById('open-privacy-btn');
const openTermsBtn = document.getElementById('open-terms-btn');

const authForm = document.getElementById('auth-form');
const adminPasswordInput = document.getElementById('admin-password');
const authErrorMsg = document.getElementById('auth-error-msg');

// 웹앱 관련 폼 요소
const projectForm = document.getElementById('project-form');
const editProjectIdInput = document.getElementById('edit-project-id');
const projectCategorySelect = document.getElementById('project-category');
const projectTitleInput = document.getElementById('project-title');
const projectDescriptionTextarea = document.getElementById('project-description');
const projectAppUrlInput = document.getElementById('project-app-url');
const projectImageFileInput = document.getElementById('project-image-file');
const projectImageUrlInput = document.getElementById('project-image-url');

const formSubtitleText = document.getElementById('form-subtitle-text');
const btnSubmitProject = document.getElementById('btn-submit-project');
const btnResetForm = document.getElementById('btn-reset-form');
const adminProjectsList = document.getElementById('admin-projects-list');
const projectsCountSpan = document.getElementById('projects-count');

// 카테고리 관련 폼 요소
const categoryForm = document.getElementById('category-form');
const categoryTitleInput = document.getElementById('category-title');
const categoryIconInput = document.getElementById('category-icon');
const adminCategoriesList = document.getElementById('admin-categories-list');
const categoriesCountSpan = document.getElementById('categories-count');

// ----------------------------------------
// 초기화 및 데이터 로드
// ----------------------------------------
async function initializeApp() {
  // DB 접속 상태 아이콘 표시
  const firebaseConnected = isFirebaseConnected();
  if (firebaseConnected) {
    dbStatusBadge.className = 'db-status firebase';
    dbStatusText.textContent = 'Firebase 연동 모드';
  } else {
    dbStatusBadge.className = 'db-status local';
    dbStatusText.textContent = '로컬 저장소 모드';
  }

  // 데이터 로드
  try {
    appCategories = await getCategories();
    appProjects = await getProjects();
    
    // 첫 카테고리를 활성 탭으로 지정
    if (appCategories.length > 0) {
      activeTab = appCategories[0].id;
    }
    
    renderTabs();
    populateCategorySelect();
    renderCards(activeTab);
  } catch (error) {
    console.error("데이터 초기 로드 중 에러 발생:", error);
  }

  setupEventListeners();
}

// ----------------------------------------
// 렌더링 및 UI 바인딩 로직
// ----------------------------------------

// 탭 동적 렌더링
function renderTabs() {
  const tabsContainer = document.querySelector('.tabs-container');
  tabsContainer.innerHTML = '';
  
  if (appCategories.length === 0) {
    tabsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 700; padding: 0.5rem 1rem;">등록된 카테고리가 없습니다.</p>';
    return;
  }
  
  appCategories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    if (activeTab === cat.id) {
      btn.classList.add('active');
    }
    btn.setAttribute('data-tab', cat.id);
    btn.innerHTML = `
      <span class="tab-icon">${cat.icon || '💡'}</span>
      <span>${escapeHtml(cat.title)}</span>
    `;
    
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = cat.id;
      renderCards(activeTab);
    });
    
    tabsContainer.appendChild(btn);
  });
}

// 관리자 폼 카테고리 셀렉트박스 목록 갱신
function populateCategorySelect() {
  projectCategorySelect.innerHTML = '';
  if (appCategories.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '카테고리를 먼저 추가해 주세요';
    projectCategorySelect.appendChild(opt);
    return;
  }

  appCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.icon || '📁'} ${cat.title}`;
    projectCategorySelect.appendChild(opt);
  });
}

// 카드 목록 렌더링
function renderCards(category) {
  projectsContainer.classList.add('fade-out');
  
  setTimeout(() => {
    projectsContainer.innerHTML = '';
    
    const activeCat = appCategories.find(c => c.id === category);
    const filtered = appProjects.filter(p => p.category === category);

    if (filtered.length === 0) {
      projectsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📂</div>
          <p class="empty-title">등록된 과학 웹앱이 없습니다</p>
          <p>우측 하단의 관리자 버튼을 눌러 첫 번째 웹앱을 등록해 보세요!</p>
        </div>
      `;
    } else {
      filtered.forEach(project => {
        const badgeText = activeCat ? `${activeCat.icon} ${activeCat.title}` : '🔬 웹앱';
        const badgeClass = activeCat && activeCat.id === 'tab2' ? 'badge-tab2' : 'badge-tab1';
        
        const card = document.createElement('article');
        card.className = 'project-card';
        card.setAttribute('data-category', project.category);
        
        card.innerHTML = `
          <div class="card-image-wrapper">
            <span class="card-badge ${badgeClass}">${badgeText}</span>
            <img src="${project.imageUrl}" alt="${project.title} 썸네일" class="card-image" onerror="this.src='https://picsum.photos/600/400?random=1'">
          </div>
          <div class="card-content">
            <h3 class="card-title">${escapeHtml(project.title)}</h3>
            <p class="card-desc">${escapeHtml(project.description)}</p>
            <div class="card-actions">
              <a href="${project.appUrl}" target="_blank" rel="noopener noreferrer" class="btn-visit">
                <span>바로가기</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        `;
        projectsContainer.appendChild(card);
      });
    }

    projectsContainer.classList.remove('fade-out');
    projectsContainer.classList.add('fade-in');
  }, 200);
}

// 관리자 웹앱 목록 렌더링
function renderAdminList() {
  adminProjectsList.innerHTML = '';
  projectsCountSpan.textContent = `총 ${appProjects.length}개`;

  if (appProjects.length === 0) {
    adminProjectsList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem;">
        등록된 과학 웹앱이 없습니다.
      </div>
    `;
    return;
  }

  appProjects.forEach((project) => {
    const item = document.createElement('div');
    item.className = 'admin-project-item';
    
    const matchedCat = appCategories.find(c => c.id === project.category);
    const categoryName = matchedCat ? matchedCat.title : '미분류';
    
    item.innerHTML = `
      <div class="admin-item-info">
        <span class="admin-item-title">${escapeHtml(project.title)}</span>
        <span class="admin-item-meta">[${categoryName}] ${escapeHtml(project.appUrl)}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon btn-edit" data-id="${project.id}" title="수정">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button class="btn-icon btn-delete" data-id="${project.id}" title="삭제">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;
    adminProjectsList.appendChild(item);
  });

  // 이벤트 바인딩
  adminProjectsList.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => handleEditProject(btn.dataset.id));
  });

  adminProjectsList.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteProject(btn.dataset.id));
  });
}

// 관리자 카테고리 목록 렌더링
function renderAdminCategoriesList() {
  adminCategoriesList.innerHTML = '';
  categoriesCountSpan.textContent = `총 ${appCategories.length}개`;

  if (appCategories.length === 0) {
    adminCategoriesList.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
        등록된 카테고리가 없습니다.
      </div>
    `;
    return;
  }

  appCategories.forEach((cat) => {
    const item = document.createElement('div');
    item.className = 'admin-project-item';
    
    item.innerHTML = `
      <div class="admin-item-info">
        <span class="admin-item-title">${cat.icon || '💡'} ${escapeHtml(cat.title)}</span>
        <span class="admin-item-meta">ID: ${cat.id}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn-icon btn-delete btn-delete-cat" data-id="${cat.id}" title="삭제">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `;
    adminCategoriesList.appendChild(item);
  });

  // 카테고리 삭제 이벤트 연결
  adminCategoriesList.querySelectorAll('.btn-delete-cat').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteCategory(btn.dataset.id));
  });
}

// ----------------------------------------
// 이벤트 리스너 핸들러
// ----------------------------------------
function setupEventListeners() {
  // 모달 닫기 버튼 공용 처리
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      closeModal(modalId);
    });
  });

  // 외부 영역 클릭 시 모달 닫기
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // 개인정보처리방침 및 이용약관 모달 열기
  openPrivacyBtn.addEventListener('click', () => openModal('privacy-modal'));
  openTermsBtn.addEventListener('click', () => openModal('terms-modal'));

  // 관리자 플로팅 버튼 클릭 (로그인 시도)
  adminLauncherBtn.addEventListener('click', () => {
    adminPasswordInput.value = '';
    authErrorMsg.style.display = 'none';
    openModal('auth-modal');
    adminPasswordInput.focus();
  });

  // 관리자 비밀번호 검증 핸들링
  authForm.addEventListener('submit', () => {
    const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD || defaultAdminPassword;
    const inputPassword = adminPasswordInput.value.trim();

    if (inputPassword === configuredPassword) {
      closeModal('auth-modal');
      openModal('admin-modal');
      renderAdminList();
      renderAdminCategoriesList();
      resetForm();
    } else {
      authErrorMsg.style.display = 'block';
      adminPasswordInput.focus();
      adminPasswordInput.select();
    }
  });

  // 1) 카테고리 등록 폼
  categoryForm.addEventListener('submit', async () => {
    const title = categoryTitleInput.value.trim();
    const icon = categoryIconInput.value.trim();

    if (!title) return;

    try {
      const newCat = await addCategory({ title, icon });
      appCategories.push(newCat);
      
      categoryForm.reset();
      
      // 탭, 선택지, 관리자 리스트 다시 로드
      renderTabs();
      populateCategorySelect();
      renderAdminCategoriesList();
      
      // 만약 첫 카테고리라면 activeTab으로 지정 후 카드 재렌더링
      if (appCategories.length === 1) {
        activeTab = newCat.id;
        renderCards(activeTab);
      }
      
      alert('새 카테고리가 등록되었습니다.');
    } catch (error) {
      alert('카테고리 저장 중 오류가 발생했습니다.');
    }
  });

  // 2) 웹앱 등록 폼 (등록 & 수정 통합)
  projectForm.addEventListener('submit', async () => {
    const editId = editProjectIdInput.value;
    const category = projectCategorySelect.value;
    const title = projectTitleInput.value.trim();
    const description = projectDescriptionTextarea.value.trim();
    const appUrl = projectAppUrlInput.value.trim();
    
    if (!category) {
      alert('카테고리를 선택해 주세요. 등록된 카테고리가 없으면 카테고리를 먼저 추가해야 합니다.');
      return;
    }

    // 파일 또는 텍스트 URL 확인
    let imageUrl = projectImageUrlInput.value.trim();
    const imageFile = projectImageFileInput.files[0];

    // 저장 중 로딩 피드백 제공
    btnSubmitProject.disabled = true;
    btnSubmitProject.textContent = '저장 중...';

    try {
      if (imageFile) {
        // 이미지를 Firebase Storage에 업로드하거나 Canvas 인코딩 진행
        imageUrl = await uploadImage(imageFile);
      }
      
      if (!imageUrl) {
        imageUrl = '/thumbnails/sci_maze.png'; // 썸네일 없을 시 기본 플레이스홀더 사용
      }

      const payload = { category, title, description, appUrl, imageUrl };

      if (editId) {
        // 수정 모드
        const updated = await updateProject(editId, payload);
        appProjects = appProjects.map(p => p.id === editId ? { ...p, ...updated } : p);
        alert('웹앱 정보가 성공적으로 수정되었습니다.');
      } else {
        // 신규 등록 모드
        const newProj = await addProject(payload);
        appProjects.push(newProj);
        alert('신규 웹앱이 등록되었습니다.');
      }
      
      resetForm();
      renderAdminList();
      renderCards(activeTab);
    } catch (error) {
      console.error(error);
      alert('웹앱 저장 중 에러가 발생했습니다.');
    } finally {
      btnSubmitProject.disabled = false;
      btnSubmitProject.textContent = editId ? '수정 완료' : '등록하기';
    }
  });

  // 폼 리셋 버튼
  btnResetForm.addEventListener('click', () => {
    resetForm();
  });
}

// ----------------------------------------
// 폼 상태 및 모달 제어 함수
// ----------------------------------------
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden'; 
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  
  if (!document.querySelector('.modal-overlay.active')) {
    document.body.style.overflow = '';
  }
}

function resetForm() {
  projectForm.reset();
  projectImageFileInput.value = ''; // 파일 필드 강제 초기화
  editProjectIdInput.value = '';
  formSubtitleText.textContent = '새 웹앱 등록';
  btnSubmitProject.textContent = '등록하기';
  projectCategorySelect.focus();
}

// 수정 액션 클릭 시 폼에 주입
function handleEditProject(id) {
  const project = appProjects.find(p => p.id === id);
  if (!project) return;

  editProjectIdInput.value = project.id;
  projectCategorySelect.value = project.category;
  projectTitleInput.value = project.title;
  projectDescriptionTextarea.value = project.description;
  projectAppUrlInput.value = project.appUrl;
  projectImageUrlInput.value = project.imageUrl;
  projectImageFileInput.value = ''; // 수정 시 기존 이미지를 유지하도록 파일 필드는 클리어

  formSubtitleText.textContent = '웹앱 수정하기';
  btnSubmitProject.textContent = '수정 완료';
  projectCategorySelect.focus();
}

// 웹앱 삭제
async function handleDeleteProject(id) {
  const project = appProjects.find(p => p.id === id);
  if (!project) return;

  if (confirm(`'${project.title}' 웹앱을 정말 삭제하시겠습니까?`)) {
    try {
      await deleteProject(id);
      appProjects = appProjects.filter(p => p.id !== id);
      renderAdminList();
      renderCards(activeTab);
    } catch (error) {
      alert('삭제 중 에러가 발생했습니다.');
    }
  }
}

// 카테고리 삭제 (무결성 검사 포함)
async function handleDeleteCategory(id) {
  const matchedApps = appProjects.filter(p => p.category === id);
  
  // 카테고리에 할당된 웹앱이 존재하면 경고하고 삭제 거부
  if (matchedApps.length > 0) {
    alert(`이 카테고리에 등록된 웹앱이 ${matchedApps.length}개 존재합니다. 카테고리를 삭제하려면 먼저 해당 웹앱들을 삭제하거나 다른 카테고리로 설정을 변경해 주세요.`);
    return;
  }

  const category = appCategories.find(c => c.id === id);
  if (!category) return;

  if (confirm(`'${category.title}' 카테고리를 삭제하시겠습니까?`)) {
    try {
      await deleteCategory(id);
      appCategories = appCategories.filter(c => c.id !== id);
      
      // 활성 탭 재조정
      if (activeTab === id) {
        activeTab = appCategories.length > 0 ? appCategories[0].id : '';
      }
      
      renderTabs();
      populateCategorySelect();
      renderAdminCategoriesList();
      renderCards(activeTab);
      
      alert('카테고리가 삭제되었습니다.');
    } catch (error) {
      alert('카테고리 삭제 중 오류가 발생했습니다.');
    }
  }
}

// ----------------------------------------
// 유틸리티 함수
// ----------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 앱 구동
document.addEventListener('DOMContentLoaded', initializeApp);
