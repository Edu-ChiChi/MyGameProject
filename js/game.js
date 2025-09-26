// js/game.js (롤백 버전: 모든 로직, 데이터, 기능 통합, 십자말풀이 이전 상태로 복원)

// --------------------------------------------------
// 0. 게임 상태 및 데이터 정의 (모든 데이터 통합)
// --------------------------------------------------
const strategyMap = { behaviorism: '행동주의', cognitivism: '인지주의', constructivism: '구성주의', crossword: '십자말풀이' };
// 미션 로직이 외부 파일에 있더라도, 해상도 업데이트를 위한 최소한의 더미 상태 및 데이터 정의
const gameState = {
    currentStrategy: null,
    tokens: 0,
    constructivismChoiceId: 1, // 기본값 설정 (선택지 1: 최고 멘토 뱃지)
}; 
const constructivismScenarios = [{ choices: [{ id: 1, reward: { badge: '최고 멘토 뱃지' } }, { id: 2, reward: { badge: '유능한 멘토 뱃지' } }, { id: 3, reward: { badge: '도움의 손길 뱃지' } }] }];


const crosswordData = [
    // 가로 문제 (Across)
    {
        number: 1, direction: 'across', clue: '행동주의에서 반응을 일으키는 외부의 신호예요.',
        answer: '자극', length: 2, startRow: 1, startCol: 2,
    },
    {
        number: 2, direction: 'across', clue: '학습 목표를 향해 움직이게 만드는 심리적 원동력이에요.',
        answer: '동기', length: 2, startRow: 2, startCol: 1,
    },
    {
        number: 4, direction: 'across', clue: '‘생각에 대한 생각’을 하면서 전략을 조절하는 능력이에요.',
        answer: '초인지', length: 3, startRow: 3, startCol: 6,
    },
    {
        number: 7, direction: 'across', clue: '해결 방법이 여러 가지라서 답이 명확하지 않은 문제예요.',
        answer: '비구조화', length: 4, startRow: 7, startCol: 3,
    },
    // 세로 문제 (Down)
    {
        number: 1, direction: 'down', clue: '자신이 과제를 성공할 수 있다고 믿는 마음이에요.',
        answer: '자기효능감', length: 5, startRow: 1, startCol: 2,
    },
    {
        number: 3, direction: 'down', clue: '비고츠키가 말한, 도움을 받으면 가능한 발달 영역이에요.',
        answer: '근접발달', length: 4, startRow: 2, startCol: 4,
    },
    {
        number: 5, direction: 'down', clue: '저장된 기억을 다시 꺼내는 과정이에요.',
        answer: '인출', length: 2, startRow: 3, startCol: 8, 
    },
    {
        number: 6, direction: 'down', clue: '정보를 장기 기억으로 바꾸어 저장하는 과정이에요.',
        answer: '부호화', length: 3, startRow: 5, startCol: 6,
    },
    {
        number: 7, direction: 'down', clue: '학습자가 과제를 해결하도록 제공하는 임시적 도움이에요.',
        answer: '비계', length: 2, startRow: 7, startCol: 3,
    }
];
const gridSize = 8; // 8x8 그리드

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
const backToProblemButton = document.getElementById('back-to-problem-button'); 

const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');
const resolutionArea = document.getElementById('resolution-area');
const restartButton = document.getElementById('restart-button');
const resolutionMessage = document.getElementById('resolution-message');
const restartButtonSelection = document.getElementById('restart-button-selection');

const behaviorismMission = document.getElementById('behaviorism-mission');
const cognitivismMission = document.getElementById('cognitivism-mission');
const constructivismMission = document.getElementById('constructivism-mission');

const crosswordModal = document.getElementById('crossword-game-modal');
const closeCrosswordModal = document.getElementById('close-crossword-modal');
const checkAnswerButton = document.getElementById('check-answer-button'); 

// --------------------------------------------------
// 2. 화면 전환 및 상태 업데이트 함수
// --------------------------------------------------

function showScreen(screenId, strategy = null) {
    document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
    
    const screenElement = document.getElementById(screenId);
    if (screenElement) {
        screenElement.style.display = 'block';
    } else {
        console.error("Screen ID not found:", screenId);
        return;
    }

    abandonMissionButton.style.display = (screenId === 'mission-area') ? 'block' : 'none';
    
    if (screenId === 'expert-selection-area') {
        restartButtonSelection.style.display = 'block';
        experts.forEach(expert => expert.classList.remove('disabled'));
    } else {
        restartButtonSelection.style.display = 'none';
    }

    if (screenId === 'resolution-area') {
        updateResolutionScreen(strategy);
    }
}

function updateResolutionScreen(strategy) {
    const strategyName = strategyMap[strategy];
    document.querySelector('#resolution-area h2').textContent = `🎉 미션 성공! ${strategyName} 전략 결과`;

    if (strategy === 'behaviorism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'습관의 저금통'</strong>을 체험해 보니 공부가 막막하게 느껴졌던 이유를 알 것 같아요. 작은 목표부터 보상을 받으면서 시작하는 방법을 알았으니, 이제 집중해서 공부할 수 있을 것 같아요!`;
    } else if (strategy === 'cognitivism') {
        resolutionMessage.innerHTML = `와, 정말 감사합니다! <strong>'개념 연결하기 퍼즐'</strong>을 풀어 보니 공부할 내용이 많아서 막막했던 고민이 해결됐어요. 복잡한 내용을 묶어서 정리하는 법을 알았으니, 이제 어디서부터 시작해야 할지 알 것 같아요!`;
    } else if (strategy === 'constructivism') {
        const result = constructivismScenarios[0].choices.find(c => c.id === gameState.constructivismChoiceId) || constructivismScenarios[0].choices[0]; 
        resolutionMessage.innerHTML = `와, 정말 감사합니다! 제가 가진 고민이 해결되는 것 같아요. 이제 어떻게 공부해야 할지 알 것 같아요! (획득 뱃지: <strong>${result.reward.badge}</strong>)`;
    } else if (strategy === 'crossword') {
         document.querySelector('#resolution-area h2').textContent = `🎉 단원 마무리 완료! 학습 전략 종합`;
         resolutionMessage.innerHTML = `모든 전략을 체험하고 단원 마무리 십자말풀이까지 완료했습니다! 이제 학습에 대한 자신만의 해답을 찾았을 것입니다!`;
    }
}

function startMission(strategy) {
    gameState.currentStrategy = strategy;
    showScreen('mission-area');
    
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'flex';
    } else if (strategy === 'cognitivism') {
        cognitivismMission.style.display = 'block';
    } else if (strategy === 'constructivism') {
        constructivismMission.style.display = 'block';
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
    
    // ⭐ 전문가 창에서 고민 창으로 뒤로 가기
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
            showScreen('expert-selection-area');
        }
    });

    // ----------------------
    // 3.2. 행동주의 교환소 이벤트 (기능 미구현 차단)
    // ----------------------
    const openExchangeButton = document.getElementById('open-exchange-button');
    if (openExchangeButton) {
        openExchangeButton.addEventListener('click', () => {
            alert("아쉽게도 교환소 구매 기능은 아직 구현되지 않았습니다. 다음 업데이트를 기대해 주세요! 😢");
        });
    }
    
    const closeModalButton = document.getElementById('close-modal-button');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('exchange-modal').style.display = 'none';
        });
    }

    // ----------------------
    // 3.3. 십자말풀이 이벤트 (독립 미션) - ⭐롤백된 로직⭐
    // ----------------------
    
    // 초기 화면 십자말풀이 버튼
    startCrosswordButtonInitial.addEventListener('click', () => {
        // 이 부분이 문제의 원인이었을 수 있습니다. 이제 롤백되었습니다.
        if (crosswordModal) {
            crosswordModal.style.display = 'flex';
            // drawCrosswordGrid(); // 외부 십자말풀이 로직 호출을 가정
        }
    });
    
    // 십자말풀이 모달 닫기 (진행 상황 초기화 확인)
    if (closeCrosswordModal) {
        closeCrosswordModal.addEventListener('click', () => {
            if (confirm("현재까지의 진행 상황은 저장되지 않습니다. 다시 풀게 됩니다. 고민 화면으로 복귀합니다.")) {
                if (crosswordModal) crosswordModal.style.display = 'none';
                showScreen('initial-problem-area'); 
            }
        });
    }

    // 문항 선택 버튼 리스너 (동적으로 생성되므로, 부모에 위임)
    const crosswordQuestionList = document.getElementById('crossword-question-list');
    if (crosswordQuestionList) {
        crosswordQuestionList.addEventListener('click', (e) => {
            if (e.target.classList.contains('clue-button')) {
                // const index = parseInt(e.target.dataset.index);
                // selectCrosswordClue(index); // 외부 십자말풀이 로직 호출을 가정
            }
        });
    }
}

// 4. 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeGame);