// js/strategy_share.js

// --------------------------------------------------
// 💡 학습 전략 공유/저장 로직 (Google Sheets API 연동)
// --------------------------------------------------

// DOM 요소
const saveStrategyButton = document.getElementById('save-strategy-button');
const viewStrategiesButton = document.getElementById('go-to-view-button');
const backToResolutionButton = document.getElementById('back-to-resolution-button');
const backToWriteButton = document.getElementById('back-to-write-button');
const reloadStrategiesButton = document.getElementById('reload-strategies-button');
const writeFeedback = document.getElementById('write-feedback');
const strategyListContainer = document.getElementById('strategy-list-container');
const loadingMessage = document.getElementById('loading-message');

// API 엔드포인트 기본 URL (쓰기/읽기)
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;


// --------------------------------------------------
// A. 저장(쓰기) 함수
// --------------------------------------------------

async function saveStrategy() {
    writeFeedback.style.display = 'none';
    const name = document.getElementById('student-name').value.trim() || '익명';
    const strategy = document.getElementById('strategy-select').value;
    const plan = document.getElementById('strategy-text').value.trim();
    
    if (plan.length < 10) {
        alert("실천 계획을 10자 이상 구체적으로 작성해 주세요.");
        return;
    }
    
    // 타임스탬프를 KST로 설정하여 기록
    const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    // [A열 이름, B열 선택 전략, C열 실천 계획, D열 타임스탬프]
    const dataRow = [name, strategy, plan, timestamp]; 

    // API URL: 쓰기 (append) 요청
    const url = `${BASE_URL}/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&key=${SHEET_API_KEY}`;

    try {
        saveStrategyButton.disabled = true;
        saveStrategyButton.textContent = "저장 중...";
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [dataRow]
            })
        });

        if (response.ok) {
            writeFeedback.textContent = `✅ 전략이 성공적으로 공유되었습니다! (작성자: ${name})`;
            writeFeedback.style.display = 'block';
            document.getElementById('strategy-text').value = ''; // 작성 내용 초기화
        } else {
            // API 에러 처리 (예: API 키 잘못됨, 권한 없음 등)
            const errorText = await response.text();
            writeFeedback.textContent = `❌ 저장 실패: 스프레드시트 권한 설정을 확인하세요. (에러: ${errorText.substring(0, 50)}...)`;
            writeFeedback.style.display = 'block';
        }
    } catch (error) {
        writeFeedback.textContent = '❌ 네트워크 또는 API 호출 오류가 발생했습니다.';
        writeFeedback.style.display = 'block';
        console.error('Save Strategy Error:', error);
    } finally {
        saveStrategyButton.disabled = false;
        saveStrategyButton.textContent = "전략 저장 및 공유";
    }
}


// --------------------------------------------------
// B. 불러오기(읽기) 함수
// --------------------------------------------------

async function loadSharedStrategies() {
    strategyListContainer.innerHTML = ''; // 기존 목록 초기화
    loadingMessage.textContent = '전략 목록을 불러오는 중...';
    loadingMessage.style.display = 'block';
    
    // API URL: 읽기 (get) 요청
    const readRange = `${SHEET_NAME}!A:D`; 
    const url = `${BASE_URL}/${readRange}?majorDimension=ROWS&key=${SHEET_API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
             const errorText = await response.text();
             loadingMessage.textContent = `❌ 목록 로드 실패: API 키 또는 Sheet ID를 확인하세요. (에러: ${errorText.substring(0, 50)}...)`;
             return;
        }

        const data = await response.json();
        const values = data.values;
        
        if (!values || values.length <= 1) { // 헤더 행 제외
            strategyListContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">아직 공유된 전략이 없습니다.</p>';
        } else {
            // 헤더(첫 행) 제외하고 데이터만 처리
            const strategies = values.slice(1).reverse(); // 최신순 정렬을 위해 reverse()
            
            strategyListContainer.innerHTML = strategies.map(row => {
                const [name, strategy, plan, timestamp] = row;
                // 전략에 따라 카드 색상 클래스를 적용합니다.
                const strategyClass = strategy ? strategy.toLowerCase().replace(/[^a-z]/g, '') : 'secondary';
                
                return `
                    <div class="task-card ${strategyClass}" style="width: 100%;">
                        <p><strong>${name}</strong> 님의 전략: <span style="color: var(--color-primary);">${strategy}</span></p>
                        <p style="font-size: 0.9em; margin-bottom: 5px;">${plan}</p>
                        <span style="font-size: 0.75em; color: var(--color-secondary);">${timestamp || '시간 정보 없음'}</span>
                    </div>
                `;
            }).join('');
        }
        
        loadingMessage.style.display = 'none';

    } catch (error) {
        loadingMessage.textContent = '❌ 네트워크 오류가 발생했습니다.';
        console.error('Load Strategy Error:', error);
    }
}


// --------------------------------------------------
// C. 이벤트 리스너 및 화면 전환 연결
// --------------------------------------------------

// 게임이 로드된 후 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
    
    // 저장 버튼 클릭 시
    if (saveStrategyButton) {
        saveStrategyButton.addEventListener('click', saveStrategy);
    }
    
    // 목록 보기 버튼 클릭 시 (작성 화면 -> 목록 화면)
    if (viewStrategiesButton && window.showScreen) {
        viewStrategiesButton.addEventListener('click', () => {
            window.showScreen('strategy-view-area');
            loadSharedStrategies(); // 화면 전환 시 목록 로드
        });
    }

    // 목록 새로고침 버튼 클릭 시
    if (reloadStrategiesButton) {
        reloadStrategiesButton.addEventListener('click', loadSharedStrategies);
    }

    // 뒤로 가기 버튼 연결 (작성 -> 결과)
    if (backToResolutionButton && window.showScreen) {
        backToResolutionButton.addEventListener('click', () => {
            window.showScreen('resolution-area', gameState.currentStrategy);
        });
    }

    // 뒤로 가기 버튼 연결 (목록 -> 작성)
    if (backToWriteButton && window.showScreen) {
        backToWriteButton.addEventListener('click', () => {
            window.showScreen('strategy-write-area');
        });
    }
});

// game.js에서 호출될 함수 (해결 완료 -> 전략 작성 화면)
window.goToWriteStrategy = function() {
    if (window.showScreen) {
        window.showScreen('strategy-write-area');
        // 미션 완료 후 이전에 선택했던 전략을 기본값으로 설정
        document.getElementById('strategy-select').value = strategyMap[gameState.currentStrategy] || '행동주의';
    }
}