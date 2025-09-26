// crossword.js
// (NOTE: data.js가 먼저 로드되어 전역 변수 gameState, GRID_SIZE, crosswordData를 사용할 수 있다고 가정합니다.)

// --------------------------------------------------
// 1. DOM 요소 및 전역 상태
// --------------------------------------------------

const crosswordContainer = document.getElementById('crossword-grid'); 
const crosswordCluesList = document.getElementById('crossword-question-list');
const crosswordMessage = document.getElementById('crossword-message');
const currentClueTitle = document.getElementById('current-clue-title');
const currentClueText = document.getElementById('current-clue-text');
const feedbackHint = document.getElementById('feedback-hint');
const inputContainer = document.getElementById('input-container');
const crosswordAnswerInput = document.getElementById('crossword-answer-input');
const checkAnswerButton = document.getElementById('check-answer-button');

let currentCrosswordItem = null;
let answeredClues = new Set(); 


// --------------------------------------------------
// 2. 퍼즐판 생성 및 초기화
// --------------------------------------------------

window.initializeCrossword = function() {
    // data.js의 GRID_SIZE 사용
    const size = GRID_SIZE; 
    
    // 1. 상태 초기화
    gameState.crosswordGridState = Array(size).fill(0).map(() => Array(size).fill(null));
    answeredClues.clear();
    crosswordContainer.innerHTML = ''; 
    
    const allClues = { across: [], down: [] };
    
    crosswordData.forEach((item, index) => { // data.js의 crosswordData 사용
        const { word, type, start_row: r, start_col: c } = item;
        
        allClues[type].push(item);
        
        // 그리드 상태에 단어 배치 및 교차점 처리 (data.js에서 0-based index를 사용)
        let row = r; 
        let col = c; 
        
        for (let i = 0; i < word.length; i++) {
            if (row >= size || col >= size) continue;

            const cellData = gameState.crosswordGridState[row][col];
            
            if (!cellData) {
                gameState.crosswordGridState[row][col] = { 
                    letter: word[i].toUpperCase(), 
                    number: i === 0 ? item.number : null, 
                    clues: [] 
                };
            } else {
                // 교차점 처리
                if (i === 0) {
                    gameState.crosswordGridState[row][col].number = item.number;
                }
            }
            // 이 셀에 해당하는 힌트 정보를 추가
            gameState.crosswordGridState[row][col].clues.push({ index: index, type: type });

            if (type === 'across') col++;
            else row++;
        }
    });

    // 2. 힌트 버튼 HTML 구성
    let clueButtonsHTML = '<h4>가로</h4><div class="clue-row">';
    allClues.across.forEach((item) => {
        clueButtonsHTML += `<button class="clue-button" data-index="${crosswordData.indexOf(item)}" data-type="across" data-number="${item.number}">가로 ${item.number}</button>`;
    });
    clueButtonsHTML += '</div><h4>세로</h4><div class="clue-row">';
    allClues.down.forEach((item) => {
        clueButtonsHTML += `<button class="clue-button" data-index="${crosswordData.indexOf(item)}" data-type="down" data-number="${item.number}">세로 ${item.number}</button>`;
    });
    clueButtonsHTML += '</div>';

    crosswordCluesList.innerHTML = clueButtonsHTML;
    
    // 3. 실제 HTML 테이블 생성
    for (let r = 0; r < size; r++) {
        const row = crosswordContainer.insertRow();
        for (let c = 0; c < size; c++) {
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
                input.disabled = true; 
                cell.appendChild(input);
            } else {
                cell.classList.add('empty-cell');
            }
        }
    }
    
    resetCrosswordUI();
    crosswordMessage.textContent = `단원의 핵심 개념 9가지를 모두 채워 넣으세요. (총 ${crosswordData.length}문항) 뒤로 가기 시 진행 상황은 저장되지 않습니다.`;

    // 4. 이벤트 리스너 재등록 (동적으로 생성된 버튼)
    document.querySelectorAll('.clue-button').forEach(btn => {
        btn.addEventListener('click', (e) => selectCrosswordClue(parseInt(e.target.dataset.index)));
    });
}

// --------------------------------------------------
// 3. UI 상호작용 및 로직
// --------------------------------------------------

function resetCrosswordUI() {
    currentCrosswordItem = null;
    currentClueTitle.textContent = "선택된 문항이 없습니다.";
    currentClueText.textContent = "";
    feedbackHint.style.display = 'none';
    inputContainer.style.display = 'none';
    crosswordAnswerInput.value = '';

    document.querySelectorAll('.clue-button').forEach(btn => btn.classList.remove('selected', 'answered'));
    document.querySelectorAll('.puzzle-cell input').forEach(input => {
        input.value = '';
        input.classList.remove('correct-fill', 'active-word');
        input.disabled = true;
    });
}

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
    
    const clueKey = item.number + item.type;
    if (answeredClues.has(clueKey)) {
        crosswordAnswerInput.placeholder = "✅ 이미 정답을 맞혔습니다.";
        crosswordAnswerInput.disabled = true;
        checkAnswerButton.disabled = true;
    } else {
        crosswordAnswerInput.placeholder = "정답을 입력하세요.";
        crosswordAnswerInput.disabled = false;
        checkAnswerButton.disabled = false;
    }

    highlightWordCells(item); 
    crosswordAnswerInput.focus();
}

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


if (checkAnswerButton) {
    checkAnswerButton.addEventListener('click', checkCrosswordAnswer);
}

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
        checkAnswerButton.disabled = true;
        document.querySelector(`.clue-button[data-index="${crosswordData.indexOf(currentCrosswordItem)}"]`).classList.add('answered');

        // 격자에 정답 채우기
        let r = currentCrosswordItem.start_row; 
        let c = currentCrosswordItem.start_col; 
        for (let i = 0; i < correctAnswer.length; i++) {
            const cell = document.querySelector(`.puzzle-cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                const input = cell.querySelector('input');
                setTimeout(() => {
                    input.value = correctAnswer[i];
                    input.classList.add('correct-fill');
                    input.classList.remove('active-word'); 
                }, 50); 
            }
            if (currentCrosswordItem.type === 'across') c++;
            else r++;
        }

        alert("✅ 정답입니다! 다음 문항을 풀어보세요.");
        
        // 미션 완료 체크
        if (answeredClues.size === crosswordData.length) {
            handleCrosswordCompletion();
        } else {
             crosswordAnswerInput.value = ''; 
        }

    } else {
        // 오답! (강한 비계 제공)
        feedbackHint.textContent = `❌ 오답입니다. 힌트: ${currentCrosswordItem.feedback}`;
        feedbackHint.style.display = 'block';
        crosswordAnswerInput.value = ''; 
        crosswordAnswerInput.focus();
    }
}

function handleCrosswordCompletion() {
    // 십자말풀이 완료 후 모달 닫기 및 해결 화면 전환
    document.getElementById('crossword-game-modal').style.display = 'none';
    window.showScreen('resolution-area', 'crossword'); 
}

// 모달 닫기 이벤트 (시나리오에 따른 초기화 로직)
document.addEventListener('DOMContentLoaded', () => {
    const closeCrosswordModal = document.getElementById('close-crossword-modal');
    if (closeCrosswordModal) {
        closeCrosswordModal.addEventListener('click', () => {
            if (confirm("현재까지의 진행 상황은 저장되지 않습니다. 다시 풀게 됩니다. 고민 화면으로 복귀합니다.")) {
                document.getElementById('crossword-game-modal').style.display = 'none';
                window.showScreen('initial-problem-area'); 
                window.initializeCrossword(); 
            }
        });
    }
});