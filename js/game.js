// js/game.js (전체 내용)

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    tokens: 0, // 집중력 코인 초기값
    correctCognitivismDrops: 0, // 인지주의 미션 정답 개수 카운터
    isBuffed: false, // 🚀 [추가] 포션 사용 여부 플래그 (토큰 강화)
};

// ... (behaviorismReinforcementTasks, behaviorismPunishmentTasks, cognitivismPieces 배열은 이전 코드와 동일) ...

// 🚀 전략 이름을 한국어로 변환하기 위한 지도
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};

// 1. HTML 요소 가져오기
// ... (기존 요소들) ...

// 행동주의 미션 관련 요소
// ... (기존 요소들) ...
const taskInput1 = document.getElementById('task-input-1');
const taskInput2 = document.getElementById('task-input-2');

// 🚀 [추가] 교환소 관련 요소
const openExchangeButton = document.getElementById('open-exchange-button');
const exchangeModal = document.getElementById('exchange-modal');
const closeModalButton = document.getElementById('close-modal-button');
const modalCurrentTokens = document.getElementById('modal-current-tokens');
const exchangeButtons = document.querySelectorAll('.exchange-button:not(.disabled)');

// 🚀 [추가] 모션 관련 요소
const piggyBank = document.getElementById('piggy-bank');
// (저금통 위치 계산을 위해 요소를 가져옴)
const piggyBankRect = piggyBank ? piggyBank.getBoundingClientRect() : null; 


// 2. 상태 관리 함수: 원하는 화면만 보이게 하고 나머지는 숨깁니다.
// ... (showScreen 함수는 기존 내용 유지) ...


// --------------------------------------------------
// 🚀 [수정/추가] 토큰(코인) 관련 핵심 로직
// --------------------------------------------------

// 🚀 코인 획득 모션 함수 (새로 추가)
function animateTokenAcquisition(targetButton, amount) {
    // 획득 코인 개수만큼 반복 (현재는 1개, 버프 시 2개)
    for (let i = 0; i < amount; i++) {
        const coin = document.createElement('div');
        coin.classList.add('new-coin');
        // coin.textContent = '1'; // 코인 안에 숫자를 표시할 경우

        // 버튼 위치 계산
        const buttonRect = targetButton.getBoundingClientRect();
        
        // 코인의 시작 위치 설정 (버튼 근처)
        const startX = buttonRect.left + (buttonRect.width / 2);
        const startY = buttonRect.top + (buttonRect.height / 2);

        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        document.body.appendChild(coin);

        // 🌟 저금통 위치로 애니메이션!
        // (저금통이 로드된 후 위치를 가져와야 함. 여기서는 임시 위치로 설정)
        // 실제 구현 시, 저금통의 중앙 좌표를 목표 지점(targetX, targetY)으로 설정해야 함.
        const targetX = piggyBankRect ? piggyBankRect.left + piggyBankRect.width / 2 : 50; 
        const targetY = piggyBankRect ? piggyBankRect.top + piggyBankRect.height / 2 : 50; 
        
        // CSS transition을 사용한 모션 (setTimeout으로 DOM 적용 후 실행)
        setTimeout(() => {
            // 저금통 위치로 이동
            coin.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.5)`;
            coin.style.opacity = 0;
        }, 50);


        // 애니메이션 종료 후 요소 제거
        coin.addEventListener('transitionend', () => {
            coin.remove();
        });
    }
}


// 🚀 [수정] 토큰(코인) 수량을 업데이트하는 함수
function updateTokens(amount, targetButton) {
    let finalAmount = amount;
    
    // 🌟 포션 버프 확인 및 적용 (강화 목표만 해당)
    if (amount > 0 && gameState.isBuffed) {
        finalAmount = amount * 2; // 1코인 -> 2코인
        gameState.isBuffed = false; // 버프는 1회용이므로 사용 후 초기화
        alert(`⭐ 포션 효과 발동! 획득 코인이 ${finalAmount}개로 2배가 됩니다!`);
    }
    
    // 1. 코인 개수 업데이트
    gameState.tokens += finalAmount;
    currentTokensDisplay.textContent = gameState.tokens;
    modalCurrentTokens.textContent = gameState.tokens; // 모달 코인 업데이트

    // 2. 획득/차감 모션 실행 (버튼 요소를 인수로 전달)
    if (finalAmount > 0) {
        animateTokenAcquisition(targetButton, finalAmount); 
    } else if (finalAmount < 0) {
        alert(`❌ 경고: 코인 ${Math.abs(finalAmount)}개가 차감됩니다. 집중력을 유지하세요. (누적: ${gameState.tokens})`);
    }

    // 3. 미션 완료 확인 (기존 로직)
    if (gameState.tokens >= 5) {
        alert(`🎉 행동주의 미션 완료! 5 코인을 모았습니다!`); 
        gameState.tokens = 0;
        currentTokensDisplay.textContent = gameState.tokens;
        missionArea.querySelector('h2').textContent = `선택한 전략: [행동주의] 미션 완료...`;
        showScreen('resolution-area'); 
    }
}

// ... (loadNewBehaviorismTask 함수는 기존 내용 유지) ...


// --------------------------------------------------
// 🚀 [수정] 5. 행동주의 미션 버튼 클릭 이벤트 연결 (입력창 검증 포함)
// --------------------------------------------------

function handleTaskClick(taskIndex, button, input) {
    if (!currentTasks[taskIndex]) return; 

    // 🚀 [추가] 입력창 검증
    if (input.value.trim() === '') {
        alert("⚠️ 목표를 실천한 내용을 입력해야 코인을 획득/차감할 수 있습니다.");
        return;
    }

    // 1. 토큰 업데이트 (버튼 요소를 함께 전달)
    updateTokens(currentTasks[taskIndex].value, button);

    // 2. 입력창 비우기 및 새로운 미션 로드
    if (document.getElementById('mission-area').style.display === 'block') {
        input.value = ''; // 입력창 초기화
        loadNewBehaviorismTask();
    }
}

taskButton1.addEventListener('click', (e) => {
    handleTaskClick(0, e.currentTarget, taskInput1); // 강화 미션
}); 
taskButton2.addEventListener('click', (e) => {
    handleTaskClick(1, e.currentTarget, taskInput2); // 처벌 미션
});

// --------------------------------------------------
// 🚀 [추가] 7. 교환소 로직
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

// 교환 처리 함수
function handleExchange(cost) {
    if (gameState.isBuffed) {
        alert("⚠️ 이미 '개념 요약 포션' 효과가 적용 중입니다. 다음 턴에 사용해 주세요!");
        return;
    }

    if (gameState.tokens >= cost) {
        gameState.tokens -= cost; // 코인 차감
        currentTokensDisplay.textContent = gameState.tokens;
        modalCurrentTokens.textContent = gameState.tokens;

        gameState.isBuffed = true; // 버프 활성화

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
    showScreen('initial-problem-area');
};