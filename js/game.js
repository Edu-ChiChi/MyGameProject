// js/game.js (최종 버전: 뒤로가기 버튼 기능 및 모든 확정 사항 반영)

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
// **** 새로 추가된 요소 ****
const backToProblemButton = document.getElementById('back-to-problem-button');
// **************************

const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button');
const resolutionMessage = document.getElementById('resolution-message');
const restartButtonSelection = document.getElementById('restart-button-selection');

// 미션별 컨테이너
const behaviorismMission = document.getElementById('behaviorism-mission');
const cognitivismMission = document.getElementById('cognitivism-mission');
const constructivismMission = document.getElementById('constructivism-mission');

// 십자말풀이 요소
const crosswordModal = document.getElementById('crossword-game-modal');
const closeCrosswordModal = document.getElementById('close-crossword-modal');
const checkAnswerButton = document.getElementById('check-answer-button');

// --------------------------------------------------
// 2. 화면 전환 및 상태 업데이트 함수 (필요한 외부 변수/함수는 주석 처리)
// --------------------------------------------------

function showScreen(screenId, strategy = null) {
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

    // 미션 포기 버튼 표시 제어 (미션 중일 때만)
    abandonMissionButton.style.display = (screenId === 'mission-area') ? 'block' : 'none';
    
    // 전문가 선택 화면 복귀 시 버튼 활성화
    if (screenId === 'expert-selection-area') {
        restartButtonSelection.style.display = 'block'; // '다른 전략 체험하기' 버튼 활성화
        // 모든 전문가 버튼 활성화 (미션 성공 여부와 상관없이 계속 체험 가능)
        experts.forEach(expert => expert.classList.remove('disabled'));
    } else {
        restartButtonSelection.style.display = 'none';
    }


    if (screenId === 'resolution-area') {
        updateResolutionScreen(strategy);
    }
}

function updateResolutionScreen(strategy) {
    // (strategyMap 및 constructivismScenarios는 외부 data.js 파일에 있다고 가정)
    const strategyMap = { behaviorism: '행동주의', cognitivism: '인지주의', constructivism: '구성주의', crossword: '십자말풀이' };
    const constructivismScenarios = [{ choices: [{ id: 1, reward: { badge: '최고 멘토 뱃지' } }, { id: 2, reward: { badge: '유능한 멘토 뱃지' } }, { id: 3, reward: { badge: '도움의 손길 뱃지' } }] }];
    const gameState = { constructivismChoiceId: 1 }; // 예시값, 실제 값은 미션 완료 시 설정됨
    
    // '이론적 학습 전이 효과' 제목 제거 및 최종 메시지 구성
    const strategyName = strategyMap[strategy];
    document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! ${strategyName} 전략 결과`;

    if (strategy === 'behaviorism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
    } else if (strategy === 'cognitivism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'개념 연결하기 퍼즐'</strong>을 풀어 보니 공부할 내용이 많아서 막막했던 고민이 해결됐어요. 복잡한 내용을 묶어서 정리하는 법을 알았으니, 이제 어디서부터 시작해야 할지 알 것 같아요!`;
    } else if (strategy === 'constructivism') {
        // 실제 미션에서 저장된 choiceId를 사용해야 함
        const result = constructivismScenarios[0].choices.find(c => c.id === gameState.constructivismChoiceId) || constructivismScenarios[0].choices[0]; 
        resolutionMessage.innerHTML = `와, 정말 감사합니다! 제가 가진 고민이 해결되는 것 같아요. 이제 어떻게 공부해야 할지 알 것 같아요! (획득 뱃지: <strong>${result.reward.badge}</strong>)`;
    } else if (strategy === 'crossword') {
         document.querySelector('#resolution-area h2').textContent = `🎉 단원 마무리 완료! 학습 전략 종합`;
         resolutionMessage.innerHTML = `모든 전략을 체험하고 단원 마무리 십자말풀이까지 완료했습니다! 이제 학습에 대한 자신만의 해답을 찾았을 것입니다!`;
    }
}

function startMission(strategy) {
    const gameState = { currentStrategy: strategy }; // 예시용
    showScreen('mission-area');
    
    // 모든 미션 화면 숨기기
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    // 🚀 분리된 파일의 미션 시작 함수 호출 (실제 로직은 외부 js 파일에 있다고 가정)
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'flex';
        // loadBehaviorismMission(); 
    } else if (strategy === 'cognitivism') {
        cognitivismMission.style.display = 'block';
        // loadCognitivismMission();
    } else if (strategy === 'constructivism') {
        constructivismMission.style.display = 'block';
        // loadConstructivismMission();
    }
}

// --------------------------------------------------
// 3. 초기화 및 이벤트 리스너 연결
// --------------------------------------------------

function initializeGame() {
    // 🚀 전문가 말풍선 고정 메시지 설정 (최종 요구사항 반영)
    expertBubbles.behaviorism.textContent = "학습은 자극과 반응 행동을 연결하는 과정입니다. 집중력이 문제라면, 보상으로 학습 습관을 만들어 보세요! 목표를 달성할 때마다 포인트를 드릴게요!";
    expertBubbles.cognitivism.textContent = "학습은 이미 아는 정보를 새로운 정보와 연결하는 과정입니다. 방대한 양이 고민이라면, 효율적인 정리가 필요합니다! 정보를 머릿속에 체계적으로 저장하는 법을 알려드릴게요!";
    expertBubbles.constructivism.textContent = "학습은 학생 스스로 중요하다고 생각하는 내용을 자기 방식대로 이해하는 과정입니다. 혼자서 힘들다면, 협력의 힘을 빌려보세요! 친구와 함께 배우는 방법을 알려드릴게요.";

    // 초기 화면
    showScreen('initial-problem-area');

    // ----------------------
    // 3.1. 공통 이벤트
    // ----------------------
    consultButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    
    // **** 새로 추가된 이벤트: 전문가 창에서 고민 창으로 뒤로 가기 ****
    if (backToProblemButton) {
        backToProblemButton.addEventListener('click', () => {
            showScreen('initial-problem-area');
        });
    }
    
    // 전문가 선택 (미션 시작)
    experts.forEach(expert => {
        expert.addEventListener('click', () => {
            const strategy = expert.getAttribute('data-strategy');
            startMission(strategy);
        });
    });
    
    // 미션 완료 후 '다른 전략 체험하기' (해결창)
    restartButton.addEventListener('click', () => { showScreen('expert-selection-area'); });
    
    // 전문가 선택 화면의 '다른 전략 체험하기' (선택창)
    restartButtonSelection.addEventListener('click', () => { showScreen('expert-selection-area'); });
    
    // 미션 포기 버튼 (확인 메시지 포함)
    abandonMissionButton.addEventListener('click', () => {
        if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
            // 게임 상태 초기화 (토큰 등)
            // (gameState 변수가 전역에 선언되어 있다고 가정하고 초기화 로직 유지)
            // gameState.tokens = 0;
            // gameState.correctCognitivismDrops = 0;
            // gameState.isBuffed = false;
            
            showScreen('expert-selection-area');
        }
    });

    // ----------------------
    // 3.2. 행동주의 교환소 이벤트 (기능 미구현 차단)
    // ----------------------
    // NOTE: 'open-exchange-button'의 존재를 가정합니다.
    const openExchangeButton = document.getElementById('open-exchange-button');
    if (openExchangeButton) {
        openExchangeButton.addEventListener('click', () => {
            // 교환소 버튼 클릭 시 기능 미구현 안내 알림 출력
            alert("아쉽게도 교환소 구매 기능은 아직 구현되지 않았습니다. 다음 업데이트를 기대해 주세요! 😢");
        });
    }
    
    // NOTE: 모달 관련 요소의 존재를 가정합니다.
    const closeModalButton = document.getElementById('close-modal-button');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('exchange-modal').style.display = 'none';
        });
    }
    const exchangeButtons = document.querySelectorAll('.exchange-button');
    exchangeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // const cost = parseInt(e.currentTarget.dataset.cost);
            // const id = e.currentTarget.dataset.id;
            // handleExchange 함수는 주석 처리된 상태로 유지 (구현 시 활성화)
        });
    });


    // ----------------------
    // 3.3. 십자말풀이 이벤트 (독립 미션)
    // ----------------------
    // 초기 화면 십자말풀이 버튼
    startCrosswordButtonInitial.addEventListener('click', () => {
        crosswordModal.style.display = 'flex';
        // drawCrosswordGrid(); // crossword.js의 함수 호출 (초기화 및 로드)
    });
    
    // 뒤로 가기 (진행 상황 초기화 확인)
    closeCrosswordModal.addEventListener('click', () => {
        if (confirm("현재까지의 진행 상황은 저장되지 않습니다. 다시 풀게 됩니다. 고민 화면으로 복귀합니다.")) {
            crosswordModal.style.display = 'none';
            // 초기화 후 고민 화면으로 복귀
            showScreen('initial-problem-area'); 
        }
    });

    // 정답 확인 버튼
    // if (checkAnswerButton) checkAnswerButton.addEventListener('click', checkCrosswordAnswer);
    
    // 문항 선택 버튼 리스너 (동적으로 생성되므로, 부모에 위임)
    document.getElementById('crossword-question-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('clue-button')) {
            const index = parseInt(e.target.dataset.index);
            // selectCrosswordClue(index);
        }
    });
}

// 4. 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeGame);