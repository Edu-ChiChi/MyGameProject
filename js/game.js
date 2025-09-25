// js/game.js (전체 내용)

// 🚀 [새로 추가] 게임 상태 및 코인 초기값
let gameState = {
    tokens: 0, // 집중력 코인 초기값
};

// 🚀 [수정] 전략 이름을 한국어로 변환하기 위한 지도
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};

// 1. HTML 요소 가져오기 (전체 화면 관련)
const initialProblemArea = document.getElementById('initial-problem-area');
const consultButton = document.getElementById('consult-button');
const expertSelectionArea = document.getElementById('expert-selection-area');
const experts = document.querySelectorAll('.expert');
const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');

// 🚀 [새로 추가] 행동주의 미션 관련 요소 가져오기
const behaviorismMission = document.getElementById('behaviorism-mission');
const currentTokensDisplay = document.getElementById('current-tokens');
const actionButtons = document.querySelectorAll('#behaviorism-mission .action-button');


// 2. 상태 관리 함수: 원하는 화면만 보이게 하고 나머지는 숨깁니다.
function showScreen(screenId) {
    // 모든 화면 숨기기
    initialProblemArea.style.display = 'none';
    expertSelectionArea.style.display = 'none';
    missionArea.style.display = 'none';
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';
}

// 🚀 [새로 추가] 토큰(코인) 수량을 업데이트하는 함수
function updateTokens(amount) {
    gameState.tokens += amount;
    currentTokensDisplay.textContent = gameState.tokens;
    
    // 시각적 피드백
    if (amount > 0) {
        alert(`✅ 목표 달성! 집중력 코인 ${amount}개를 획득했습니다! (누적: ${gameState.tokens})`);
    } else if (amount < 0) {
        alert(`❌ 경고: 코인 ${Math.abs(amount)}개가 차감됩니다. 집중력을 유지하세요. (누적: ${gameState.tokens})`);
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


// 4. 미션 시작 함수 (화면 전환 및 미션 로드)
function startMission(strategy) {
    showScreen('mission-area');
    
    const koreanName = strategyMap[strategy] || strategy; 
    missionArea.querySelector('h2').textContent = `선택한 전략: [${koreanName}] 미션 진행 중...`;
    
    // 🌟 모든 미션 화면 숨기기 (초기화)
    document.querySelectorAll('.mission-screen').forEach(el => el.style.display = 'none');
    
    // 행동주의 미션만 표시
    if (strategy === 'behaviorism') {
        behaviorismMission.style.display = 'block';
    }
    
    // (다른 미션 로직은 이 if/else if 블록에 추가될 예정입니다)
}


// 5. 🚀 [새로 추가] 행동주의 미션 버튼 클릭 이벤트 연결
actionButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const card = event.target.closest('.choice-card'); // 상위 카드 요소 찾기
        
        if (card.classList.contains('correct-choice')) {
            const reward = parseInt(card.getAttribute('data-reward'));
            updateTokens(reward); // 강화 (토큰 획득)
        } else if (card.classList.contains('wrong-choice')) {
            const penalty = parseInt(card.getAttribute('data-penalty'));
            updateTokens(penalty); // 처벌 (토큰 차감)
        }
    });
});


// 6. 초기 화면 설정: 페이지 로드 시 초기 고민 화면 표시
window.onload = () => {
    showScreen('initial-problem-area');
};