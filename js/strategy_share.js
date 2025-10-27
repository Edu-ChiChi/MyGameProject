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
// index.html에 list-feedback ID가 정의되지 않았으므로 strategy-view-area 내에서 유사한 요소를 사용하거나 새로 추가해야 하지만, 
// 현재는 오류를 유발하지 않도록 임시로 null로 둡니다.
// index.html에 `strategy-view-area` 내에 <p id="list-feedback"></p>를 추가해야 올바르게 작동합니다.
const listFeedback = document.getElementById('loading-message'); // index.html에 'loading-message'를 피드백 용도로 사용

// --------------------------------------------------
// 2. 저장 (쓰기) 함수
// --------------------------------------------------

/**
 * 작성된 전략을 Google Sheets로 저장 요청
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

    writeFeedback.textContent = '⏳ 전략을 저장 중입니다...';
    writeFeedback.style.color = 'var(--color-secondary)';
    writeFeedback.style.display = 'block'; // 피드백 표시
    
    // 로딩 상태를 표시하는 동안 버튼을 비활성화
    saveStrategyButton.disabled = true;

    fetch(WRITE_GAS_URL, {
        method: 'POST',
        // 🛑 수정: mode: 'no-cors'를 제거하여 응답 상태를 확인하고 JSON을 파싱할 수 있도록 합니다.
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // 응답 상태가 200-299가 아니면 직접 에러 발생 (권한/URL 오류 확인)
        if (!response.ok) {
             const errorStatus = response.statusText || `HTTP Error ${response.status}`;
             throw new Error(`GAS 서버 응답 오류: ${errorStatus}. 권한 또는 URL 확인 필요.`);
        }
        
        // 정상 응답이라면 JSON 파싱을 시도
        return response.json().then(data => {
            if (data.error) {
                // GAS 스크립트 내부에서 에러 처리 후 JSON으로 반환한 경우
                 throw new Error(`GAS 스크립트 오류: ${data.error}`);
            }
            return data;
        }).catch(e => {
             // JSON 파싱 자체에 실패한 경우 (GAS가 JSON이 아닌 HTML 등을 반환)
             throw new Error(`GAS 응답 파싱 오류. 서버 응답이 유효한 JSON 형식이 아닙니다. (GAS 웹 앱 배포 설정 확인)`);
        });
    })
    .then(data => {
        // 성공 처리
        writeFeedback.textContent = '✅ 전략이 성공적으로 저장되었습니다! 목록에서 확인해 보세요.';
        writeFeedback.style.color = 'var(--color-success)';
        // document.getElementById('strategy-title-input').value = ''; // 제거
        document.getElementById('strategy-text').value = '';

        // 성공 후 목록 새로고침
        // loadSharedStrategies(); // 저장 후 자동으로 목록을 로드할 필요는 없습니다. 사용자가 목록 보기를 누를 때 로드
    })
    .catch(error => {
        // 네트워크 오류 또는 커스텀 throw된 오류가 여기서 잡힙니다.
        console.error('전략 저장 중 오류 발생:', error);
        // 에러 메시지를 사용자에게 더 명확하게 전달
        writeFeedback.textContent = `🚨 전략 저장 실패: ${error.message}`;
        writeFeedback.style.color = 'var(--color-danger)';
    })
    .finally(() => {
        saveStrategyButton.disabled = false;
        // 5초 후 메시지 초기화
        setTimeout(() => {
            if (writeFeedback.textContent.startsWith('🚨') || writeFeedback.textContent.startsWith('✅')) {
                // 성공 또는 실패 메시지는 유지
            } else {
                writeFeedback.style.display = 'none';
                writeFeedback.textContent = '';
            }
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
    
    // 🛑 [수정] listFeedback 대신 loading-message를 사용하고, 스타일을 직접 적용합니다.
    if(listFeedback) {
        listFeedback.textContent = '⏳ 공유된 전략 목록을 불러오는 중입니다...';
        listFeedback.style.color = 'var(--color-secondary)';
        listFeedback.style.display = 'block';
    }

    // Apps Script에 읽기 요청을 보냅니다.
    // 'read' 액션 파라미터를 추가하여 GAS에서 읽기 함수가 실행되도록 유도합니다.
    const url = `${READ_GAS_URL}?action=read`;

    fetch(url)
    .then(response => {
        // 응답 상태 확인
        if (!response.ok) {
            const errorStatus = response.statusText || `HTTP Error ${response.status}`;
            throw new Error(`GAS 서버 응답 오류: ${errorStatus}. 권한 또는 URL 확인 필요.`);
        }
        // GAS는 JSON을 반환해야 합니다.
        return response.json();
    })
    .then(data => {
        // 🛑 [수정] loading-message/listFeedback 업데이트 로직
        if (data.error) {
            // Apps Script에서 명시적으로 오류를 반환한 경우
            if(listFeedback) {
                listFeedback.textContent = `🚨 전략 로딩 오류: ${data.error}`;
                listFeedback.style.color = 'var(--color-danger)';
                listFeedback.style.display = 'block';
            }
            console.error('Apps Script Error:', data.error);
            return;
        }

        if (data && data.length > 0) {
            // 시트 데이터 처리
            const html = data.map(strategy => {
                // 시트 열 순서: Type, Title, Content, Date, Time (GAS에서 전달하는 배열 순서)
                const [type, title, content, date, time] = strategy;
                
                // 줄바꿈 문자 처리
                const displayContent = content ? content.replace(/\n/g, '<br>') : '';
                
                // 전략 Type에 따라 badge 클래스 생성
                const typeClass = type === '행동주의' ? 'behaviorism' : 
                                  type === '인지주의' ? 'cognitivism' : 
                                  type === '구성주의' ? 'constructivism' : 'secondary';
                
                return `
                    <div class="strategy-item">
                        <div class="strategy-header">
                            <span class="strategy-type badge ${typeClass}">${type}</span>
                            <h5 class="strategy-title">${title}</h5>
                            <span class="strategy-datetime">${date} ${time}</span>
                        </div>
                        <p class="strategy-content">${displayContent}</p>
                    </div>
                `;
            }).join('');
            
            strategyListContainer.innerHTML = html;
            if(listFeedback) {
                listFeedback.textContent = `✅ 총 ${data.length}개의 전략이 성공적으로 로드되었습니다.`;
                listFeedback.style.color = 'var(--color-success)';
                listFeedback.style.display = 'block';
            }

        } else {
            strategyListContainer.innerHTML = '<p class="text-center">아직 공유된 학습 전략이 없습니다. 첫 번째 전략을 작성해 보세요!</p>';
            if(listFeedback) {
                listFeedback.textContent = '💡 전략 목록이 비어 있습니다.';
                listFeedback.style.color = 'var(--color-secondary)';
                listFeedback.style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('전략 목록 로드 중 오류 발생:', error);
        if(listFeedback) {
            listFeedback.textContent = `🚨 전략 목록 로드 실패: ${error.message}`;
            listFeedback.style.color = 'var(--color-danger)';
            listFeedback.style.display = 'block';
        }
    })
    .finally(() => {
        // 5초 후 메시지 초기화
        setTimeout(() => {
            if (listFeedback && listFeedback.textContent.startsWith('⏳')) {
                 listFeedback.style.display = 'none';
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
    }
};