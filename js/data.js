// js/data.js

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    currentStrategy: null,
    tokens: 0, 
    correctCognitivismDrops: 0, 
    isBuffed: false, 
    totalCognitivismPieces: 9, // 총 조각 개수 유지
    isCrosswordCompleted: false, // 십자말풀이 완료 상태 추적
    isCrosswordModalOpen: false, // 십자말풀이 모달 열림 상태 추적 
    crosswordGridState: [], // 십자말풀이 격자 상태 저장
};

// --------------------------------------------------
// 🚀 1. 행동주의 미션 데이터
// --------------------------------------------------
const behaviorismTasks = [
    // 강화 작업 (좋은 습관, +1)
    { id: 1, title: "단어 10개 외우기", type: 'reinforcement', correct: true, value: 1, action: "선택" },
    { id: 2, title: "수학 문제 3개 풀기", type: 'reinforcement', correct: true, value: 1, action: "선택" },
    { id: 3, title: "교과서 10분 읽기", type: 'reinforcement', correct: true, value: 1, action: "선택" },
    
    // 처벌 작업 (나쁜 습관, -1)
    { id: 101, title: "공부 중 SNS 알림 확인", type: 'punishment', correct: false, value: -1, action: "선택" },
    { id: 102, title: "숙제를 미루고 게임하기", type: 'punishment', correct: false, value: -1, action: "선택" },
];
let currentTasks = []; 

// --------------------------------------------------
// 🚀 2. 인지주의 미션 데이터 (업데이트 완료)
// --------------------------------------------------
const cognitivismPieces = [
    // 행동주의 (3개)
    { id: 'p1', name: '자극', category: '행동주의' },
    { id: 'p2', name: '처벌', category: '행동주의' },
    { id: 'p3', name: '토큰 경제', category: '행동주의' },
    
    // 인지주의 (3개)
    { id: 'p4', name: '인출', category: '인지주의' }, 
    { id: 'p5', name: '전이', category: '인지주의' }, 
    { id: 'p6', name: '초인지(메타인지)', category: '인지주의' },
    
    // 구성주의 (3개)
    { id: 'p7', name: '비계', category: '구성주의' },
    { id: 'p8', name: '학습자 중심 학습', category: '구성주의' },
    { id: 'p9', name: '비구조화된 문제', category: '구성주의' },
];

// --------------------------------------------------
// 🚀 3. 구성주의 미션 데이터
// --------------------------------------------------
const constructivismScenarios = [
    {
        id: 1,
        text: "안녕! 나는 '학습의 원리와 방법' 단원 공부 중인데, 행동주의랑 인지주의가 너무 헷갈려. 개념은 외웠는데 서로 어떻게 다른 건지 모르겠어. 좀 도와줄 수 있을까?",
        choices: [
            { 
                id: 1, 
                scaffolding: "약한 비계", 
                prompt: "두 이론의 핵심 기능과 목표만 생각해볼까? 행동주의는 행동에 대한 변화, 인지주의는 사고의 변화라고 생각해봐.",
                reaction: "아, 이제 알 것 같아! 행동주의는 외부에서 오는 보상으로 습관을 만드는 거고, 인지주의는 내가 지식을 정리해서 활용할 수 있다는 거구나! 스스로 깨닫게 해줘서 정말 고마워!",
                reward: { badge: '최고 멘토 뱃지 : 자기주도성 촉진', points: 10 }
            },
            { 
                id: 2, 
                scaffolding: "중간 비계", 
                prompt: "행동주의는 강아지 훈련처럼 외적인 보상으로 행동을 유발하고, 인지주의는 자가질문법 등을 통해서 네가 지식을 정리하는 과정을 스스로 점검하고 조절하는 것이 중요해.",
                reaction: "아! 그럼 행동주의는 외부에서 오는 보상, 인지주의는 내가 스스로를 되돌아보며 점검, 확인, 조절하는 거라는 거지? 덕분에 이해했어!",
                reward: { badge: '유능한 멘토 뱃지 : 적정 수준의 개입', points: 7 }
            },
            { 
                id: 3, 
                scaffolding: "강한 비계", 
                prompt: "행동주의는 '자극과 반응'의 연결을 학습이라고 보는 거야. 인지주의는 '초인지(메타인지)'랑 '자가질문법' 등을 활용해 배운 내용에 대해 정답을 인출하고 문제해결에 활용하는거야.",
                reaction: "아, 이제 알았어! 행동주의는 보상에 대한 의욕인 거고, 인지주의에서는 내 머릿 속 정보를 꺼내 활용하는 데 있구나! 직접적으로 알려줘서 고마원~",
                reward: { badge: '도움의 손길 뱃지 : 문제에 대한 직접적이며 즉시 해결', points: 5 }
            }
        ]
    }
];

// --------------------------------------------------
// 🚀 4. 십자말풀이 미션 데이터 (단원 마무리) - 최종 힌트 반영 버전
// --------------------------------------------------
const GRID_SIZE = 8;
const crosswordData = [
    // word: 정답 단어 (띄어쓰기 없음, 대문자 사용)
    // start_row/col: 퍼즐판에서 시작 위치 (0부터 시작)
    // direction: 'across' (가로) 또는 'down' (세로)
    { number: 1, type: 'across', word: "자극", clue: "행동주의자들은 학습을 이것에 대한 반응으로서 변화하는 행동으로 규정한다.", start_row: 0, start_col: 2, feedback: "행동주의에서 반응을 일으키는 외부의 신호입니다." },
    { number: 2, type: 'across', word: "동기", clue: "학습에 대한 흥미와 관심을 일으키고 학습 목표를 향해 나아갈 수 있도록 행동을 유발하고 지속시키는 마음을 가르킨다.", start_row: 1, start_col: 1, feedback: "학습 목표를 향해 움직이게 만드는 심리적 원동력입니다." },
    { number: 4, type: 'across', word: "초인지", clue: "자신의 인지 과정에 대하여 한 차원 높은 시각에서 관찰, 발견, 통제하는 정신 작용을 말한다. ", start_row: 2, start_col: 6, feedback: "‘생각에 대한 생각’을 하며 전략을 조절하는 능력입니다." },
    { number: 7, type: 'across', word: "비구조화", clue: "목표가 모호하고 문제를 해결하는 방법이 명확하지 않은 문제를 이러한 문제라고 한다.", start_row: 6, start_col: 3, feedback: "현실의 복잡한 문제들이 대부분 여기에 해당합니다. 해결 방법이 여러 가지이고 답이 명확하지 않은 문제입니다." },
    
    { number: 1, type: 'down', word: "자기효능감", clue: "과제나 학습 활동을 수행할 때, 자신이 적절한 행동을 함으로써 문제를 해결할 수 있다고 생각하는 스스로에 대한 믿음, 자신의 능력에 대한 믿음을 말한다.", start_row: 0, start_col: 2, feedback: "스스로 잘할 수 있다는 자신감입니다." },
    { number: 3, type: 'down', word: "근접발달", clue: "비고츠키가 도입한 것으로, 아동이 스스로 해결하거나 성취할 수 있는 능력과 자신보다 인지 수준이 높은 또래나 성인의 도움을 받아 과제를 해결하거나 성취할 수 있을 것으로 기대되는 능력 간의 차이를 나타내는 영역을 이러한 영역이라고 한다. ", start_row: 1, start_col: 4, feedback: "혼자서는 안 되지만, 도움이 있으면 가능한 잠재력의 영역입니다." },
    { number: 5, type: 'down', word: "인출", clue: "자기 기억에서 정보를 탐색하여 꺼내는 과정이나 행위를 말한다.", start_row: 2, start_col: 7, feedback: "시험 볼 때 필요한 바로 그 능력! 머릿속 정보를 밖으로 끄집어내는 것입니다." },
    { number: 6, type: 'down', word: "부호화", clue: "외부에서 들어온 정보를 작업 기억에서 장기 기억으로 저장할 수 있도록 변환하는 과정이다.", start_row: 4, start_col: 6, feedback: "정보를 머릿속 파일로 만드는 과정입니다. 압축이나 요약도 되고 정보를 장기적으로 가져갈 수 있어요." },
    { number: 7, type: 'down', word: "비계", clue: "학습자의 실제 발달 수준보다는 높지만 타인의 도움을 받으면 해결할 수 있는 수준의 과제를 수행할 때 제공되는 도움을 이것이라고 한다.", start_row: 6, start_col: 3, feedback: "구성주의의 핵심 개념으로, 친구나 교사의 '임시적 도움'입니다." }
];

// --------------------------------------------------
// 🚀 5. 기타 공통 데이터
// --------------------------------------------------
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};

// --------------------------------------------------
// js/data.js 파일에서 다음 두 줄을 주석 처리하고 GAS URL로 대체
// const SHEET_API_KEY = "AIzaSyC9KDZwUzc9F2-YdXE1LLa36F1q8nqyGoA"; 
// const SHEET_ID = "1svZLw2Rp9lq54JlfGT77ehpZLzXw-ulIn7TM4Mo6Dpc";     

const GAS_WEB_APP_URL = "https://script.google.com/macros/library/d/1fc-ZN_PCt2lnmZHXFwkJ3xkCJ7lwkZF2MXqps46-t7P2R07mNSxLNgV6/2";