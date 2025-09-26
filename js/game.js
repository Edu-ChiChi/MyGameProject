// js/game.js (최종 버전: 메인 엔진 역할)

// --------------------------------------------------
// 1. HTML 요소 가져오기 (공통)
// --------------------------------------------------
const initialProblemArea = document.getElementById('initial-problem-area');
const consultButton = document.getElementById('consult-button');
const startCrosswordButtonInitial = document.getElementById('start-crossword-button-initial'); 
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

// 미션별 컨테이너
const behaviorismMission = document.getElementById('behaviorism-mission');
const cognitivismMission = document.getElementById('cognitivism-mission');
const constructivismMission = document.getElementById('constructivism-mission');

// 십자말풀이 요소
const crosswordModal = document.getElementById('crossword-game-modal');
const closeCrosswordModal = document.getElementById('close-crossword-modal');
const checkAnswerButton = document.getElementById('check-answer-button');

// --------------------------------------------------
// 2. 화면 전환 및 상태 업데이트 함수
// --------------------------------------------------

function showScreen(screenId) {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
    
    // 요청된 화면 보이기
    const screenElement = document.getElementById(screenId);
    if (screenElement) {
        screenElement.style.display = 'block';
    } else {
        console.error("Screen ID not found:", screenId);
        return;
    }

    // 미션 포기 버튼 표시 제어
    abandonMissionButton.style.display = (screenId === 'mission-area') ? 'block' : 'none';
    
    // 초기 화면의 십자말풀이 버튼 제어
    startCrosswordButtonInitial.style.display = (screenId === 'initial-problem-area') ? 'block' : 'none';

    if (screenId === 'resolution-area') {
        updateResolutionScreen();
    }
}

function updateResolutionScreen() {
    // 십자말풀이 완료 시 최종 메시지 출력
    if (gameState.isCrosswordCompleted) {
        document.querySelector('#resolution-area h2').textContent = `🎉 최종 단원 마무리 성공!`;
        resolutionMessage.innerHTML = `모든 전략을 체험하고 단원 마무리 십자말풀이까지 완료했습니다! 이제 학습에 대한 자신만의 해답을 찾았을 것입니다!`;
        resolutionEffect.textContent = `다양한 학습 전략을 이해하고 핵심 개념을 최종적으로 점검함으로써, 스스로 학습 방향을 설정하는 능력이 향상되었습니다.`;
        restartButton.textContent = '다른 전략 체험하기';
        return;
    }

    // (선택사항: 미션 완료 후 바로 resolution_area로 가지 않으므로 이 코드는 사용되지 않음, 안전을 위해 남겨둠)
    const strategy = gameState.currentStrategy;
    const strategyName = strategyMap[strategy];
    
    document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! ${strategyName} 전략 결과`;

    if (strategy === 'behaviorism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
        resolutionEffect.textContent = `칭찬과 보상을 통해 '공부 습관'이라는 긍정적 행동이 강화되었습니다. 학습 행동이 보상으로 이어진다는 것을 직접 체험했습니다.`;
    } else if (strategy === 'cognitivism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'개념 연결하기 퍼즐'</strong>을 풀어 보니 공부할 내용이 많아서 막막했던 고민이 해결됐어요. 복잡한 내용을 묶어서 정리하는 법을 알았으니, 이제 어디서부터 시작해야 할지 알 것 같아요!`;
        resolutionEffect.textContent = `정보를 체계적으로 분류하고 연결하는 능력(정보 처리, 스키마)이 향상되었습니다.`;
    } else if (strategy === 'constructivism') {
        const result = constructivismScenarios[0].choices.find(c => c.id === gameState.constructivismChoiceId);
        resolutionMessage.innerHTML = `와, 정말 감사합니다! 제가 가진 고민이 해결되는 것 같아요. 이제 어떻게 공부해야 할지 알 것 같아요!`;
        resolutionEffect.innerHTML = `당신은 <strong>${result.reward.badge}</strong>를 획득했습니다! 다른 사람에게 지식을 설명하고 가르치는 과정을 통해 자신의 지식이 더욱 명료해지는 **'학습 전이 효과'**를 얻었습니다.`;
    }
}

function startMission(strategy) {
    gameState.currentStrategy = strategy;
    showScreen('mission-area');
    
    // 모든 미션 화면 숨기기
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    // 🚀 분리된 파일의 미션 시작 함수 호출
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'flex';
        loadBehaviorismMission(); 
    } else if (strategy === 'cognitivism') {
        cognitivismMission.style.display = 'block';
        loadCognitivismMission();
    } else if (strategy === 'constructivism') {
        constructivismMission.style.display = 'block';
        loadConstructivismMission();
    }
}

// --------------------------------------------------
// 3. 초기화 및 이벤트 리스너 연결
// --------------------------------------------------

function initializeGame() {
    // 🚀 전문가 말풍선 고정 메시지 설정 (요구사항 반영)
    expertBubbles.behaviorism.textContent = "학습은 자극과 반응 행동을 연결하는 과정입니다. 집중력이 문제라면, 보상으로 학습 습관을 만들어 보세요! 목표를 달성할 때마다 포인트를 드릴게요!";
    expertBubbles.cognitivism.textContent = "학습은 이미 아는 정보를 새로운 정보와 연결하는 과정입니다. 방대한 양이 고민이라면, 효율적인 정리가 필요합니다! 정보를 머릿속에 체계적으로 저장하는 법을 알려드릴게요!";
    expertBubbles.constructivism.textContent = "학습은 학생 스스로 중요하다고 생각하는 내용을 자기 방식대로 이해하는 과정입니다. 혼자서 힘들다면, 협력의 힘을 빌려보세요! 친구와 함께 배우는 방법을 알려드릴게요.";

    // 초기 화면
    showScreen('initial-problem-area');

    // ----------------------
    // 3.1. 공통 이벤트
    // ----------------------
    consultButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    experts.forEach(expert => {
        expert.addEventListener('click', () => {
            const strategy = expert.getAttribute('data-strategy');
            startMission(strategy);
        });
    });
    // 재시작 버튼은 전문가 선택 화면으로 복귀
    restartButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    
    // 미션 포기 버튼 (확인 메시지 포함)
    abandonMissionButton.addEventListener('click', () => {
        if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
            // 게임 상태 초기화
            gameState.tokens = 0;
            gameState.correctCognitivismDrops = 0;
            gameState.isBuffed = false;
            
            showScreen('expert-selection-area');
        }
    });

    // ----------------------
    // 3.2. 행동주의 교환소 이벤트 (game.js에 통합)
    // ----------------------
    const exchangeButtons = document.querySelectorAll('.exchange-button');
    exchangeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const cost = parseInt(e.currentTarget.dataset.cost);
            const id = e.currentTarget.dataset.id;
            // behaviorism.js의 handleExchange 함수 호출
            handleExchange(cost, id); 
        });
    });

    // ----------------------
    // 3.3. 십자말풀이 이벤트 (독립 미션)
    // ----------------------
    // 초기 화면 십자말풀이 버튼
    startCrosswordButtonInitial.addEventListener('click', () => {
        crosswordModal.style.display = 'flex';
        drawCrosswordGrid(); // crossword.js의 함수 호출 (초기화 및 로드)
    });
    
    // 뒤로 가기 (진행 상황 초기화)
    closeCrosswordModal.addEventListener('click', () => {
        if (confirm("현재까지의 진행 상황은 저장되지 않습니다. 다시 풀게 됩니다. 고민 화면으로 복귀합니다.")) {
            crosswordModal.style.display = 'none';
            showScreen('initial-problem-area'); // 초기 화면으로 복귀
        }
    });

    // 정답 확인 버튼
    checkAnswerButton.addEventListener('click', checkCrosswordAnswer);
    
    // 문항 선택 버튼 리스너 (동적으로 생성되므로, 부모에 위임)
    document.getElementById('crossword-question-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('clue-button')) {
            const index = parseInt(e.target.dataset.index);
            selectCrosswordClue(index);
        }
    });
}

// 4. 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeGame);