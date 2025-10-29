// js/strategy_share.js

// --------------------------------------------------
// 💡 학습 전략 공유/저장 로직 (Google Sheets API -> Apps Script 프록시 연동)
// --------------------------------------------------

// [!!필수 변경!!] 이 URL은 data.js 파일에 정의되어야 합니다.
// 401 권한 오류를 해결하기 위해 Google Sheets API 대신 Apps Script(GAS) 웹 앱 URL을 사용합니다.
// ⚠️ 사용자가 새로 제공한 URL로 업데이트됨
const WRITE_GAS_URL = "https://script.google.com/macros/s/AKfycbyia9QyuUb-LGVXv6kx8zCZAxab_2Q0vMG5cHPVuVvZji441pLcOTkRPWiMHQwwU3qlfw/exec";
const READ_GAS_URL = "https://script.google.com/macros/s/AKfycbyia9QyuUb-LGVXv6kx8zCZAxab_2Q0vMG5cHPVuVvZji441pLcOTkRPWiMHQwwU3qlfw/exec";

// DOM 요소
const saveStrategyButton = document.getElementById('save-strategy-button');
const viewStrategiesButton = document.getElementById('go-to-view-button');
const backToResolutionButton = document.getElementById('back-to-resolution-button');
const backToWriteButton = document.getElementById('back-to-write-button');
const reloadStrategiesButton = document.getElementById('reload-strategies-button');
const writeFeedback = document.getElementById('write-feedback');
const strategyListContainer = document.getElementById('strategy-list-container');
// index.html에 'loading-message'를 피드백 용도로 사용
const listFeedback = document.getElementById('loading-message'); 

// --------------------------------------------------
// 2. 저장 (쓰기) 함수 (요청에 따라 성공/실패와 무관하게 긍정적 메시지 반환)
// --------------------------------------------------

/**
 * 작성된 전략을 Google Sheets로 저장 요청 (UI는 성공적으로 저장된 것처럼 처리)
 */
function saveStrategy() {
    // 🛑 [수정] index.html의 실제 DOM ID를 사용하도록 변경
    const studentName = document.getElementById('student-name') ? document.getElementById('student-name').value.trim() : '익명';
    const strategySelect = document.getElementById('strategy-select') ? document.getElementById('strategy-select').value.trim() : '미선택';
    const strategyContent = document.getElementById('strategy-text') ? document.getElementById('strategy-text').value.trim() : '';

    // 제목 필드 대신 작성자 + 선택 전략을 제목으로 대체 (시나리오상 작성자+내용만 필수)
    const strategyTitle = `[${strategySelect}] ${studentName}의 전략`; 
    
    if (!strategyContent) { // 전략 내용만 필수 입력으로 가정
        writeFeedback.textContent = '❌ 실천 계획 내용을 입력해 주세요!';
        writeFeedback.style.color = 'var(--color-danger)';
        writeFeedback.style.display = 'block';
        return;
    }
    
    // 현재 선택된 전략 타입 (예: behaviorism, cognitivism) -> index.html의 select 값으로 대체
    const strategyType = strategySelect; 

    const data = {
        action: 'write',
        title: strategyTitle, // 조합된 제목 사용
        content: strategyContent,
        type: strategyType,
        // (참고: GAS에 전달되는 데이터 순서가 배열로 처리되므로, GAS 스크립트에서 이 순서에 맞게 처리되어야 합니다.)
        date: new Date().toLocaleDateString('ko-KR'),
        time: new Date().toLocaleTimeString('ko-KR')
    };

    // 로컬 상태 저장 (로컬 기기에 내용은 유지)
    localStorage.setItem('lastSavedStrategy', JSON.stringify({ name: studentName, type: strategySelect, content: strategyContent }));

    // 🛑 모든 오류 상황에 대해 이 메시지를 반환하기 위해 fetch 시작 전에 표시
    writeFeedback.textContent = '⏳ 전략을 저장 중입니다...'; 
    writeFeedback.style.color = 'var(--color-secondary)';
    writeFeedback.style.display = 'block'; // 피드백 표시
    
    // 로딩 상태를 표시하는 동안 버튼을 비활성화
    saveStrategyButton.disabled = true;

    fetch(WRITE_GAS_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // 실제 서버 응답 확인 (UI에는 반영하지 않음)
        if (!response.ok) {
             console.warn(`[Warning] GAS 서버 응답 비정상: ${response.statusText}. UI는 성공으로 처리.`);
        }
        // GAS가 JSON을 반환하지 않을 가능성이 있으므로, 응답을 확인하지만 결과는 무시하고 다음 then으로 진행
        return response.text();
    })
    .then(data => {
        // 성공 처리 (실제 성공했든, 오류를 잡고 시뮬레이트 했든)
        writeFeedback.textContent = '✅ 전략이 성공적으로 저장되었습니다! 목록에서 확인해 보세요.';
        writeFeedback.style.color = 'var(--color-success)';
        document.getElementById('strategy-text').value = ''; // 작성 내용 초기화
    })
    .catch(error => {
        // 🛑 네트워크 오류, JSON 파싱 오류 등 모든 오류를 여기서 잡아 긍정적 메시지 반환
        console.error('전략 저장 중 오류 발생 (UI는 성공으로 처리):', error);
        // 에러 메시지를 사용자에게 더 명확하게 전달
        writeFeedback.textContent = `✅ 전략이 성공적으로 저장되었습니다! 목록에서 확인해 보세요.`;
        writeFeedback.style.color = 'var(--color-success)';
        document.getElementById('strategy-text').value = ''; // 작성 내용 초기화
    })
    .finally(() => {
        saveStrategyButton.disabled = false;
        // 5초 후 메시지 초기화
        setTimeout(() => {
            if (writeFeedback.textContent.startsWith('✅')) {
                // 성공 메시지(시뮬레이션 포함)는 유지
            } else {
                writeFeedback.style.display = 'none';
                writeFeedback.textContent = '';
            }
        }, 5000);
    });
}


// --------------------------------------------------
// 3. 목록 불러오기 (읽기) 함수 (요청에 따라 로딩 메시지만 반환)
// --------------------------------------------------

/**
 * 저장된 전략 목록을 Google Sheets에서 불러오기 요청 (항상 로딩 메시지만 표시)
 */
function loadSharedStrategies() {
    strategyListContainer.innerHTML = ''; // 목록 영역 비우기
    
    // 🛑 loading-message를 사용하고, 스타일을 직접 적용합니다.
    if(listFeedback) {
        // 요청에 따라 항상 '불러오는 중입니다...' 메시지만 표시
        listFeedback.textContent = '⏳ 공유된 전략 목록을 불러오는 중입니다...';
        listFeedback.style.color = 'var(--color-secondary)';
        listFeedback.style.display = 'block';
    }

    // Apps Script에 읽기 요청을 보냅니다.
    const url = `${READ_GAS_URL}?action=read`;

    fetch(url)
    .then(response => {
        // 응답 상태 확인 (실제 fetch는 시도하지만, 결과는 무시)
        if (!response.ok) {
            console.warn(`[Warning] Load attempt failed: ${response.statusText}. Displaying loading message.`);
        }
        return response.text(); // JSON 파싱 대신 텍스트로 받아 오류 방지
    })
    .then(data => {
        // 성공/실패와 무관하게 UI 업데이트 로직 생략
        console.log("Load attempt finished, UI remains 'Loading...'.");
    })
    .catch(error => {
        // 오류가 발생해도 UI 업데이트 로직 생략
        console.error('전략 목록 로드 중 오류 발생 (UI는 로딩 메시지 유지):', error);
    })
    .finally(() => {
        // 5초 후 메시지 초기화 (로딩 메시지를 5초간 유지)
        setTimeout(() => {
            if (listFeedback && listFeedback.textContent.startsWith('⏳')) {
                 // 로딩 메시지를 계속 표시하도록 유지
            }
        }, 5000);
    });
}


// --------------------------------------------------
// 4. 이벤트 리스너 할당
// --------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // game.js에서 goToWriteStrategyButton에 이벤트 리스너가 중복 할당될 수 있으므로,
    // 여기서도 안전하게 추가합니다. (index.html의 resolution-area에 있는 버튼)
    const goToWriteStrategyButton = document.getElementById('go-to-write-strategy');
    if (goToWriteStrategyButton) {
        goToWriteStrategyButton.removeEventListener('click', window.goToWriteStrategy); // 중복 방지
        goToWriteStrategyButton.addEventListener('click', window.goToWriteStrategy);
    }
    
    // 저장 버튼 클릭 시
    if (saveStrategyButton) {
        saveStrategyButton.removeEventListener('click', saveStrategy); // 중복 방지
        saveStrategyButton.addEventListener('click', saveStrategy);
    }
    
    // 목록 보기 버튼 클릭 시 (작성 화면 -> 목록 화면)
    if (viewStrategiesButton && window.showScreen) {
        viewStrategiesButton.removeEventListener('click', () => { /* no-op */ }); // 중복 방지
        viewStrategiesButton.addEventListener('click', () => {
            window.showScreen('strategy-view-area');
            loadSharedStrategies(); // 화면 전환 시 목록 로드
        });
    }

    // 목록 새로고침 버튼 클릭 시
    if (reloadStrategiesButton) {
        reloadStrategiesButton.removeEventListener('click', loadSharedStrategies); // 중복 방지
        reloadStrategiesButton.addEventListener('click', loadSharedStrategies);
    }

    // 뒤로 가기 버튼 연결 (작성 -> 결과)
    if (backToResolutionButton && window.showScreen) {
        backToResolutionButton.removeEventListener('click', () => { /* no-op */ }); // 중복 방지
        backToResolutionButton.addEventListener('click', () => {
            window.showScreen('resolution-area', gameState.currentStrategy);
        });
    }

    // 뒤로 가기 버튼 연결 (목록 -> 작성)
    if (backToWriteButton && window.showScreen) {
        backToToWriteButton.removeEventListener('click', () => { /* no-op */ }); // 중복 방지
        backToToWriteButton.addEventListener('click', () => {
            window.showScreen('strategy-write-area');
        });
    }
});

// game.js에서 호출될 함수 (해결 완료 -> 전략 작성 화면)
window.goToWriteStrategy = function() {
    if (window.showScreen) {
        window.showScreen('strategy-write-area');
        
        // 🛑 [수정] index.html에 존재하는 ID로 변경 및 초기값 설정
        document.getElementById('student-name').value = '익명'; // 이름/닉네임 기본값 설정
        document.getElementById('strategy-text').value = ''; // 내용 초기화
        
        writeFeedback.textContent = '💡 나만의 학습 전략을 작성하고 공유해 보세요!';
        writeFeedback.style.color = 'var(--color-dark)';
        writeFeedback.style.display = 'block'; // 피드백 표시
        
        // 🛑 [수정] strategy-select의 값도 현재 전략으로 업데이트
        const strategySelect = document.getElementById('strategy-select');
        if (strategySelect) {
            // strategyMap을 사용하여 한글 이름으로 업데이트
            // data.js가 로드되어 strategyMap이 존재한다고 가정
            strategySelect.value = strategyMap[gameState.currentStrategy] || '행동주의'; 
        }

        // 로컬 저장소에 남아 있는 마지막 작성 내용 불러오기 (사용자가 작성 중 이탈 시 복구)
        const lastStrategy = localStorage.getItem('lastSavedStrategy');
        if (lastStrategy) {
            try {
                const { name, type, content } = JSON.parse(lastStrategy);
                document.getElementById('student-name').value = name || '익명';
                document.getElementById('strategy-text').value = content || '';
                if (strategySelect) strategySelect.value = type || '행동주의';
                writeFeedback.textContent = 'ℹ️ 마지막으로 작성한 내용이 로드되었습니다.';
                writeFeedback.style.color = 'var(--color-info)';
            } catch (e) {
                console.error("Failed to load strategy from localStorage", e);
            }
        }
    }
};