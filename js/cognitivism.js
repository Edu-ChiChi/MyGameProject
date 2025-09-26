// js/cognitivism.js

// --------------------------------------------------
// 💡 인지주의 미션 로직 (Drag & Drop)
// --------------------------------------------------

const puzzlePiecesContainer = document.getElementById('puzzle-pieces-container');

// 미션 시작 시 호출 (game.js에서 호출됨)
function loadCognitivismMission() {
    puzzlePiecesContainer.innerHTML = ''; // 초기화
    gameState.correctCognitivismDrops = 0; // 초기화
    
    // 조각들을 무작위로 섞어 배치
    cognitivismPieces.sort(() => 0.5 - Math.random()).forEach(piece => {
        const div = document.createElement('div');
        div.className = 'puzzle-piece';
        div.draggable = true;
        div.textContent = piece.name;
        div.dataset.category = piece.category;
        div.addEventListener('dragstart', handleDragStart);
        puzzlePiecesContainer.appendChild(div);
    });
}

// Drag 시작
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.category);
    e.target.classList.add('dragging');
}

// Drag Over
function handleDragOver(e) {
    e.preventDefault(); 
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.add('drag-over');
    }
}

// Drag Leave
function handleDragLeave(e) {
    if (e.target.classList.contains('drop-zone')) {
        e.target.classList.remove('drag-over');
    }
}

// Drop
function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');

    const droppedCategory = e.dataTransfer.getData('text/plain');
    const targetZone = e.currentTarget;
    const targetCategory = targetZone.dataset.category;
    
    // 드롭된 요소 찾기
    const draggedElement = document.querySelector('.dragging');

    if (droppedCategory === targetCategory) {
        // 정답 처리
        if (draggedElement) {
            targetZone.appendChild(draggedElement);
            draggedElement.draggable = false;
            draggedElement.classList.remove('dragging');
            draggedElement.style.backgroundColor = '#4CAF50';
            
            gameState.correctCognitivismDrops++;
            
            // 미션 완료 확인
            if (gameState.correctCognitivismDrops === gameState.totalCognitivismPieces) {
                alert("🎉 모든 개념을 올바르게 연결했습니다! 기억의 방 탈출 성공! 이제 다른 전략을 체험하거나 단원 마무리 십자말풀이 활동을 할 수 있습니다.");
                showScreen('expert-selection-area'); 
            }
        }
    } else {
        // 오답 처리
        alert(`❌ ${draggedElement.textContent}은(는) ${targetCategory}의 핵심 개념이 아닙니다! 다시 시도해보세요.`);
        if (draggedElement) {
             draggedElement.classList.remove('dragging');
        }
    }
}