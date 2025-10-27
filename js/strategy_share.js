// js/strategy_share.js

// --------------------------------------------------
// 💡 학습 전략 공유/저장 로직 (Google Sheets API -> Apps Script 프록시 연동)
// --------------------------------------------------

// [!!필수 변경!!] 이 URL은 data.js 파일에 정의되어야 합니다.
// 401 권한 오류를 해결하기 위해 Google Sheets API 대신 Apps Script(GAS) 웹 앱 URL을 사용합니다.
// ⚠️ 사용자가 새로 제공한 URL로 업데이트됨
const WRITE_GAS_URL = "https://script.google.com/macros/s/AKfycbwViQYs1-kDdLE3x6e9m1w57g5kQJka7-Him1dJwKa1oI8GeVulNUSDDFtKGB2m4J5ufQ/exec";
const READ_GAS_URL = "https://script.google.com/macros/s/AKfycbwViQYs1-kDdLE3x6e9m1w57g5kQJka7-Him1dJwKa1oI8GeVulNUSDDFtKGB2m4J5ufQ/exec";

// DOM 요소
const saveStrategyButton = document.getElementById('save-strategy-button');
const viewStrategiesButton = document.getElementById('go-to-view-button');
const backToResolutionButton = document.getElementById('back-to-resolution-button');
const backToWriteButton = document.getElementById('back-to-write-button');
const reloadStrategiesButton = document.getElementById('reload-strategies-button');
const writeFeedback = document.getElementById('write-feedback');
const strategyListContainer = document.getElementById('strategy-list-container');
const listFeedback = document.getElementById('list-feedback');

// --------------------------------------------------
// 2. 저장 (쓰기) 함수
// --------------------------------------------------

/**
 * 작성된 전략을 Google Sheets로 저장 요청
 */
function saveStrategy() {
    const strategyTitle = document.getElementById('strategy-title-input').value.trim();
    const strategyContent = document.getElementById('strategy-content-input').value.trim();

    if (!strategyTitle || !strategyContent) {
        writeFeedback.textContent = '❌ 제목과 내용을 모두 입력해 주세요!';
        writeFeedback.style.color = 'var(--color-danger)';
        return;
    }

    // 현재 선택된 전략 타입 (예: behaviorism, cognitivism)
    const strategyType = gameState.currentStrategy || '미선택'; 

    const data = {
        action: 'write',
        title: strategyTitle,
        content: strategyContent,
        type: strategyType,
        date: new Date().toLocaleDateString('ko-KR'),
        time: new Date().toLocaleTimeString('ko-KR')
    };

    writeFeedback.textContent = '⏳ 전략을 저장 중입니다...';
    writeFeedback.style.color = 'var(--color-secondary)';
    
    // 로딩 상태를 표시하는 동안 버튼을 비활성화
    saveStrategyButton.disabled = true;

    fetch(WRITE_GAS_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script CORS 정책 우회
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // 'no-cors' 모드에서는 응답 상태를 직접 확인할 수 없습니다.
        // 따라서 성공/실패 여부는 Apps Script 내부 로직과 시나리오에 따라
        // 성공 메시지를 표시하는 것으로 가정합니다.
        
        // 실제로는 Apps Script가 시트 작성 후 JSON 응답을 반환해야 하지만, 
        // 간단한 예제이므로 fetch가 오류 없이 완료되면 성공으로 간주합니다.
        
        writeFeedback.textContent = '✅ 전략이 성공적으로 저장되었습니다! 목록에서 확인해 보세요.';
        writeFeedback.style.color = 'var(--color-success)';
        document.getElementById('strategy-title-input').value = '';
        document.getElementById('strategy-content-input').value = '';

        // 성공 후 목록 새로고침
        loadSharedStrategies();
    })
    .catch(error => {
        // 네트워크 오류 등 심각한 오류만 catch됩니다.
        console.error('전략 저장 중 오류 발생:', error);
        writeFeedback.textContent = '🚨 전략 저장 중 오류가 발생했습니다. Apps Script 배포 설정을 확인해 주세요. (오류 상세: ' + error.message + ')';
        writeFeedback.style.color = 'var(--color-danger)';
    })
    .finally(() => {
        saveStrategyButton.disabled = false;
        // 5초 후 메시지 초기화
        setTimeout(() => {
            writeFeedback.textContent = '';
        }, 5000);
    });
}


// --------------------------------------------------
// 3. 목록 불러오기 (읽기) 함수
// --------------------------------------------------

/**
 * 저장된 전략 목록을 Google Sheets에서 불러오기 요청
 */
function loadSharedStrategies() {
    strategyListContainer.innerHTML = '';
    listFeedback.textContent = '⏳ 공유된 전략 목록을 불러오는 중입니다...';
    listFeedback.style.color = 'var(--color-secondary)';

    // Apps Script에 읽기 요청을 보냅니다.
    // 'read' 액션 파라미터를 추가하여 GAS에서 읽기 함수가 실행되도록 유도합니다.
    const url = `${READ_GAS_URL}?action=read`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        // GAS 배포 오류는 여기서 잡히지 않지만, CORS 문제를 피하기 위해 
        // 성공적인 HTTP 응답을 가정하고 JSON 파싱을 시도합니다.
        throw new Error('네트워크 응답 오류 또는 Apps Script 설정 오류');
    })
    .then(data => {
        if (data.error) {
            // Apps Script에서 명시적으로 오류를 반환한 경우
            listFeedback.textContent = `🚨 전략 로딩 오류: ${data.error}`;
            listFeedback.style.color = 'var(--color-danger)';
            console.error('Apps Script Error:', data.error);
            return;
        }

        if (data && data.length > 0) {
            // 최신 전략이 위에 오도록 내림차순 정렬 (Sheet의 구조에 따라 다름)
            // 여기서는 이미 최신 데이터가 위에 있다고 가정하고 그대로 사용하거나,
            // 필요시 JS에서 data.reverse() 등으로 처리 가능

            const html = data.map(strategy => {
                // 시트 열 순서: Type, Title, Content, Date, Time
                const [type, title, content, date, time] = strategy;
                
                // 줄바꿈 문자 처리
                const displayContent = content ? content.replace(/\n/g, '<br>') : '';
                
                return `
                    <div class="strategy-item">
                        <div class="strategy-header">
                            <span class="strategy-type badge ${type.toLowerCase()}">${type}</span>
                            <h5 class="strategy-title">${title}</h5>
                            <span class="strategy-datetime">${date} ${time}</span>
                        </div>
                        <p class="strategy-content">${displayContent}</p>
                    </div>
                `;
            }).join('');
            
            strategyListContainer.innerHTML = html;
            listFeedback.textContent = `✅ 총 ${data.length}개의 전략이 성공적으로 로드되었습니다.`;
            listFeedback.style.color = 'var(--color-success)';

        } else {
            strategyListContainer.innerHTML = '<p class="text-center">아직 공유된 학습 전략이 없습니다. 첫 번째 전략을 작성해 보세요!</p>';
            listFeedback.textContent = '💡 전략 목록이 비어 있습니다.';
            listFeedback.style.color = 'var(--color-secondary)';
        }
    })
    .catch(error => {
        console.error('전략 목록 로드 중 오류 발생:', error);
        listFeedback.textContent = '🚨 전략 목록을 불러오는 중 네트워크 또는 서버 오류가 발생했습니다. Apps Script의 권한 설정(익명 사용자 포함) 및 배포 URL이 정확한지 확인해 주세요.';
        listFeedback.style.color = 'var(--color-danger)';
    })
    .finally(() => {
        // 5초 후 메시지 초기화
        setTimeout(() => {
            if (listFeedback.textContent.startsWith('⏳')) {
                 listFeedback.textContent = '';
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
        
        // 제목 자동 완성
        const type = gameState.currentStrategy;
        let titlePlaceholder = '나만의 학습 전략';
        if (type === 'behaviorism') titlePlaceholder = '행동주의 기반 학습 전략: 목표 달성 기록';
        if (type === 'cognitivism') titlePlaceholder = '인지주의 기반 학습 전략: 개념 연결법';
        if (type === 'constructivism') titlePlaceholder = '구성주의 기반 학습 전략: 협력 비계 활용법';
        
        document.getElementById('strategy-title-input').value = titlePlaceholder;
        document.getElementById('strategy-content-input').value = '';
        writeFeedback.textContent = '💡 나만의 학습 전략을 작성하고 공유해 보세요!';
        writeFeedback.style.color = 'var(--color-dark)';
    }
};

// 최초 로딩 시 목록을 바로 로드할 필요는 없습니다. 사용자가 '목록 보기'를 눌렀을 때 로드됩니다.
// window.loadSharedStrategies = loadSharedStrategies; // 외부에서 호출될 수 있도록 노출
