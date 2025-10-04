// js/behaviorism.js

// --------------------------------------------------
// 💡 행동주의 미션 로직
// --------------------------------------------------
// (NOTE: data.js의 gameState와 behaviorismTasks를 사용합니다.)

const currentTokensDisplay = document.getElementById('current-tokens');
const taskCardContainer = document.getElementById('task-card-container');

// 미션 시작 시 호출 (game.js에서 호출됨)
window.loadBehaviorismMission = function() {
    // 1. 상태 표시 업데이트
    currentTokensDisplay.textContent = gameState.tokens;
    
    // 2. 작업 카드 새로고침
    currentTasks = [];
    // 무작위로 섞어 2개의 카드만 사용
    const reinforcementTasks = [...behaviorismTasks.filter(t => t.type === 'reinforcement')].sort(() => 0.5 - Math.random());
    const punishmentTasks = [...behaviorismTasks.filter(t => t.type === 'punishment')].sort(() => 0.5 - Math.random());

    // 최소 1개의 강화/처벌이 나오도록 조합
    currentTasks = [];
    if (reinforcementTasks.length > 0) currentTasks.push(reinforcementTasks.pop());
    if (punishmentTasks.length > 0) currentTasks.push(punishmentTasks.pop());

    // 만약 2개가 안 채워졌다면 나머지 채우기 (최대 2개 유지)
    while (currentTasks.length < 2 && (reinforcementTasks.length > 0 || punishmentTasks.length > 0)) {
        if (reinforcementTasks.length > 0) currentTasks.push(reinforcementTasks.pop());
        else if (punishmentTasks.length > 0) currentTasks.push(punishmentTasks.pop());
    }

    renderTaskCards();

    // 초기 로드 시 버튼 상태 설정
    checkBehaviorismMissionCompletion();
}

function renderTaskCards() {
    taskCardContainer.innerHTML = '';
    currentTasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `task-card ${task.type}`;
        card.innerHTML = `
            <p>${task.title}</p>
            <button class="action-button ${task.correct ? 'success' : 'danger'}" data-index="${index}">
                ${task.correct ? `코인 +${task.value}` : `코인 ${task.value}`}
            </button>
        `;
        taskCardContainer.appendChild(card);
    });

    // 이벤트 리스너 할당
    document.querySelectorAll('.task-card button').forEach(button => {
        button.addEventListener('click', handleTaskSelection);
    });
}

// 작업 선택 처리
function handleTaskSelection(e) {
    const taskIndex = parseInt(e.currentTarget.dataset.index);
    const task = currentTasks[taskIndex];

    // 코인 증가/감소 처리
    let earnedTokens = task.value;
    
    // 포션 버프 적용 (시뮬레이션 용도로 사용하지 않음. 실제로는 팝업 후 제거)
    // if (gameState.isBuffed && task.correct) {
    //     earnedTokens *= 2;
    //     gameState.isBuffed = false; // 버프 사용 후 제거
    // }
    
    gameState.tokens += earnedTokens;
    
    // 코인 표시 업데이트
    currentTokensDisplay.textContent = gameState.tokens;

    // 피드백 제공
    alert(`[${task.title}]를 실천했습니다! 코인 ${earnedTokens}개를 획득했습니다. (현재 코인: ${gameState.tokens})`);
    
    // 미션 완료 여부 체크
    checkBehaviorismMissionCompletion(); 
    
    // 카드 내용 재할당 (새로운 카드 생성)
    loadBehaviorismMission(); 
}

// 미션 완료 체크
function checkBehaviorismMissionCompletion() {
    const completeButton = document.getElementById('simulate-behaviorism-completion');
    if (!completeButton) return;

    const requiredTokens = 5; // 완료 조건

    if (gameState.tokens >= requiredTokens) {
        completeButton.disabled = false; // 5개 이상이면 활성화
        completeButton.textContent = "✅ 코인 5개 달성! 결과 확인하기";
    } else {
        completeButton.disabled = true; // 5개 미만이면 비활성화
        completeButton.textContent = `코인 ${requiredTokens}개 달성 시 완료 가능 (${gameState.tokens}/${requiredTokens})`;
    }
    // 시나리오상 5코인 이상 시 미션 완료로 처리하고,
    // 실제 미션 완료는 '시뮬레이션 완료' 버튼으로 처리하도록 game.js에서 결정
    
}

// '미션 시뮬레이션 완료' 버튼 이벤트 (game.js에서 정의된 함수를 사용하지 않고 별도로 처리)
document.addEventListener('DOMContentLoaded', () => {
    const completeButton = document.getElementById('simulate-behaviorism-completion');
    
    // 최종 완료 버튼 연결
    if (completeButton) {
        completeButton.addEventListener('click', () => {
            if (window.showScreen) {
                alert("코인 5개를 모두 모아 미션을 완료합니다! (시뮬레이션)");
                // 5코인 달성 가정 후 초기화
                gameState.tokens = 0; 
                window.showScreen('resolution-area', 'behaviorism');
            }
        });
    }
});