// js/game.js (전체 내용)

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    tokens: 0, // 집중력 코인 초기값 (행동주의)
    correctCognitivismDrops: 0, // 인지주의 미션 정답 개수 카운터
    isBuffed: false, // 🚀 포션 사용 여부 플래그 (토큰 강화)
};

// 🚀 행동주의 미션 목록
const behaviorismReinforcementTasks = [
    { id: 1, title: "영어 단어 10개 외우기", value: 1, action: "목표 달성 확인" },
    { id: 2, title: "수학 문제 3개 풀기", value: 1, action: "목표 달성 확인" },
    { id: 3, title: "교과서 10분 읽기", value: 1, action: "목표 달성 확인" },
    { id: 4, title: "오늘 학교에서 배운 개념 3가지 요약하기", value: 1, action: "목표 달성 확인" },
    { id: 5, title: "스터디 그룹 모임 시간에 맞춰 참석하기", value: 1, action: "목표 달성 확인" },
];

const behaviorismPunishmentTasks = [
    { id: 101, title: "공부 중 SNS 알림 확인", value: -1, action: "실천 시작" },
    { id: 102, title: "숙제를 미루고 게임하기", value: -1, action: "실천 시작" },
    { id: 103, title: "책상 정리 안 하고 공부 시작하기", value: -1, action: "실천 시작" },
    { id: 104, title: "이전까지 게임하다가 시험 직전날 몰아서 공부하기", value: -1, action: "실천 시작" },
];

// 🚀 인지주의 미션 조각 목록
const cognitivismPieces = [
    // 행동주의 (4개)
    { id: 'p1', name: '보상', category: '행동주의' },
    { id: 'p2', name: '처벌', category: '행동주의' },
    { id: 'p3', name: '자극-반응', category: '행동주의' },
    { id: 'p4', name: '토큰 경제', category: '행동주의' },
    // 인지주의 (4개)
    { id: 'p5', name: '스키마', category: '인지주의' },
    { id: 'p6', name: '메타인지', category: '인지주의' },
    { id: 'p7', name: '정보 처리', category: '인지주의' },
    { id: 'p8', name: '부호화', category: '인지주의' },
    // 구성주의 (4개)
    { id: 'p9', name: '비계(Scaffolding)', category: '구성주의' },
    { id: 'p10', name: '또래 멘토링', category: '구성주의' },
    { id: 'p11', name: '협동 학습', category: '구성주의' },
    { id: 'p12', name: '경험의 재구성', category: '구성주의' },
];

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
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button');

const behaviorismMission = document.getElementById('behaviorism-mission');
const currentTokensDisplay = document.getElementById('current-tokens');

const taskCard1 = document.getElementById('task-card-1');
const taskText1 = document.getElementById('task-text-1');
const taskButton1 = document.getElementById('task-button-1');
const taskInput1 = document.getElementById('task-input-1'); 

const taskCard2 = document.getElementById('task-card-2');
const taskText2 = document.getElementById('task-text-2');
const taskButton2 = document.getElementById('task-button-2');
const taskInput2 = document.getElementById('task-input-2'); 

// 🚀 교환소 관련 요소
const openExchangeButton = document.getElementById('open-exchange-button');
const exchangeModal = document.getElementById('exchange-modal');
const closeModalButton = document.getElementById('close-modal-button');
const modalCurrentTokens = document.getElementById('modal-current-tokens');
const exchangeButtons = document.querySelectorAll('.exchange-button:not(.disabled)');

// 🚀 모션/위치 관련 요소
const piggyBank = document.getElementById('piggy-bank');
let piggyBankRect = null; // 로드 시점에 계산될 저금통 위치 정보

// 🚀 인지주의 미션 관련 요소
const cognitivismMission = document.getElementById('cognitivism-mission');
const puzzlePiecesContainer = document.getElementById('puzzle-pieces-container');
const dropZones = document.querySelectorAll('.drop-zone');


// 2. 상태 관리 함수: 원하는 화면만 보이게 하고 나머지는 숨깁니다.
function showScreen(screenId) {
    // 모든 화면 숨기기
    initialProblemArea.style.display = 'none';
    expertSelectionArea.style.display = 'none';
    missionArea.style.display = 'none';
    resolutionArea.style.display = 'none'; 
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';

    // 화면 상태에 따른 버튼/메시지 제어 (생략/유지)
    if (screenId === 'expert-selection-area' || screenId === 'resolution-area') {
        abandonMissionButton.style.display = 'block';
        abandonMissionButton.textContent = "다른 전략 전문가 만나러 가기";
        abandonMissionButton.disabled = false;
    } else if (screenId === 'mission-area') {
        abandonMissionButton.textContent = "다른 전략 체험하기 (포기)";
        abandonMissionButton.disabled = false;
    }
    
    // 해결 화면의 메시지 업데이트 
    if (screenId === 'resolution-area') {
        if (missionArea.querySelector('h2').textContent.includes('인지주의')) {
             document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! 인지주의 전략 결과`;
             document.querySelector('.result-box p').innerHTML = `와, 정말 감사합니다! <strong>'기억의 방 탈출'</strong> 퍼즐을 풀어 보니 복잡한 내용을 묶어서 정리하는 법(스키마)을 알았어요.`;
             document.querySelector('.result-box .final-message').textContent = `정보를 체계적으로 분류하고 연결하는 능력(정보 처리)이 향상되었습니다.`;
        } else { // 행동주의 성공 시 메시지
             document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! 행동주의 전략 결과`;
             document.querySelector('.result-box p').innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
             document.querySelector('.result-box .final-message').textContent = `칭찬과 보상을 통해 '공부 습관'이라는 긍정적 행동이 강화되었습니다. 이제 혼자서도 집중력을 유지하고 목표를 달성할 수 있을 거예요!`;
        }
    }
}


// --------------------------------------------------
// 🚀 코인 획득 모션 함수
// --------------------------------------------------

function animateTokenAcquisition(targetButton, amount) {
    if (!piggyBankRect) return;

    for (let i = 0; i < amount; i++) {
        const coin = document.createElement('div');
        coin.classList.add('new-coin');

        const buttonRect = targetButton.getBoundingClientRect();
        
        const startX = buttonRect.left + (buttonRect.width / 2);
        const startY = buttonRect.top + (buttonRect.height / 2);

        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        document.body.appendChild(coin);

        const targetX = piggyBankRect.left + piggyBankRect.width / 2; 
        const targetY = piggyBankRect.top + piggyBankRect.height / 2; 
        
        setTimeout(() => {
            coin.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`;
            coin.style.opacity = 0;
        }, 50 + (i * 100));

        coin.addEventListener('transitionend', () => {
            coin.remove();
        });
    }
}


// 🚀 토큰(코인) 수량을 업데이트하는 함수
function updateTokens(amount, targetButton) {
    let finalAmount = amount;
    
    // 🌟 포션 버프 확인 및 적용 (강화 목표만 해당)
    if (amount > 0 && gameState.isBuffed) {
        finalAmount = amount * 2;
        gameState.isBuffed = false;
        alert(`⭐ 포션 효과 발동! 획득 코인이 ${finalAmount}개로 2배가 됩니다!`);
    }
    
    // 1. 코인 개수 업데이트
    gameState.tokens += finalAmount;
    currentTokensDisplay.textContent = gameState.tokens;

    // 2. 획득/차감 모션 실행
    if (finalAmount > 0) {
        animateTokenAcquisition(targetButton, finalAmount); 
    } else if (finalAmount < 0) {
        alert(`❌ 경고: 코인 ${Math.abs(finalAmount)}개가 차감됩니다. 집중력을 유지하세요. (누적: ${gameState.tokens})`);
    }

    // 3. 미션 완료 확인
    if (gameState.tokens >= 5) {
        alert(`🎉 행동주의 미션 완료! 5 코인을 모았습니다!`); 
        gameState.tokens = 0;
        currentTokensDisplay.textContent = gameState.tokens;
        
        missionArea.querySelector('h2').textContent = `선택한 전략: [행동주의] 미션 완료...`;
        showScreen('resolution-area'); 
    }
}

// 🚀 행동주의 미션 로드
function loadNewBehaviorismTask() {
    currentTasks = [];
    
    let reinforceIndex = Math.floor(Math.random() * behaviorismReinforcementTasks.length);
    currentTasks.push(behaviorismReinforcementTasks[reinforceIndex]);

    let punishIndex = Math.floor(Math.random() * behaviorismPunishmentTasks.length);
    currentTasks.push(behaviorismPunishmentTasks[punishIndex]);
    
    taskText1.textContent = "✅ " + currentTasks[0].title;
    taskButton1.textContent = currentTasks[0].action;
    taskCard1.classList.remove('wrong-choice');
    taskCard1.classList.add('correct-choice');
    taskCard1.setAttribute('data-task-type', 'reinforce');
    taskInput1.value = '';

    taskText2.textContent = "❌ " + currentTasks[1].title;
    taskButton2.textContent = currentTasks[1].action;
    taskCard2.classList.remove('correct-choice');
    taskCard2.classList.add('wrong-choice');
    taskCard2.setAttribute('data-task-type', 'punish');
    taskInput2.value = '';
}

// 🚀 인지주의 미션 로드 (임시)
function loadCognitivismMission() {
    gameState.correctCognitivismDrops = 0;
    puzzlePiecesContainer.innerHTML = '<h4>퍼즐 로딩 중...</h4><p>드래그앤드롭 로직은 현재 개발 중입니다. (임시 메시지)</p>';
}


// 3. 이벤트 핸들러 정의 (시작, 선택, 포기 등)
consultButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
experts.forEach(expert => {
    expert.addEventListener('click', () => {
        const strategy = expert.getAttribute('data-strategy');
        startMission(strategy);
    });
});
abandonMissionButton.addEventListener('click', () => {
    if (confirm("정말 미션을 포기하고 다른 전략을 체험하시겠어요? 진행 상황은 초기화됩니다.")) {
        showScreen('expert-selection-area');
    }
});
restartButton.addEventListener('click', () => { showScreen('expert-selection-area'); });


// 4. 미션 시작 함수
function startMission(strategy) {
    showScreen('mission-area');
    
    const koreanName = strategyMap[strategy] || strategy; 
    missionArea.querySelector('h2').textContent = `선택한 전략: [${koreanName}] 미션 진행 중...`;
    
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'block';
        loadNewBehaviorismTask();
    } else if (strategy === 'cognitivism') {
        cognitivismMission.style.display = 'block';
        loadCognitivismMission();
    }
}


// --------------------------------------------------
// 🚀 5. 행동주의 미션 버튼 클릭 이벤트 연결 (입력창 검증 포함)
// --------------------------------------------------

function handleTaskClick(taskIndex, button, input) {
    if (!currentTasks[taskIndex]) return; 

    // 🚀 입력창 검증: 내용이 비어 있으면 실행 중단
    if (input.value.trim() === '') {
        alert("⚠️ 목표를 실천한 내용을 입력해야 코인을 획득/차감할 수 있습니다.");
        return;
    }

    // 1. 토큰 업데이트 (버튼 요소를 함께 전달)
    updateTokens(currentTasks[taskIndex].value, button);

    // 2. 입력창 비우기 및 새로운 미션 로드
    if (document.getElementById('mission-area').style.display === 'block') {
        input.value = '';
        loadNewBehaviorismTask();
    }
}

taskButton1.addEventListener('click', (e) => {
    handleTaskClick(0, e.currentTarget, taskInput1);
}); 
taskButton2.addEventListener('click', (e) => {
    handleTaskClick(1, e.currentTarget, taskInput2);
});

// --------------------------------------------------
// 🚀 7. 교환소 로직
// --------------------------------------------------

// 교환소 열기
openExchangeButton.addEventListener('click', () => {
    modalCurrentTokens.textContent = gameState.tokens;
    exchangeModal.style.display = 'flex';
});

// 교환소 닫기
closeModalButton.addEventListener('click', () => {
    exchangeModal.style.display = 'none';
});

// 교환 처리 함수 (포션만 구현)
function handleExchange(cost) {
    if (gameState.isBuffed) {
        alert("⚠️ 이미 '개념 요약 포션' 효과가 적용 중입니다. 다음 턴에 사용해 주세요!");
        return;
    }

    if (gameState.tokens >= cost) {
        gameState.tokens -= cost;
        currentTokensDisplay.textContent = gameState.tokens;
        modalCurrentTokens.textContent = gameState.tokens;

        gameState.isBuffed = true;

        alert(`✨ '개념 요약 포션'을 구매했습니다! (남은 코인: ${gameState.tokens}개) \n 다음 목표 달성 시, 코인을 2배(1+1)로 획득합니다!`);
        exchangeModal.style.display = 'none'; 
    } else {
        alert(`❌ 코인이 부족합니다! (필요 코인: ${cost}개 / 현재 코인: ${gameState.tokens}개)`);
    }
}

// 교환 버튼 리스너 연결
exchangeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const cost = parseInt(e.currentTarget.dataset.cost);
        if (e.currentTarget.dataset.id === 'potion') {
            handleExchange(cost);
        }
    });
});


// 6. 초기 화면 설정: 페이지 로드 시 초기 고민 화면 표시
window.onload = () => {
    // 초기 화면 표시
    showScreen('initial-problem-area');
    
    // 🚀 페이지 로드 후 저금통 위치 계산 (코인 애니메이션을 위해 필수)
    if (piggyBank) {
        piggyBankRect = piggyBank.getBoundingClientRect();
    }
};