// game.js (메인 컨트롤러: 공통 함수 및 화면 전환)
// (NOTE: data.js가 먼저 로드되어 전역 변수 gameState, strategyMap, constructivismScenarios를 사용할 수 있다고 가정합니다.)

// --------------------------------------------------
// 1. HTML 요소 가져오기 (공통)
// --------------------------------------------------
const consultButton = document.getElementById('consult-button');
const startCrosswordButtonInitial = document.getElementById('start-crossword-button-initial'); 
const experts = document.querySelectorAll('.expert');
const expertBubbles = {
    behaviorism: document.querySelector('.behaviorism-bubble'),
    cognitivism: document.querySelector('.cognitivism-bubble'),
    constructivism: document.querySelector('.constructivism-bubble')
};
const backToProblemButton = document.getElementById('back-to-problem-button'); 
const abandonMissionButton = document.getElementById('abandon-mission-button');
const resolutionMessage = document.getElementById('resolution-message');
const restartButton = document.getElementById('restart-button');
const restartButtonSelection = document.getElementById('restart-button-selection');
const crosswordModal = document.getElementById('crossword-game-modal');


// --------------------------------------------------
// 2. 화면 전환 및 상태 업데이트 함수
// --------------------------------------------------

window.showScreen = function(screenId, strategy = null) {
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
    
    const screenElement = document.getElementById(screenId);
    if (screenElement) {
        screenElement.style.display = 'block';
    } else {
        console.error("Screen ID not found:", screenId);
        return;
    }

    // 미션 포기 버튼 표시/숨김
    abandonMissionButton.style.display = (screenId === 'mission-area') ? 'block' : 'none';
    
    // 다른 전략 체험하기 버튼 표시/숨김 (해결 화면 및 전문가 선택 화면)
    if (screenId === 'expert-selection-area') {
        restartButtonSelection.style.display = 'block';
    } else {
        restartButtonSelection.style.display = 'none';
    }

    if (screenId === 'resolution-area') {
        updateResolutionScreen(strategy);
    }
}

function updateResolutionScreen(strategy) {
    // data.js의 strategyMap 사용
    const strategyName = strategyMap[strategy]; 
    document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! ${strategyName} 전략 결과`;

    // 최종 확정된 해결 메시지
    if (strategy === 'behaviorism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
    } else if (strategy === 'cognitivism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'개념 연결하기 퍼즐'</strong>을 풀어 보니 공부할 내용이 많아서 막막했던 고민이 해결됐어요. 복잡한 내용을 묶어서 정리하는 법을 알았으니, 이제 어디서부터 시작해야 할지 알 것 같아요!`;
    } else if (strategy === 'constructivism') {
        // data.js의 constructivismScenarios와 gameState 사용
        const result = constructivismScenarios[0].choices.find(c => c.id === gameState.constructivismChoiceId) || constructivismScenarios[0].choices[0]; 
        resolutionMessage.innerHTML = `와, 정말 감사합니다! 제가 가진 고민이 해결되는 것 같아요. 이제 어떻게 공부해야 할지 알 것 같아요! (획득 뱃지: <strong>${result.reward.badge}</strong>)`;
    } else if (strategy === 'crossword') {
         document.querySelector('#resolution-area h2').textContent = `🎉 단원 마무리 완료! 학습 전략 종합`;
         resolutionMessage.innerHTML = `모든 전략을 체험하고 단원 마무리 십자말풀이까지 완료했습니다! 이제 학습에 대한 자신만의 해답을 찾았을 것입니다!`;
    }
}

window.startMission = function(strategy) {
    gameState.currentStrategy = strategy;
    showScreen('mission-area');
    
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    const missionElement = document.getElementById(strategy + '-mission');
    if (missionElement) {
        missionElement.style.display = (strategy === 'behaviorism') ? 'flex' : 'block';

        // 각 미션 로직의 초기화 함수 호출
        if (strategy === 'behaviorism' && window.loadBehaviorismMission) {
            window.loadBehaviorismMission();
        } else if (strategy === 'cognitivism' && window.loadCognitivismMission) {
            window.loadCognitivismMission();
        } else if (strategy === 'constructivism' && window.loadConstructivismMission) {
            window.loadConstructivismMission();
        }
    }
}

// --------------------------------------------------
// 3. 초기화 및 이벤트 리스너 연결
// --------------------------------------------------

function initializeGame() {
    // 🚀 전문가 말풍선 고정 메시지 설정 (최종 시나리오 반영)
    expertBubbles.behaviorism.textContent = "학습은 자극과 반응 행동을 연결하는 과정입니다. 집중력이 문제라면, 보상으로 학습 습관을 만들어 보세요! 목표를 달성할 때마다 포인트를 드릴게요!";
    expertBubbles.cognitivism.textContent = "학습은 이미 아는 정보를 새로운 정보와 연결하는 과정입니다. 방대한 양이 고민이라면, 효율적인 정리가 필요합니다! 정보를 머릿속에 체계적으로 저장하는 법을 알려드릴게요!";
    expertBubbles.constructivism.textContent = "학습은 학생 스스로 중요하다고 생각하는 내용을 자기 방식대로 이해하는 과정입니다. 혼자서 힘들다면, 협력의 힘을 빌려보세요! 친구와 함께 배우는 방법을 알려드릴게요.";

    showScreen('initial-problem-area');

    // 공통 이벤트
    consultButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    backToProblemButton.addEventListener('click', () => { showScreen('initial-problem-area'); });
    experts.forEach(expert => {
        expert.addEventListener('click', () => {
            const strategy = expert.getAttribute('data-strategy');
            startMission(strategy);
        });
    });
    restartButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    restartButtonSelection.addEventListener('click', () => { showScreen('expert-selection-area'); });
    
    // 미션 포기 (다른 전략 체험하기) 버튼
    abandonMissionButton.addEventListener('click', () => {
        if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
            showScreen('expert-selection-area');
        }
    });

    // 십자말풀이 모달 열기
    if (startCrosswordButtonInitial && crosswordModal) {
        startCrosswordButtonInitial.addEventListener('click', () => {
            crosswordModal.style.display = 'flex';
            // crossword.js에 정의된 초기화 함수 호출
            if (window.initializeCrossword) window.initializeCrossword();
        });
    }

    // 행동주의 교환소 이벤트 (시나리오에 따라 기능 미구현 팝업)
    const openExchangeButton = document.getElementById('open-exchange-button');
    if (openExchangeButton) {
        openExchangeButton.addEventListener('click', () => {
            alert("아쉽게도 교환소 구매 기능은 아직 구현되지 않았습니다. 다음 업데이트를 기대해 주세요! 😢");
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeGame);