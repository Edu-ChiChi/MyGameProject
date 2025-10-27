// js/strategy_share.js

// --------------------------------------------------
// 💡 학습 전략 공유/저장 로직 (Google Sheets API -> Apps Script 프록시 연동)
// --------------------------------------------------

// [!!필수 변경!!] 이 URL은 data.js 파일에 정의되어야 합니다.
// 401 권한 오류를 해결하기 위해 Google Sheets API 대신 Apps Script(GAS) 웹 앱 URL을 사용합니다.
const WRITE_GAS_URL = "https://script.google.com/macros/library/d/1fc-ZN_PCt2lnmZHXFwkJ3xkCJ7lwkZF2MXqps46-t7P2R07mNSxLNgV6/2";
const READ_GAS_URL = "https://script.google.com/macros/library/d/1fc-ZN_PCt2lnmZHXFwkJ3xkCJ7lwkZF2MXqps46-t7P2R07mNSxLNgV6/2";

// DOM 요소
const saveStrategyButton = document.getElementById('save-strategy-button');
const viewStrategiesButton = document.getElementById('go-to-view-button');
const backToResolutionButton = document.getElementById('back-to-resolution-button');
const backToWriteButton = document.getElementById('back-to-write-button');
const reloadStrategiesButton = document.getElementById('reload-strategies-button');
const writeFeedback = document.getElementById('write-feedback');
const strategyListContainer = document.getElementById('strategy-list-container');
const loadingMessage = document.getElementById('loading-message');

// API 엔드포인트 기본 URL (Apps Script URL로 대체되어 사용하지 않습니다.)
// const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;


// --------------------------------------------------
// A. 저장(쓰기) 함수 (GAS POST 요청으로 변경)
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
    
    // API URL: 쓰기 요청 (GAS 웹 앱 URL 사용)
    const url = WRITE_GAS_URL;

    try {
        saveStrategyButton.disabled = true;
        saveStrategyButton.textContent = "저장 중...";
        
        // GAS가 파싱하기 쉬운 JSON 형태로 데이터를 전송합니다.
        const requestBody = {
            name: name,
            strategy: strategy,
            plan: plan,
            timestamp: timestamp
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        // GAS는 보통 status 200을 반환합니다.
        if (response.ok) {
            writeFeedback.textContent = `✅ 전략이 성공적으로 공유되었습니다! (작성자: ${name})`;
            writeFeedback.style.display = 'block';
            document.getElementById('strategy-text').value = ''; // 작성 내용 초기화
        } else {
            const errorText = await response.text();
            writeFeedback.textContent = `❌ 저장 실패: Apps Script 설정 또는 URL을 확인하세요. (에러: ${errorText.substring(0, 50)}...)`;
            writeFeedback.style.display = 'block';
        }
    } catch (error) {
        writeFeedback.textContent = '❌ 네트워크 또는 Apps Script 호출 오류가 발생했습니다.';
        writeFeedback.style.display = 'block';
        console.error('Save Strategy Error:', error);
    } finally {
        saveStrategyButton.disabled = false;
        saveStrategyButton.textContent = "전략 저장 및 공유";
    }
}


// --------------------------------------------------
// B. 불러오기(읽기) 함수 (GAS GET 요청으로 변경)
// --------------------------------------------------

async function loadSharedStrategies() {
    strategyListContainer.innerHTML = ''; // 기존 목록 초기화
    loadingMessage.textContent = '전략 목록을 불러오는 중...';
    loadingMessage.style.display = 'block';
    
    // API URL: 읽기 요청 (GAS 웹 앱 URL 사용)
    const url = READ_GAS_URL;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
             const errorText = await response.text();
             loadingMessage.textContent = `❌ 목록 로드 실패: Apps Script 설정 또는 URL을 확인하세요. (에러: ${errorText.substring(0, 50)}...)`;
             return;
        }

        const data = await response.json();
        // GAS에서 Sheets API의 values 구조를 그대로 반환한다고 가정합니다.
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
// C. 이벤트 리스너 및 화면 전환 연결 (페이지 이동 오류 수정 포함)
// --------------------------------------------------

// 게임이 로드된 후 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
    
    // ① 페이지 이동 오류 수정: '나만의 전략 작성하기' 버튼 클릭 시 리스너 연결
    const goToWriteStrategyButton = document.getElementById('go-to-write-strategy');
    if (goToWriteStrategyButton) {
        goToWriteStrategyButton.addEventListener('click', window.goToWriteStrategy);
    }
    
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