// js/game.js (전체 내용)

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    tokens: 0, // 집중력 코인 초기값
};

// 🚀 행동주의 미션 목록 (강화/처벌을 분리하여 관리)
const behaviorismReinforcementTasks = [
    { id: 1, title: "영어 단어 10개 외우기", value: 1, action: "목표 달성 확인" },
    { id: 2, title: "수학 문제 3개 풀기", value: 1, action: "목표 달성 확인" },
    { id: 3, title: "교과서 10분 읽기", value: 1, action: "목표 달성 확인" },
    { id: 4, title: "오늘 학교에서 배운 개념 3가지 요약하기", value: 1, action: "목표 달성 확인" },
    { id: 5, title: "스터디 그룹 모임 시간에 맞춰 참석하기", value: 1, action: "목표 달성 확인" },
];

const behaviorismPunishmentTasks = [
    { id: 101, title: "공부 중 SNS 알림 확인", value: -1, action: "시작하기" },
    { id: 102, title: "숙제를 미루고 게임하기", value: -1, action: "시작하기" },
    { id: 103, title: "책상 정리 안 하고 공부 시작하기", value: -1, action: "시작하기" },
    { id: 104, title: "이전까지 게임하다가 시험 직전날 몰아서 공부하기", value: -1, action: "시작하기" },
];

// 현재 로드된 두 미션을 저장할 변수
let currentTasks = []; 

// 🚀 전략 이름을 한국어로 변환하기 위한 지도
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};

// 1. HTML 요소 가져오기
const initialProblemArea = document.getElementById('initial-problem-area');
const consultButton = document.getElementById('consult-button');
const expertSelectionArea = document.getElementById('expert-selection-area');
const experts = document.querySelectorAll('.expert');

// 미션 진행 중/완료 관련
const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button'); // 해결창의 버튼

// 행동주의 미션 관련 요소
const behaviorismMission = document.getElementById('behaviorism-mission');
const currentTokensDisplay = document.getElementById('current-tokens');

const taskCard1 = document.getElementById('task-card-1');
const taskText1 = document.getElementById('task-text-1');
const taskButton1 = document.getElementById('task-button-1');

const taskCard2 = document.getElementById('task-card-2');
const taskText2 = document.getElementById('task-text-2');
const taskButton2 = document.getElementById('task-button-2');


// 2. 상태 관리 함수: 원하는 화면만 보이게 하고 나머지는 숨깁니다.
function showScreen(screenId) {
    // 모든 화면 숨기기
    initialProblemArea.style.display = 'none';
    expertSelectionArea.style.display = 'none';
    missionArea.style.display = 'none';
    resolutionArea.style.display = 'none'; 
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';

    // 🚀 [새로 추가] 화면 상태에 따른 '다른 전략 체험하기' 버튼 제어
    if (screenId === 'expert-selection-area' || screenId === 'resolution-area') {
        // 미션 선택 화면 또는 완료 화면에서는 버튼 활성화 및 크게 표시
        abandonMissionButton.style.display = 'block';
        abandonMissionButton.textContent = "다른 전략 전문가 만나러 가기";
        abandonMissionButton.disabled = false;
    } else if (screenId === 'mission-area') {
        // 미션 진행 중에는 버튼 숨김 (또는 작게 표시 등) - 여기서는 포기 버튼만 남김
        abandonMissionButton.textContent = "다른 전략 체험하기 (포기)";
        abandonMissionButton.disabled = false; // 이벤트 리스너에서 확인 메시지 처리
    }
}

// 🚀 토큰(코인) 수량을 업데이트하는 함수
function updateTokens(amount) {
    gameState.tokens += amount;
    currentTokensDisplay.textContent = gameState.tokens;
    
    // 시각적 피드백
    if (amount > 0) {
        alert(`✅ 목표 달성! 집중력 코인 ${amount}개를 획득했습니다! (누적: ${gameState.tokens})`);
    } else if (amount < 0) {
        alert(`❌ 경고: 코인 ${Math.abs(amount)}개가 차감됩니다. 집중력을 유지하세요. (누적: ${gameState.tokens})`);
    }

    // 🌟 5 코인 모으면 미션 완료 처리 및 해결 화면으로 전환
    if (gameState.tokens >= 5) {
        
        // 미션 완료 시 해결 화면으로 이동
        gameState.tokens = 0; // 코인 초기화
        currentTokensDisplay.textContent = gameState.tokens;
        showScreen('resolution-area'); 
    }
}


// 🚀 [수정] 새로운 행동주의 미션을 로드하는 함수 (강화 1개 + 처벌 1개)
function loadNewBehaviorismTask() {
    currentTasks = [];
    
    // 1. 강화(Reinforcement) 풀에서 무작위로 1개 선택
    let reinforceIndex = Math.floor(Math.random() * behaviorismReinforcementTasks.length);
    currentTasks.push(behaviorismReinforcementTasks[reinforceIndex]);

    // 2. 처벌(Punishment) 풀에서 무작위로 1개 선택
    let punishIndex = Math.floor(Math.random() * behaviorismPunishmentTasks.length);
    currentTasks.push(behaviorismPunishmentTasks[punishIndex]);
    
    // 카드 1 (강화 미션) 업데이트
    taskText1.textContent = "✅ " + currentTasks[0].title; // 긍정 목표는 1번 카드로 고정
    taskButton1.textContent = currentTasks[0].action;
    taskCard1.classList.remove('wrong-choice');
    taskCard1.classList.add('correct-choice'); // 강화 목표는 항상 correct-choice
    taskCard1.setAttribute('data-task-type', 'reinforce');

    // 카드 2 (처벌 미션) 업데이트
    taskText2.textContent = "❌ " + currentTasks[1].title; // 부정 목표는 2번 카드로 고정
    taskButton2.textContent = currentTasks[1].action;
    taskCard2.classList.remove('correct-choice');
    taskCard2.classList.add('wrong-choice'); // 처벌 목표는 항상 wrong-choice
    taskCard2.setAttribute('data-task-type', 'punish');
}


// 3. 이벤트 핸들러 정의
// 3-1. [고민 상담해주기] 버튼 클릭 시
consultButton.addEventListener('click', () => {
    showScreen('expert-selection-area');
});

// 3-2. 전문가 아이콘 클릭 시
experts.forEach(expert => {
    expert.addEventListener('click', () => {
        const strategy = expert.getAttribute('data-strategy');
        startMission(strategy);
    });
});

// 3-3. 🌟 [수정] 미션 포기 버튼 클릭 시 (확인 메시지 추가)
abandonMissionButton.addEventListener('click', () => {
    // 미션 진행 중일 때만 확인 메시지 띄우기
    if (document.getElementById('mission-area').style.display === 'block') {
        if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
            // 미션을 포기하고 전문가 선택 화면으로 돌아갈 때 코인 초기화
            gameState.tokens = 0;
            currentTokensDisplay.textContent = gameState.tokens;

            showScreen('expert-selection-area'); 
        }
    } else {
        // 미션 선택 화면 혹은 완료 화면에서는 바로 전환
        showScreen('expert-selection-area'); 
    }
});

// 3-4. 해결 화면에서 버튼 클릭 시 전문가 선택 화면으로 복귀
restartButton.addEventListener('click', () => {
    showScreen('expert-selection-area');
});


// 4. 미션 시작 함수 (화면 전환 및 미션 로드)
function startMission(strategy) {
    showScreen('mission-area');
    
    const koreanName = strategyMap[strategy] || strategy; 
    missionArea.querySelector('h2').textContent = `선택한 전략: [${koreanName}] 미션 진행 중...`;
    
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    // 행동주의 미션만 표시
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'block';
        loadNewBehaviorismTask(); // 강화 1개 + 처벌 1개 로드
    }
}


// 5. 행동주의 미션 버튼 클릭 이벤트 연결
function handleTaskClick(taskIndex) {
    if (!currentTasks[taskIndex]) return; 

    // 1. 토큰 업데이트 (이 과정에서 5코인 달성 시 해결 화면으로 전환됨)
    updateTokens(currentTasks[taskIndex].value);
    
    // 2. 해결 화면으로 전환되지 않았으면 (즉, 5코인 미만이면) 새로운 미션 로드
    if (document.getElementById('mission-area').style.display === 'block') {
        loadNewBehaviorismTask();
    }
}

taskButton1.addEventListener('click', () => {
    // taskIndex 0 = 강화 미션
    handleTaskClick(0);
}); 
taskButton2.addEventListener('click', () => {
    // taskIndex 1 = 처벌 미션
    handleTaskClick(1);
});


// 6. 초기 화면 설정: 페이지 로드 시 초기 고민 화면 표시
window.onload = () => {
    showScreen('initial-problem-area');
};