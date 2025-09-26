// js/constructivism.js

// --------------------------------------------------
// 💡 구성주의 미션 로직 (비계 제공)
// --------------------------------------------------

// 미션 시작 시 호출 (game.js에서 호출됨)
window.loadConstructivismMission = function() {
    const menteeDialogue = document.getElementById('mentee-dialogue');
    const scaffoldingChoices = document.getElementById('scaffolding-choices');
    const mentorResultMessage = document.getElementById('mentor-result-message');
    const completeMentorMissionButton = document.getElementById('complete-mentor-mission');
    
    // data.js의 constructivismScenarios 사용
    const scenario = constructivismScenarios[0]; 
    
    // 1. 초기 대화 설정
    menteeDialogue.textContent = scenario.text;
    mentorResultMessage.style.display = 'none';
    scaffoldingChoices.style.display = 'flex';
    
    // 2. 선택지 버튼 생성
    scaffoldingChoices.innerHTML = scenario.choices.map(choice => `
        <button class="action-button" data-choice-id="${choice.id}">${choice.scaffolding}: ${choice.prompt}</button>
    `).join('');
    
    // 3. 이벤트 리스너 재할당 (버튼에 이벤트 연결)
    document.querySelectorAll('#scaffolding-choices button').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', (e) => {
            const choiceId = parseInt(e.currentTarget.dataset.choiceId);
            handleScaffoldingChoice(choiceId);
        });
    });

    // 완료 버튼 연결
    if (completeMentorMissionButton) {
        completeMentorMissionButton.removeEventListener('click', handleMissionCompletion);
        completeMentorMissionButton.addEventListener('click', handleMissionCompletion);
    }
}

// 비계 선택지 클릭 처리
function handleScaffoldingChoice(choiceId) {
    const scenario = constructivismScenarios[0];
    const choice = scenario.choices.find(c => c.id === choiceId);
    
    // 1. 선택지 숨기기
    const scaffoldingChoices = document.getElementById('scaffolding-choices');
    scaffoldingChoices.style.display = 'none';

    // 2. 결과 표시
    const mentorResultMessage = document.getElementById('mentor-result-message');
    const menteeReactionText = document.getElementById('mentee-reaction-text');
    const mentorBadge = document.getElementById('mentor-badge');
    const mentorPoints = document.getElementById('mentor-points');

    menteeReactionText.textContent = choice.reaction;
    mentorBadge.textContent = choice.reward.badge;
    mentorPoints.textContent = choice.reward.points; // 포인트를 표시하지만 실제 게임 로직은 미구현
    mentorResultMessage.style.display = 'block';

    // 3. 상태 저장 (game.js의 resolution-area에서 사용)
    gameState.constructivismChoiceId = choiceId;
}

// 미션 완료 처리 (결과 창으로 이동)
function handleMissionCompletion() {
    if (window.showScreen) {
        alert("친구의 고민을 성공적으로 해결하고 멘토 뱃지를 획득했습니다!");
        window.showScreen('resolution-area', 'constructivism');
    }
}