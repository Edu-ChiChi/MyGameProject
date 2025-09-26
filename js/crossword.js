// crossword.js

// --------------------------------------------------
// 0. 데이터 정의 (최종 확정된 9개 문항)
// --------------------------------------------------
const GRID_SIZE = 8;

const crosswordData = [
    // number: 문항 번호, type: across/down, clue: 힌트, word: 정답, start_row/col: 1-based index, feedback: 강한 비계
    { number: 1, type: 'across', clue: '행동주의에서 반응을 일으키는 외부의 신호예요.', word: '자극', start_row: 1, start_col: 2, feedback: '행동주의 학습 이론에서 행동 변화를 일으키는 외부의 요소를 뜻해요.' },
    { number: 2, type: 'across', clue: '학습 목표를 향해 움직이게 만드는 심리적 원동력이에요.', word: '동기', start_row: 2, start_col: 1, feedback: '행동의 방향과 강도를 결정하는 심리적 상태를 뜻해요. 학습에 필수적이죠.' },
    { number: 4, type: 'across', clue: '‘생각에 대한 생각’을 하면서 전략을 조절하는 능력이에요.', word: '초인지', start_row: 3, start_col: 6, feedback: "'인지에 대한 인지'라고도 불리며, 학습자가 자신의 학습을 계획하고 조절하는 능력이에요." },
    { number: 7, type: 'across', clue: '해결 방법이 여러 가지라서 답이 명확하지 않은 문제예요.', word: '비구조화', start_row: 7, start_col: 3, feedback: '정답이 하나로 정해져 있지 않고, 해결 과정이 복잡한 실제 삶의 문제를 뜻해요.' },
    
    { number: 1, type: 'down', clue: '자신이 과제를 성공할 수 있다고 믿는 마음이에요.', word: '자기효능감', start_row: 1, start_col: 2, feedback: '스스로를 "할 수 있는 사람"이라고 믿는 자기 자신에 대한 평가를 뜻해요.' },
    { number: 3, type: 'down', clue: '비고츠키가 말한, 도움을 받으면 가능한 발달 영역이에요.', word: '근접발달', start_row: 2, start_col: 4, feedback: '학습자가 혼자서는 어렵지만 타인의 도움으로 성공할 수 있는 잠재적 영역을 의미해요.' },
    { number: 5, type: 'down', clue: '저장된 기억을 다시 꺼내는 과정이에요.', word: '인출', start_row: 3, start_col: 7, feedback: '장기 기억에 저장된 정보를 끄집어내는 과정으로, 반복하면 기억력이 향상돼요.' },
    { number: 6, type: 'down', clue: '정보를 장기 기억으로 바꾸어 저장하는 과정이에요.', word: '부호화', start_row: 5, start_col: 6, feedback: '새로운 정보를 기억 속에 저장하기 위해 형태를 바꾸는(변환하는) 과정을 뜻해요.' },
    { number: 7, type: 'down', clue: '학습자가 과제를 해결하도록 제공하는 임시적 도움이에요.', word: '비계', start_row: 7, start_col: 3, feedback: '구성주의에서 학습자를 위해 제공하는 발판이나 다리 역할을 하는 임시적인 도움을 뜻해요.' }
];

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
let answeredClues = new Set(); // 정답 맞힌 문항의 key (number+type) 저장


// --------------------------------------------------
// 2. 퍼즐판 생성 및 초기화
// --------------------------------------------------

window.initializeCrossword = function() {
    // 1. 상태 초기화
    window.gameState.crosswordGridState = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null));
    answeredClues.clear();
    crosswordContainer.innerHTML = ''; 
    
    const allClues = { across: [], down: [] };
    
    crosswordData.forEach((item, index) => {
        const { word, type, start_row: r, start_col: c } = item;
        
        allClues[type].push(item);
        
        // 그리드 상태에 단어 배치 및 교차점 처리 (1-based -> 0-based)
        let row = r - 1; 
        let col = c - 1; 
        for (let i = 0; i < word.length; i++) {
            if (row >= GRID_SIZE || col >= GRID_SIZE) continue;

            const cellData = window.gameState.crosswordGridState[row][col];
            
            if (!cellData) {
                window.gameState.crosswordGridState[row][col] = { 
                    letter: word[i].toUpperCase(), 
                    number: i === 0 ? item.number : null, 
                    clues: [] 
                };
            } else {
                // 교차점 처리
                if (i === 0) {
                    window.gameState.crosswordGridState[row][col].number = item.number;
                }
            }
            // 이 셀에 해당하는 힌트 정보를 추가
            window.gameState.crosswordGridState[row][col].clues.push({ index: index, type: type });

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
    for (let r = 0; r < GRID_SIZE; r++) {
        const row = crosswordContainer.insertRow();
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = row.insertCell();
            const cellData = window.gameState.crosswordGridState[r][c];

            if (cellData) {
                cell.classList.add('puzzle-cell');
                cell.dataset.row = r; // 0-based index
                cell.dataset.col = c; // 0-based index
                
                if (cellData.number) {
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('cell-number');
                    numSpan.textContent = cellData.number;
                    cell.appendChild(numSpan);
                }

                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.disabled = true; // 개별 칸 입력 비활성화 
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

    let r = item.start_row - 1; // 0-based
    let c = item.start_col - 1; // 0-based
    
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
        let r = currentCrosswordItem.start_row - 1; // 0-based
        let c = currentCrosswordItem.start_col - 1; // 0-based
        for (let i = 0; i < correctAnswer.length; i++) {
            const cell = document.querySelector(`.puzzle-cell[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
                const input = cell.querySelector('input');
                // 시각적 효과를 위한 작은 딜레이
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
                window.initializeCrossword(); // 완벽한 리셋
            }
        });
    }
});