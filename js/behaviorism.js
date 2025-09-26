// js/behaviorism.js

// --------------------------------------------------
// 💡 행동주의 미션 로직
// --------------------------------------------------

const currentTokensDisplay = document.getElementById('current-tokens');
const taskCardContainer = document.getElementById('task-card-container');

// 미션 시작 시 호출 (game.js에서 호출됨)
function loadBehaviorismMission() {
    // 1. 작업 카드 새로고침
    currentTasks = [];
    const reinforcementTasks = [...behaviorismTasks.filter(t => t.type === 'reinforcement')].sort(() => 0.5 - Math.random()).slice(0, 3);
    const punishmentTasks = [...behaviorismTasks.filter(t => t.type === 'punishment')].sort(() => 0.5 - Math.random()).slice(0, 2);
    currentTasks = [...reinforcementTasks, ...punishmentTasks].sort(() => 0.5 - Math.random()).slice(0, 2); // 총 2개 카드만 사용

    taskCardContainer.innerHTML = currentTasks.map((task, index) => `
        <div class="task-card">
            <p>${task.type === 'reinforcement' ? '✅ 좋은 습관:' : '❌ 나쁜 습관:'} ${task.title}</p>
            <input type="text" id="task-input-${index}" placeholder="실천 내용을 간단히 입력하세요.">
            <button id="task-button-${index}" data-task-index="${index}" class="action-button">
                ${task.type === 'reinforcement' ? '목표 달성 확인 (+1 코인)' : '나쁜 습관 선택 (-1 코인)'}
            </button>
        </div>
    `).join('');

    // 이벤트 리스너 재할당
    currentTasks.forEach((_, index) => {
        document.getElementById(`task-button-${index}`).addEventListener('click', (e) => {
            const input = document.getElementById(`task-input-${index}`);
            handleTaskClick(index, e.currentTarget, input);
        });
    });

    // 2. 상태 표시
    currentTokensDisplay.textContent = gameState.tokens;
}

// 작업 버튼 클릭 처리
function handleTaskClick(taskIndex, button, inputElement) {
    const task = currentTasks[taskIndex];
    
    if (inputElement.value.trim().length === 0) {
        alert("실천 내용을 입력해 주세요.");
        return;
    }

    let value = task.value;
    let message = '';

    // 강화 작업은 토큰 획득 (+1), 처벌 작업은 토큰 차감 (-1)
    if (task.type === 'reinforcement') {
        value = gameState.isBuffed ? task.value * 2 : task.value;
        message = `👍 ${task.title} 실천! 집중력 코인 ${value}개를 획득했습니다!`;
    } else {
        value = task.value; // -1
        message = `🚨 ${task.title} 선택! 집중력 코인 1개가 차감됩니다.`;
    }

    // 토큰 업데이트
    gameState.tokens += value;
    currentTokensDisplay.textContent = gameState.tokens;

    // 버프 상태 해제
    if (gameState.isBuffed) {
        gameState.isBuffed = false;
    }
    
    alert(message);
    
    // 미션 완료 체크
    updateTokens(); 
    
    // UI 초기화
    inputElement.value = '';
    loadBehaviorismMission(); // 카드 내용 재할당
}

// 미션 완료 및 코인 교환 처리
function updateTokens() {
    if (gameState.tokens >= 5) {
        alert(`🎉 행동주의 미션 완료! 5 코인을 모았습니다! '습관의 저금통'을 통해 학습 습관을 만드는 방법을 깨달았습니다!`); 
        gameState.tokens = 0; 
        currentTokensDisplay.textContent = gameState.tokens;
        
        // 미션 완료 후 전문가 선택 화면으로 복귀
        showScreen('expert-selection-area'); 
    }
}

// 코인 교환소 처리
function handleExchange(cost, itemId) {
    if (gameState.tokens < cost) {
        alert("코인이 부족합니다.");
        return;
    }

    gameState.tokens -= cost;
    document.getElementById('modal-current-tokens').textContent = gameState.tokens;
    currentTokensDisplay.textContent = gameState.tokens;

    if (itemId === 'potion') {
        gameState.isBuffed = true;
        alert("개념 요약 포션을 사용했습니다! 다음 목표 달성 시 코인을 2배 획득합니다!");
    } else if (itemId === 'focus') {
        // 집중력 강화 물약 (3코인) -> 미션 완료 코인(5코인)으로 즉시 전환
        gameState.tokens += 5; 
        alert("집중력 강화 물약을 사용했습니다! 즉시 미션 완료 코인(5코인)을 획득했습니다.");
    } else if (itemId === 'preview') {
        // 다음 단원 미리보기 요약 영상 (5코인) -> 미션 완료 처리
        alert("다음 단원 미리보기 요약 영상을 획득했습니다. 단원 마무리 활동을 통해 미션을 완료합니다.");
        updateTokens(); // 5코인 획득과 동시에 완료 체크
    }
    
    document.getElementById('exchange-modal').style.display = 'none';
    
    // 미션 완료 체크
    if (gameState.tokens >= 5) {
        updateTokens();
    }
}