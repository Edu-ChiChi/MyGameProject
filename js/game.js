// js/game.js (전체 내용)

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    tokens: 0, // 집중력 코인 초기값
};

// 🚀 행동주의 미션 목록 (랜덤으로 선택됨)
const behaviorismTasks = [
    // 강화 (Reinforcement)
    { id: 1, title: "수학 문제 5개 풀기", type: "reinforce", value: 1, action: "목표 달성 확인" },
    { id: 2, title: "교과서 20분 집중해서 읽기", type: "reinforce", value: 1, action: "목표 달성 확인" },
    { id: 3, title: "오늘 배운 개념 3가지 요약하기", type: "reinforce", value: 2, action: "목표 달성 확인" },
    { id: 4, title: "스터디 그룹 모임 시간에 맞춰 참석하기", type: "reinforce", value: 1, action: "목표 달성 확인" },
    // 처벌 (Punishment)
    { id: 5, title: "공부 중 SNS 알림 확인", type: "punish", value: -1, action: "시작하기" },
    { id: 6, title: "숙제를 미루고 게임하기", type: "punish", value: -2, action: "시작하기" },
    { id: 7, title: "책상 정리 안 하고 공부 시작하기", type: "punish", value: -1, action: "시작하기" },
    { id: 8, title: "시험 전날 밤샘 공부 시도 (비효율적 행동)", type: "punish", value: -1, action: "시작하기" },
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
const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');

// 🚀 [새로 추가] 해결/결론 화면 요소
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button');

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
    resolutionArea.style.display = 'none'; // 🚀 해결 영역 숨기기 추가
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';
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

    // 🌟 [수정] 5 코인 모으면 미션 완료 처리 및 해결 화면으로 전환
    if (gameState.tokens >= 5) {
        alert(`🎉 미션 완료! 5 코인을 모았습니다! '습관의 저금통' 미션을 성공적으로 마쳤습니다!`); 
        
        // 미션 완료 시 해결 화면으로 이동
        gameState.tokens = 0; // 코인 초기화
        currentTokensDisplay.textContent = gameState.tokens;
        showScreen('resolution-area'); 
    }
}


// 🚀 새로운 행동주의 미션을 로드하는 함수 (두 개 선택)
function loadNewBehaviorismTask() {
    const availableTasks = [...behaviorismTasks]; 
    currentTasks = [];
    
    // 첫 번째 미션 선택
    let randomIndex = Math.floor(Math.random() * availableTasks.length);
    currentTasks.push(availableTasks.splice(randomIndex, 1)[0]);

    // 두 번째 미션 선택 (나머지 풀에서)
    randomIndex = Math.floor(Math.random() * availableTasks.length);
    currentTasks.push(availableTasks.splice(randomIndex, 1)[0]);
    
    // 카드 1 업데이트
    taskText1.textContent = currentTasks[0].title;
    taskButton1.textContent = currentTasks[0].action;
    taskCard1.classList.remove('correct-choice', 'wrong-choice');
    if (currentTasks[0].type === 'reinforce') {
        taskCard1.classList.add('correct-choice');
    } else {
        taskCard1.classList.add('wrong-choice');
    }

    // 카드 2 업데이트
    taskText2.textContent = currentTasks[1].title;
    taskButton2.textContent = currentTasks[1].action;
    taskCard2.classList.remove('correct-choice', 'wrong-choice');
    if (currentTasks[1].type === 'reinforce') {
        taskCard2.classList.add('correct-choice');
    } else {
        taskCard2.classList.add('wrong-choice');
    }
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

// 3-3. 미션 포기 버튼 클릭 시
abandonMissionButton.addEventListener('click', () => {
    if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
        // 미션을 포기하고 전문가 선택 화면으로 돌아갈 때 코인 초기화
        gameState.tokens = 0;
        currentTokensDisplay.textContent = gameState.tokens;

        showScreen('expert-selection-area'); 
    }
});

// 🚀 [새로 추가] 해결 화면에서 버튼 클릭 시 전문가 선택 화면으로 복귀
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
        loadNewBehaviorismTask();
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

taskButton1.addEventListener('click', () => handleTaskClick(0)); 
taskButton2.addEventListener('click', () => handleTaskClick(1));


// 6. 초기 화면 설정: 페이지 로드 시 초기 고민 화면 표시
window.onload = () => {
    showScreen('initial-problem-area');
};