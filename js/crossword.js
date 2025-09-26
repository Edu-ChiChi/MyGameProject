// js/crossword.js

// --------------------------------------------------
// 💡 십자말풀이 미션 로직 (독립적, 미저장, 자유선택 구현)
// --------------------------------------------------

// DOM 요소 ID
const crosswordContainer = document.getElementById('crossword-grid');
const crosswordCluesList = document.getElementById('crossword-question-list');
const crosswordMessage = document.getElementById('crossword-message');
const currentClueTitle = document.getElementById('current-clue-title');
const currentClueText = document.getElementById('current-clue-text');
const feedbackHint = document.getElementById('feedback-hint');
const inputContainer = document.getElementById('input-container');
const crosswordAnswerInput = document.getElementById('crossword-answer-input');

let currentCrosswordItem = null;
let answeredClues = new Set(); // 정답 맞힌 문항의 key (number+type) 저장

// --------------------------------------------------
// 퍼즐판 생성 및 초기화
// --------------------------------------------------

// 퍼즐판을 HTML에 그리고 초기화 상태를 gameState에 저장
function drawCrosswordGrid() {
    // 1. 상태 초기화
    gameState.crosswordGridState = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null));
    answeredClues.clear();
    crosswordContainer.innerHTML = ''; 
    
    let clueButtonsHTML = '<h4>가로</h4>';
    const allClues = { across: [], down: [] };
    
    crosswordData.forEach((item, index) => {
        const { word, type, start_row: r, start_col: c } = item;
        
        // 힌트 버튼 목록 생성
        allClues[type].push(item);
        
        // 그리드 상태에 단어 배치 및 교차점 처리
        let row = r;
        let col = c;
        for (let i = 0; i < word.length; i++) {
            if (!gameState.crosswordGridState[row][col]) {
                 gameState.crosswordGridState[row][col] = { 
                     letter: word[i].toUpperCase(), 
                     number: i === 0 ? item.number : null, 
                     clues: [] 
                 };
            } else if (i === 0) {
                 // 교차점에 번호만 추가
                 gameState.crosswordGridState[row][col].number = item.number;
            }
            // 이 셀에 해당하는 힌트 정보를 추가
            gameState.crosswordGridState[row][col].clues.push({ index: index, type: type });

            if (type === 'across') col++;
            else row++;
        }
    });

    // 힌트 버튼 HTML 구성
    allClues.across.forEach((item) => {
        clueButtonsHTML += `<button class="clue-button" data-index="${crosswordData.indexOf(item)}" data-type="across" data-number="${item.number}">가로 ${item.number}</button>`;
    });
    clueButtonsHTML += '<h4>세로</h4>';
    allClues.down.forEach((item) => {
        clueButtonsHTML += `<button class="clue-button" data-index="${crosswordData.indexOf(item)}" data-type="down" data-number="${item.number}">세로 ${item.number}</button>`;
    });

    crosswordCluesList.innerHTML = clueButtonsHTML;


    // 2. 실제 HTML 테이블 생성
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = crosswordContainer.insertRow();
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = row.insertCell();
            const cellData = gameState.crosswordGridState[r][c];

            if (cellData) {
                cell.classList.add('puzzle-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                
                if (cellData.number) {
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('cell-number');
                    numSpan.textContent = cellData.number;
                    cell.appendChild(numSpan);
                }

                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.correct = cellData.letter.toUpperCase();
                input.disabled = true; // 개별 칸 입력 비활성화 (전체 단어 입력만 활성화)
                cell.appendChild(input);
            } else {
                cell.classList.add('empty-cell');
            }
        }
    }
    
    resetCrosswordUI();
    crosswordMessage.textContent = `단원의 핵심 개념 9가지를 모두 채워 넣으세요. (총 ${crosswordData.length}문항) 뒤로 가기 시 진행 상황은 저장되지 않습니다.`;
}

// UI 초기화 (재풀이 시 사용)
function resetCrosswordUI() {
    currentCrosswordItem = null;
    currentClueTitle.textContent = "선택된 문항이 없습니다.";
    currentClueText.textContent = "";
    feedbackHint.style.display = 'none';
    inputContainer.style.display = 'none';
    crosswordAnswerInput.value = '';

    document.querySelectorAll('.clue-button').forEach(btn => btn.classList.remove('selected', 'answered'));
    
    // 격자 칸 초기화
    document.querySelectorAll('.puzzle-cell input').forEach(input => {
        input.value = '';
        input.classList.remove('correct-fill', 'active-word');
        input.disabled = true;
    });
}

// --------------------------------------------------
// UI 상호작용 및 로직
// --------------------------------------------------

// 문항 선택 시 처리
function selectCrosswordClue(itemIndex) {
    const item = crosswordData[itemIndex];
    currentCrosswordItem = item;

    // UI 업데이트
    document.querySelectorAll('.clue-button').forEach(btn => btn.classList.remove('selected'));
    const selectedButton = document.querySelector(`.clue-button[data-index="${itemIndex}"]`);
    selectedButton.classList.add('selected');

    currentClueTitle.textContent = `${item.type === 'across' ? '가로' : '세로'} ${item.number}. (${item.word.length}글자)`;
    currentClueText.textContent = item.clue;
    
    feedbackHint.style.display = 'none';
    inputContainer.style.display = 'flex';
    crosswordAnswerInput.value = '';
    
    // 이미 답한 문항인지 확인
    const clueKey = item.number + item.type;
    if (answeredClues.has(clueKey)) {
        crosswordAnswerInput.placeholder = "✅ 이미 정답을 맞혔습니다.";
        crosswordAnswerInput.disabled = true;
        document.getElementById('check-answer-button').disabled = true;
    } else {
        crosswordAnswerInput.placeholder = "정답을 입력하세요.";
        crosswordAnswerInput.disabled = false;
        document.getElementById('check-answer-button').disabled = false;
    }

    highlightWordCells(item); // 해당 단어의 격자 하이라이트
    crosswordAnswerInput.focus();
}

// 해당 단어의 격자 칸 하이라이트
function highlightWordCells(item) {
    document.querySelectorAll('.puzzle-cell input').forEach(input => {
        input.classList.remove('active-word');
    });

    let r = item.start_row;
    let c = item.start_col;
    for (let i = 0; i < item.word.length; i++) {
        const cell = document.querySelector(`.puzzle-cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) {
            const input = cell.querySelector('input');
            input.classList.add('active-word');
        }
        if (item.type === 'across') c++;
        else r++;
    }
}


// 정답 확인 버튼 클릭 처리 (핵심 로직)
function checkCrosswordAnswer() {
    if (!currentCrosswordItem) return;

    const userAnswer = crosswordAnswerInput.value.trim().toUpperCase();
    const correctAnswer = currentCrosswordItem.word.toUpperCase();
    
    if (userAnswer.length === 0) {
        alert("정답을 입력해주세요.");
        return;
    }

    if (userAnswer === correctAnswer) {
        // 정답!
        const clueKey = currentCrosswordItem.number + currentCrosswordItem.type;
        answeredClues.add(clueKey);
        
        feedbackHint.style.display = 'none';
        crosswordAnswerInput.placeholder = "정답!";
        crosswordAnswerInput.disabled = true;
        document.getElementById('check-answer-button').disabled = true;
        document.querySelector(`.clue-button[data-index="${crosswordData.indexOf(currentCrosswordItem)}"]`).classList.add('answered');

        // 격자에 정답 채우기 (교차점 처리)
        let r = currentCrosswordItem.start_row;
        let c = currentCrosswordItem.start_col;
        for (let i = 0; i < correctAnswer.length; i++) {
            const cell = document.querySelector(`.puzzle-cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                const input = cell.querySelector('input');
                input.value = correctAnswer[i];
                input.classList.add('correct-fill');
            }
            if (currentCrosswordItem.type === 'across') c++;
            else r++;
        }

        alert("✅ 정답입니다! 다음 문항을 풀어보세요.");
        
        // 미션 완료 체크
        if (answeredClues.size === crosswordData.length) {
            handleCrosswordCompletion();
        } else {
             crosswordAnswerInput.value = ''; // 정답을 맞힌 후 입력창 초기화
        }

    } else {
        // 오답! (강한 비계 제공)
        feedbackHint.textContent = `❌ 오답입니다. 힌트: ${currentCrosswordItem.feedback}`;
        feedbackHint.style.display = 'block';
        crosswordAnswerInput.value = ''; // 다시 입력 유도
        crosswordAnswerInput.focus();
    }
}

// 십자말풀이 완료 처리
function handleCrosswordCompletion() {
    if (gameState.isCrosswordCompleted) return;
    
    gameState.isCrosswordCompleted = true;
    
    // 최종 보상 지급 (5 코인) - 사용하지 않더라도 기록을 위해 남겨둠
    const reward = 5; 
    gameState.tokens += reward;

    alert(`🎉 십자말풀이 완성! 모든 단원 핵심 개념을 복습했습니다. 이제 모든 미션을 체험할 준비가 되었습니다!`);
    
    // 🚀 [핵심 로직] 최종 해결 화면으로 이동
    document.getElementById('crossword-game-modal').style.display = 'none';
    showScreen('resolution-area', 'crossword'); // game.js의 함수 호출
}