// js/cognitivism.js

// --------------------------------------------------
// 💡 인지주의 미션 로직 (Drag & Drop)
// --------------------------------------------------

const puzzlePiecesContainer = document.getElementById('puzzle-pieces-container');
const dropZones = document.querySelectorAll('.drop-zone');

// 미션 시작 시 호출 (game.js에서 호출됨)
function loadCognitivismMission() {
    puzzlePiecesContainer.innerHTML = ''; // 초기화
    gameState.correctCognitivismDrops = 0; // 초기화
    
    // 드래그 앤 드롭 이벤트 리스너 할당 (단, 한 번만)
    dropZones.forEach(zone => {
        zone.removeEventListener('dragover', handleDragOver);
        zone.removeEventListener('dragleave', handleDragLeave);
        zone.removeEventListener('drop', handleDrop);
        
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
        zone.innerHTML = `<h4>${zone.dataset.category}</h4>`; // 초기화된 상태로 문구만 남김
    });
    
    // 조각들을 무작위로 섞어 배치
    cognitivismPieces.sort(() => 0.5 - Math.random()).forEach(piece => {
        const div = document.createElement('div');
        div.className = 'puzzle-piece';
        div.draggable = true;
        div.textContent = piece.name;
        div.dataset.category = piece.category;
        div.dataset.pieceId = piece.id;
        div.addEventListener('dragstart', handleDragStart);
        puzzlePiecesContainer.appendChild(div);
    });
}

// Drag 시작
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.category);
    e.dataTransfer.setData('text/pieceId', e.target.dataset.pieceId);
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
    // 드롭존 내부 요소에서 나갔을 때도 drag-over 클래스를 제거하지 않도록 currentTarget 사용
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
    
    const draggedElement = document.querySelector(`.puzzle-piece[data-piece-id="${pieceId}"]`);

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
                alert("🎉 모든 개념을 올바르게 연결했습니다! 기억의 방 탈출 성공!");
                showScreen('resolution-area', 'cognitivism'); // 완료 후 해결창으로 이동
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