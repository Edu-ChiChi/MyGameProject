// js/game.js (전체 내용)

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    currentStrategy: null,
    tokens: 0, // 집중력 코인 초기값 (행동주의)
    correctCognitivismDrops: 0, // 인지주의 미션 정답 개수 카운터
    isBuffed: false, // 포션 사용 여부 플래그 (토큰 강화)
    totalCognitivismPieces: 12, // 총 퍼즐 조각 수
};

// --------------------------------------------------
// 🚀 데이터 정의
// --------------------------------------------------

// 행동주의 미션 목록
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
let currentTasks = []; 

// 인지주의 미션 조각 목록
const cognitivismPieces = [
    { id: 'p1', name: '보상', category: '행동주의' },
    { id: 'p2', name: '처벌', category: '행동주의' },
    { id: 'p3', name: '자극-반응', category: '행동주의' },
    { id: 'p4', name: '토큰 경제', category: '행동주의' },
    { id: 'p5', name: '스키마', category: '인지주의' },
    { id: 'p6', name: '메타인지', category: '인지주의' },
    { id: 'p7', name: '정보 처리', category: '인지주의' },
    { id: 'p8', name: '부호화', category: '인지주의' },
    { id: 'p9', name: '비계(Scaffolding)', category: '구성주의' },
    { id: 'p10', name: '또래 멘토링', category: '구성주의' },
    { id: 'p11', name: '협동 학습', category: '구성주의' },
    { id: 'p12', name: '경험의 재구성', category: '구성주의' },
];

// 구성주의 시나리오 데이터
const constructivismScenarios = [
    {
        id: 1,
        text: "안녕! 나는 '학습의 원리와 방법' 단원 공부 중인데, 행동주의랑 인지주의가 너무 헷갈려. 개념은 외웠는데 서로 어떻게 다른 건지 모르겠어. 좀 도와줄 수 있을까?",
        choices: [
            { 
                id: 1, 
                scaffolding: "약한 비계", 
                prompt: "두 이론의 핵심 단어만 생각해볼까? 행동주의는 보상, 인지주의는 생각이라고 생각해봐.",
                reaction: "아, 이제 알 것 같아! 행동주의는 외부에서 오는 보상으로 행동을 만드는 거고, 인지주의는 내가 머릿속으로 정보를 정리하는 거구나! 정말 고마워!",
                reward: { badge: '최고 멘토 뱃지', points: 10 }
            },
            { 
                id: 2, 
                scaffolding: "중간 비계", 
                prompt: "행동주의는 강아지 훈련처럼 외적인 보상이 중요하고, 인지주의는 네가 머릿속으로 정보를 정리하는 과정이 중요해.",
                reaction: "아! 그럼 행동주의는 외부에서 오는 보상, 인지주의는 내가 머릿속으로 정보를 정리하는 과정이라는 거지? 덕분에 이해했어!",
                reward: { badge: '유능한 멘토 뱃지', points: 7 }
            },
            { 
                id: 3, 
                scaffolding: "강한 비계", 
                prompt: "행동주의는 '자극과 반응'의 연결을 학습이라고 보는 거야. 인지주의는 '스키마'처럼 정보를 구조화하는 과정이지.",
                reaction: "아, 이제 알았어! 자극과 반응, 스키마, 비계가 각각 행동주의, 인지주의, 구성주의와 연결되는 거구나!",
                reward: { badge: '도움의 손길 뱃지', points: 5 }
            }
        ]
    }
];

// 전략 이름을 한국어로 변환하기 위한 지도
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};

// --------------------------------------------------
// 1. HTML 요소 가져오기
// --------------------------------------------------
const initialProblemArea = document.getElementById('initial-problem-area');
const consultButton = document.getElementById('consult-button');
const expertSelectionArea = document.getElementById('expert-selection-area');
const experts = document.querySelectorAll('.expert');
const expertBubbles = {
    behaviorism: document.querySelector('.behaviorism-bubble'),
    cognitivism: document.querySelector('.cognitivism-bubble'),
    constructivism: document.querySelector('.constructivism-bubble')
};

const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button');
const resolutionMessage = document.getElementById('resolution-message');
const resolutionEffect = document.getElementById('resolution-effect');

// 행동주의 요소
const behaviorismMission = document.getElementById('behaviorism-mission');
const currentTokensDisplay = document.getElementById('current-tokens');
const taskButton1 = document.getElementById('task-button-1');
const taskInput1 = document.getElementById('task-input-1'); 
const taskButton2 = document.getElementById('task-button-2');
const taskInput2 = document.getElementById('task-input-2'); 
const piggyBank = document.getElementById('piggy-bank');
let piggyBankRect = null;

// 교환소 요소
const openExchangeButton = document.getElementById('open-exchange-button');
const exchangeModal = document.getElementById('exchange-modal');
const closeModalButton = document.getElementById('close-modal-button');
const modalCurrentTokens = document.getElementById('modal-current-tokens');
const exchangeButtons = document.querySelectorAll('.exchange-button:not(.disabled)');

// 인지주의 요소
const cognitivismMission = document.getElementById('cognitivism-mission');
const puzzlePiecesContainer = document.getElementById('puzzle-pieces-container');
const dropZones = document.querySelectorAll('.drop-zone');

// 구성주의 요소
const constructivismMission = document.getElementById('constructivism-mission');
const menteeDialogue = document.getElementById('mentee-dialogue');
const scaffoldingChoices = document.getElementById('scaffolding-choices');
const mentorResultMessage = document.getElementById('mentor-result-message');
const menteeReactionText = document.getElementById('mentee-reaction-text');
const mentorRewardArea = document.getElementById('mentor-reward-area');
const mentorBadge = document.getElementById('mentor-badge');
const mentorPoints = document.getElementById('mentor-points');
const completeMentorMissionButton = document.getElementById('complete-mentor-mission');

// --------------------------------------------------
// 2. 상태 관리 및 유틸리티 함수
// --------------------------------------------------

function showScreen(screenId) {
    // 모든 화면 숨기기
    initialProblemArea.style.display = 'none';
    expertSelectionArea.style.display = 'none';
    missionArea.style.display = 'none';
    resolutionArea.style.display = 'none'; 
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';

    // 미션 포기 버튼 표시 제어
    abandonMissionButton.style.display = (screenId === 'mission-area') ? 'block' : 'none';
    
    // 해결 화면 메시지 업데이트
    if (screenId === 'resolution-area') {
        updateResolutionScreen();
    }
}

function updateResolutionScreen() {
    const strategy = gameState.currentStrategy;
    
    if (strategy === 'behaviorism') {
        document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! 행동주의 전략 결과`;
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
        resolutionEffect.textContent = `칭찬과 보상을 통해 '공부 습관'이라는 긍정적 행동이 강화되었습니다. 이제 혼자서도 집중력을 유지하고 목표를 달성할 수 있을 거예요!`;
    } else if (strategy === 'cognitivism') {
        document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! 인지주의 전략 결과`;
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'기억의 방 탈출'</strong> 퍼즐을 풀어 보니 공부할 내용이 많아서 막막했던 고민이 해결됐어요. 복잡한 내용을 묶어서 정리하는 법(스키마)을 알았으니, 이제 어디서부터 시작해야 할지 알 것 같아요!`;
        resolutionEffect.textContent = `정보를 체계적으로 분류하고 연결하는 능력(정보 처리)이 향상되었습니다.`;
    } else if (strategy === 'constructivism') {
        const result = constructivismScenarios[0].choices.find(c => c.id === gameState.constructivismChoiceId);
        document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! 구성주의 전략 결과`;
        resolutionMessage.innerHTML = `와, 정말 감사합니다! 제가 가진 고민이 해결되는 것 같아요. 이제 어떻게 공부해야 할지 알 것 같아요!`;
        resolutionEffect.innerHTML = `당신은 ${result.reward.badge}를 획득했습니다! 다른 사람에게 지식을 설명하고 가르치는 과정을 통해 당신의 지식이 더욱 명료해지는 **'학습 전이 효과'**를 얻었습니다.`;
    }
}

// --------------------------------------------------
// 3. 행동주의 로직 (코인, 모션, 교환소)
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

function updateTokens(amount, targetButton) {
    let finalAmount = amount;
    
    if (amount > 0 && gameState.isBuffed) {
        finalAmount = amount * 2;
        gameState.isBuffed = false;
        alert(`⭐ 포션 효과 발동! 획득 코인이 ${finalAmount}개로 2배가 됩니다!`);
    }
    
    gameState.tokens += finalAmount;
    currentTokensDisplay.textContent = gameState.tokens;

    if (finalAmount > 0) {
        animateTokenAcquisition(targetButton, finalAmount); 
    } else if (finalAmount < 0) {
        alert(`❌ 경고: 코인 ${Math.abs(finalAmount)}개가 차감됩니다. 집중력을 유지하세요. (누적: ${gameState.tokens})`);
    }

    if (gameState.tokens >= 5) {
        alert(`🎉 행동주의 미션 완료! 5 코인을 모았습니다!`); 
        gameState.tokens = 0;
        currentTokensDisplay.textContent = gameState.tokens;
        showScreen('resolution-area'); 
    }
}

function loadNewBehaviorismTask() {
    currentTasks = [];
    
    let reinforceIndex = Math.floor(Math.random() * behaviorismReinforcementTasks.length);
    currentTasks.push(behaviorismReinforcementTasks[reinforceIndex]);

    let punishIndex = Math.floor(Math.random() * behaviorismPunishmentTasks.length);
    currentTasks.push(behaviorismPunishmentTasks[punishIndex]);
    
    document.getElementById('task-text-1').textContent = "✅ " + currentTasks[0].title;
    document.getElementById('task-button-1').textContent = currentTasks[0].action;
    document.getElementById('task-text-2').textContent = "❌ " + currentTasks[1].title;
    document.getElementById('task-button-2').textContent = currentTasks[1].action;
    taskInput1.value = '';
    taskInput2.value = '';
}

function handleTaskClick(taskIndex, button, input) {
    if (!currentTasks[taskIndex]) return; 

    if (input.value.trim() === '') {
        alert("⚠️ 목표를 실천한 내용을 입력해야 코인을 획득/차감할 수 있습니다.");
        return;
    }

    updateTokens(currentTasks[taskIndex].value, button);

    if (missionArea.style.display === 'block') {
        input.value = '';
        loadNewBehaviorismTask();
    }
}

// 교환소 로직
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


// --------------------------------------------------
// 4. 인지주의 로직 (드래그앤드롭)
// --------------------------------------------------
let draggedPiece = null;

function loadCognitivismMission() {
    gameState.correctCognitivismDrops = 0;
    
    // 조각 초기화 및 생성
    puzzlePiecesContainer.innerHTML = '';
    const shuffledPieces = [...cognitivismPieces].sort(() => Math.random() - 0.5);

    shuffledPieces.forEach(pieceData => {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.textContent = pieceData.name;
        piece.setAttribute('draggable', 'true');
        piece.dataset.category = pieceData.category;
        piece.id = pieceData.id;
        puzzlePiecesContainer.appendChild(piece);
    });
    
    // D&D 이벤트 리스너 재할당 (새로 생성된 요소에)
    document.querySelectorAll('.puzzle-piece').forEach(piece => {
        piece.addEventListener('dragstart', handleDragStart);
    });
}

function handleDragStart(e) {
    draggedPiece = e.target;
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => {
        e.target.style.opacity = '0.5';
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault(); // 드롭을 허용
    e.target.closest('.drop-zone')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('.drop-zone')?.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.drop-zone');
    if (!dropZone) return;

    dropZone.classList.remove('drag-over');
    
    // 1. 카테고리 일치 확인
    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(pieceId);

    if (piece.dataset.category === dropZone.dataset.category) {
        // 정답 처리
        piece.classList.remove('puzzle-piece');
        piece.classList.add('dropped-piece');
        piece.setAttribute('draggable', 'false');
        piece.style.opacity = '1';
        piece.style.transform = 'none';
        
        dropZone.appendChild(piece);
        gameState.correctCognitivismDrops++;
        
        // 미션 완료 확인
        if (gameState.correctCognitivismDrops === gameState.totalCognitivismPieces) {
            alert("🎉 모든 개념을 올바르게 연결했습니다! 기억의 방 탈출 성공!");
            showScreen('resolution-area');
        }

    } else {
        // 오답 처리 (원래 위치로 복귀)
        piece.style.opacity = '1';
        alert("🚨 틀린 개념입니다! 다시 생각해 보세요. (조각이 제자리로 돌아갑니다)");
    }
}

// --------------------------------------------------
// 5. 구성주의 로직 (스크립트 시나리오)
// --------------------------------------------------

function loadConstructivismMission() {
    const scenario = constructivismScenarios[0];
    
    // UI 초기화
    menteeDialogue.textContent = scenario.text;
    scaffoldingChoices.innerHTML = '';
    mentorResultMessage.style.display = 'none';
    mentorRewardArea.style.display = 'none';

    // 선택지 버튼 생성
    scenario.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('scaffolding-button');
        button.textContent = `[${choice.scaffolding}] ${choice.prompt}`;
        button.dataset.choiceId = choice.id;
        button.addEventListener('click', () => handleScaffoldingChoice(choice.id));
        scaffoldingChoices.appendChild(button);
    });
}

function handleScaffoldingChoice(choiceId) {
    const scenario = constructivismScenarios[0];
    const choice = scenario.choices.find(c => c.id === choiceId);
    
    // 모든 선택지 비활성화
    document.querySelectorAll('.scaffolding-button').forEach(btn => {
        btn.disabled = true;
    });

    // 결과 메시지 및 보상 표시
    menteeReactionText.textContent = choice.reaction;
    mentorBadge.textContent = choice.reward.badge;
    mentorPoints.textContent = choice.reward.points;
    
    mentorResultMessage.style.display = 'block';
    mentorRewardArea.style.display = 'block';
    
    // 결과 저장을 위해 선택 ID 저장
    gameState.constructivismChoiceId = choiceId;
    
    // 미션 완료 버튼 이벤트 연결 (한 번만 클릭 가능하도록)
    completeMentorMissionButton.onclick = () => {
        showScreen('resolution-area');
        completeMentorMissionButton.onclick = null; // 이벤트 제거
    };
}


// --------------------------------------------------
// 6. 미션 시작 및 초기화
// --------------------------------------------------

function startMission(strategy) {
    gameState.currentStrategy = strategy;
    showScreen('mission-area');
    
    // 모든 미션 화면 숨기기
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'block';
        document.getElementById('exchange-area').style.display = 'block';
        document.getElementById('token-display').style.display = 'block';
        loadNewBehaviorismTask();
    } else if (strategy === 'cognitivism') {
        cognitivismMission.style.display = 'block';
        loadCognitivismMission();
    } else if (strategy === 'constructivism') {
        constructivismMission.style.display = 'block';
        loadConstructivismMission();
    }
}


// --------------------------------------------------
// 7. 이벤트 리스너 연결
// --------------------------------------------------

// 초기화 함수
function initializeGame() {
    // 🚀 전문가 말풍선 고정 메시지 설정
    expertBubbles.behaviorism.textContent = "학습은 자극과 반응 행동을 연결하는 과정입니다. 집중력이 문제라면, 보상으로 학습 습관을 만들어 보세요! 목표를 달성할 때마다 포인트를 드릴게요!";
    expertBubbles.cognitivism.textContent = "학습은 이미 아는 정보를 새로운 정보와 연결하는 과정입니다. 방대한 양이 고민이라면, 효율적인 정리가 필요합니다! 정보를 머릿속에 체계적으로 저장하는 법을 알려드릴게요!";
    expertBubbles.constructivism.textContent = "학습은 학생 스스로 중요하다고 생각하는 내용을 자기 방식대로 이해하는 과정입니다. 혼자서 힘들다면, 협력의 힘을 빌려보세요! 친구와 함께 배우는 방법을 알려드릴게요.";

    // 초기 화면
    showScreen('initial-problem-area');

    // 저금통 위치 계산 (코인 애니메이션용)
    if (piggyBank) {
        piggyBankRect = piggyBank.getBoundingClientRect();
    }

    // 인지주의 D&D 이벤트 리스너 (Drop Zones에)
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

// 시작 버튼
consultButton.addEventListener('click', () => { showScreen('expert-selection-area'); });

// 전문가 선택
experts.forEach(expert => {
    expert.addEventListener('click', () => {
        const strategy = expert.getAttribute('data-strategy');
        startMission(strategy);
    });
});

// 미션 포기 버튼 (확인 메시지 포함)
abandonMissionButton.addEventListener('click', () => {
    if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
        // 게임 상태 초기화
        gameState.tokens = 0;
        gameState.correctCognitivismDrops = 0;
        gameState.isBuffed = false;
        
        // 화면 전환
        showScreen('expert-selection-area');
    }
});

// 재시작 버튼
restartButton.addEventListener('click', () => { showScreen('expert-selection-area'); });

// 행동주의 작업 버튼
taskButton1.addEventListener('click', (e) => { handleTaskClick(0, e.currentTarget, taskInput1); }); 
taskButton2.addEventListener('click', (e) => { handleTaskClick(1, e.currentTarget, taskInput2); });

// 교환소 버튼
openExchangeButton.addEventListener('click', () => {
    modalCurrentTokens.textContent = gameState.tokens;
    exchangeModal.style.display = 'flex';
});
closeModalButton.addEventListener('click', () => { exchangeModal.style.display = 'none'; });
exchangeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const cost = parseInt(e.currentTarget.dataset.cost);
        if (e.currentTarget.dataset.id === 'potion') {
            handleExchange(cost);
        }
    });
});


// 8. 페이지 로드 시 초기화
window.onload = initializeGame;