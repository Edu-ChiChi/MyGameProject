// js/cognitivism.js

// --------------------------------------------------
// 💡 인지주의 미션 로직 (Drag & Drop)
// --------------------------------------------------

const puzzlePiecesContainer = document.getElementById('puzzle-pieces-container');
const dropZones = document.querySelectorAll('.drop-zone');
const completeCognitivismButton = document.getElementById('simulate-cognitivism-completion');

// 미션 시작 시 호출 (game.js에서 호출됨)
window.loadCognitivismMission = function() {
    puzzlePiecesContainer.innerHTML = ''; // 조각 영역 초기화
    gameState.correctCognitivismDrops = 0; // 상태 초기화
    
    // 드래그 앤 드롭 이벤트 리스너 할당 (단, 한 번만)
    dropZones.forEach(zone => {
        // 기존 리스너 제거 (중복 할당 방지)
        zone.removeEventListener('dragover', handleDragOver);
        zone.removeEventListener('dragleave', handleDragLeave);
        zone.removeEventListener('drop', handleDrop);
        
        // 새 리스너 할당
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
        zone.innerHTML = `<h4>${zone.dataset.category}</h4>`; // 초기화된 상태로 문구만 남김
        zone.classList.remove('all-correct');
    });
    
    // 조각들을 무작위로 섞어 배치 (data.js의 cognitivismPieces 사용)
    cognitivismPieces.sort(() => 0.5 - Math.random()).forEach(piece => {
        const div = document.createElement('div');
        div.className = 'puzzle-piece';
        div.draggable = true;
        div.textContent = piece.name;
        div.dataset.pieceCategory = piece.category; // 정답 카테고리
        div.dataset.pieceId = piece.id; 
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        
        puzzlePiecesContainer.appendChild(div);
    });

    // 초기 로드 시 버튼 상채 확인/설정
    checkCognitivismMissionCompletion(); 
}

// Drag Start
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.pieceCategory);
    e.dataTransfer.setData('text/pieceId', e.target.dataset.pieceId);
    e.target.classList.add('dragging');
}

// Drag End
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Drag Over
function handleDragOver(e) {
    e.preventDefault(); 
    // e.currentTarget 사용
    if (e.currentTarget.classList.contains('drop-zone')) {
        e.currentTarget.classList.add('drag-over');
    }
}

// Drag Leave
function handleDragLeave(e) {
    // e.currentTarget 사용
    if (e.currentTarget.classList.contains('drop-zone')) {
        e.currentTarget.classList.remove('drag-over');
    }
}

// Drop
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const droppedCategory = e.dataTransfer.getData('text/plain');
    const pieceId = e.dataTransfer.getData('text/pieceId');
    const targetZone = e.currentTarget;
    const targetCategory = targetZone.dataset.category;
    
    const draggedElement = document.querySelector(`.puzzle-piece[data-piece-id=\"${pieceId}\"]`);

    if (droppedCategory === targetCategory) {
        // 정답 처리
        if (draggedElement) {
            targetZone.appendChild(draggedElement);
            draggedElement.draggable = false;
            draggedElement.classList.remove('dragging');
            draggedElement.style.backgroundColor = '#4CAF50';
            
            gameState.correctCognitivismDrops++;
            
            // 드롭 존 배경색 변경
            if(gameState.correctCognitivismDrops % 4 === 0) {
                 targetZone.classList.add('all-correct');
            }

            // 미션 완료 확인 (12개 모두 성공 시에만 화면 전환 가능)
            if (gameState.correctCognitivismDrops === gameState.totalCognitivismPieces) {
                // 기존 arert 와 window.showScreen 호출 주석처리
                // alert("🎉 모든 개념을 올바르게 연결했습니다! 이제 복잡한 내용을 만날 때마다 이 전략을 적용해 기억의 방을 활성화해 보세요!");
                // window.showScreen('resolution-area', 'cognitivism'); // 완료 후 해결창으로 이동
                
                checkCognitivismMissionCompletion();
            }
        }
    } else {
        // 오답 처리
        alert(`❌ ${draggedElement.textContent}은(는) ${targetCategory}의 개념이 아닙니다. 다시 시도해 보세요.`);
        // 오답 시 조각은 다시 원래 위치로 돌아간 것처럼 시뮬레이션 (DOM 조작은 필요 없음)
    }
}

// 미션 완료 체크 및 버튼 활성화 (12조각 다 채워야만 활성화)
function checkCognitivismMissionCompletion() {
    if (!completeCognitivismButton) return;
    
    const requiredDrops = gameState.totalCognitivismPieces; // 12
    const currentDrops = gameState.correctCognitivismDrops;
    
    if (currentDrops === requiredDrops) {
        completeCognitivismButton.disabled = false; // 12개 채워지면 활성화
        completeCognitivismButton.textContent = "✅ 퍼즐 완성! 결과 확인하기";
        alert("🎉 모든 개념을 올바르게 연결했습니다! 이제 완료 버튼을 눌러 결과 화면으로 이동하세요."); // 완료 시 알림 추가
    } else {
        completeCognitivismButton.disabled = true; // 12개 미만이면 비활성화
        completeCognitivismButton.textContent = `개념 퍼즐 완료 시 활성화 (${currentDrops}/${requiredDrops})`;
    }
};

// '미션 시뮬레이션 완료' 버튼 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
    const completeButton = document.getElementById('simulate-cognitivism-completion');
    
    if (completeButton) {
        // 기존 리스너가 중복되지 않도록 재정의합니다.
        // 버튼을 클릭했을 때, 완료 상태일 경우에만 화면이 전환되도록 보장합니다.
        completeButton.addEventListener('click', () => {
            if (window.showScreen && gameState.correctCognitivismDrops === gameState.totalCognitivismPieces) { 
                // 최종 확인 후 화면 전환 (버튼이 활성화된 상태여야 함)
                window.showScreen('resolution-area', 'cognitivism');
            } else {
                // 버튼이 비활성화되어 있기 때문에 이 경고는 뜨지 않지만 안전 장치입니다.
                alert("개념 퍼즐을 먼저 모두 완성해야 미션을 완료할 수 있습니다.");
            }
        });
        
        // 초기 로드 시 버튼 비활성화 상태로 시작
        completeButton.disabled = true;
        // 버튼 텍스트 초기 설정 (checkCognitivismMissionCompletion 함수가 로드 시 업데이트하지만 안전 장치)
        if (completeButton.textContent.startsWith('시뮬레이션 완료')) {
             completeButton.textContent = `개념 퍼즐 완료 시 활성화 (0/${gameState.totalCognitivismPieces})`;
        }
    }
});