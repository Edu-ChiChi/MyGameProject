// js/constructivism.js

// --------------------------------------------------
// 💡 구성주의 미션 로직 (비계 제공)
// --------------------------------------------------

const menteeDialogue = document.getElementById('mentee-dialogue');
const scaffoldingChoices = document.getElementById('scaffolding-choices');
const mentorResultMessage = document.getElementById('mentor-result-message');
const menteeReactionText = document.getElementById('mentee-reaction-text');
const mentorBadge = document.getElementById('mentor-badge');
const mentorPoints = document.getElementById('mentor-points');
const completeMentorMissionButton = document.getElementById('complete-mentor-mission');

// 미션 시작 시 호출 (game.js에서 호출됨)
function loadConstructivismMission() {
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
        button.addEventListener('click', (e) => {
            const choiceId = parseInt(e.currentTarget.dataset.choiceId);
            handleScaffoldingChoice(choiceId);
        });
    });
}

// 비계 선택지 클릭 처리
function handleScaffoldingChoice(choiceId) {
    const scenario = constructivismScenarios[0];
    const choice = scenario.choices.find(c => c.id === choiceId);
    
    // 1. 선택지 숨기기
    scaffoldingChoices.style.display = 'none';

    // 2. 결과 표시
    menteeReactionText.textContent = choice.reaction;
    mentorBadge.textContent = choice.reward.badge;
    mentorPoints.textContent = choice.reward.points;
    mentorResultMessage.style.display = 'block';

    // 3. 상태 저장
    gameState.constructivismChoiceId = choiceId;

    // 4. 미션 완료 버튼 이벤트 연결
    completeMentorMissionButton.onclick = () => {
        alert(`🎉 구성주의 미션 완료! 지식 공유 멘토링을 통해 자신의 지식을 확고히 하는 방법을 깨달았습니다!`); 
        
        // 미션 완료 후 전문가 선택 화면으로 복귀
        showScreen('expert-selection-area');
    };
}