// js/game.js

// 1. 필요한 HTML 요소들을 가져옵니다. (id를 이용해 요소를 찾습니다)
const setupArea = document.getElementById('setup-area');
const gameArea = document.getElementById('game-area');
const startButton = document.getElementById('start-button');
const scenarioInput = document.getElementById('scenario-name');
const currentScenarioDisplay = document.getElementById('current-scenario');


// 2. [게임 시작] 버튼을 눌렀을 때 실행될 함수를 정의합니다.
function startGame() {
    // 입력된 시나리오 이름을 가져옵니다.
    const scenarioName = scenarioInput.value.trim();

    // 🌟 입력 값이 비어있는지 확인 (교육적인 목적: 필수 정보 입력 유도)
    if (scenarioName === "") {
        alert("시나리오 이름을 입력해 주세요!");
        return; // 입력 값이 없으면 함수 실행 중단
    }

    // 3. UI 상태를 변경합니다.
    setupArea.style.display = 'none'; // 설정 화면을 숨깁니다.
    gameArea.style.display = 'block'; // 게임 화면을 표시합니다.
    
    // 시나리오 이름을 게임 화면에 반영합니다.
    currentScenarioDisplay.textContent = `현재 시나리오: ${scenarioName}`;

    console.log(`게임 시작: ${scenarioName}`);
}

// 4. 시작 버튼에 '클릭' 이벤트가 발생하면 startGame 함수를 실행하도록 연결합니다.
startButton.addEventListener('click', startGame);