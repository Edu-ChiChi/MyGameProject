// js/game.js (전체 내용 교체)

// 1. HTML 요소 가져오기
const initialProblemArea = document.getElementById('initial-problem-area');
const consultButton = document.getElementById('consult-button');
const expertSelectionArea = document.getElementById('expert-selection-area');
const experts = document.querySelectorAll('.expert'); // 모든 전문가 아이콘
const missionArea = document.getElementById('mission-area');
const abandonMissionButton = document.getElementById('abandon-mission-button');

// 2. 상태 관리 함수: 원하는 화면만 보이게 하고 나머지는 숨깁니다.
function showScreen(screenId) {
    // 모든 화면 숨기기
    initialProblemArea.style.display = 'none';
    expertSelectionArea.style.display = 'none';
    missionArea.style.display = 'none';
    
    // 요청된 화면 보이기
    document.getElementById(screenId).style.display = 'block';
}

// 3. 이벤트 핸들러 정의
// 3-1. [고민 상담해주기] 버튼 클릭 시 -> 전문가 선택 화면으로 이동
consultButton.addEventListener('click', () => {
    showScreen('expert-selection-area');
});

// 3-2. 전문가 아이콘 클릭 시 -> 미션 진행 화면으로 이동
experts.forEach(expert => {
    expert.addEventListener('click', () => {
        const strategy = expert.getAttribute('data-strategy'); // 행동주의, 인지주의, 구성주의 중 선택된 값
        startMission(strategy);
    });
});

// 3-3. 미션 포기 버튼 클릭 시 (미션 중 '다른 전략 체험하기')
abandonMissionButton.addEventListener('click', () => {
    // 미션 진행 중 확인 메시지 띄우기
    if (confirm("현재 진행 중인 미션을 포기하시겠어요? 진행 상황은 저장되지 않습니다.")) {
        showScreen('expert-selection-area'); // 전문가 선택 화면으로 돌아가기
    }
});


// 4. 미션 시작 함수 (선택된 전략에 따라 화면 전환)
function startMission(strategy) {
    showScreen('mission-area');
    // 선택된 전략 이름으로 미션 제목을 설정합니다.
    missionArea.querySelector('h2').textContent = `선택한 전략: [${strategy}] 미션 진행 중...`;
    
    // 이 단계에서는 미션 진행 화면으로만 전환됩니다.
}

// 5. 초기 화면 설정: 페이지 로드 시 초기 고민 화면 표시
window.onload = () => {
    showScreen('initial-problem-area');
};