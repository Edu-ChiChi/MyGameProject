// js/data.js

// 🚀 게임 상태 및 코인 초기값
let gameState = {
    currentStrategy: null,
    tokens: 0, 
    correctCognitivismDrops: 0, 
    isBuffed: false, 
    totalCognitivismPieces: 12, // 총 조각 개수 유지
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
    // 행동주의 (4개)
    { id: 'p1', name: '자극', category: '행동주의' },
    { id: 'p2', name: '반응', category: '행동주의' },
    { id: 'p3', name: '처벌', category: '행동주의' },
    { id: 'p4', name: '토큰 경제', category: '행동주의' },
    
    // 인지주의 (4개)
    { id: 'p5', name: '인출', category: '인지주의' }, 
    { id: 'p6', name: '전이', category: '인지주의' }, 
    { id: 'p7', name: '부호화', category: '인지주의' },
    { id: 'p8', name: '초인지(메타인지)', category: '인지주의' },
    
    // 구성주의 (4개)
    { id: 'p9', name: '동화', category: '구성주의' },
    { id: 'p10', name: '학습자 중심 학습', category: '구성주의' },
    { id: 'p11', name: '비계', category: '구성주의' },
    { id: 'p12', name: '비구조화된 문제', category: '구성주의' },
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
                prompt: "두 이론의 핵심 단어만 생각해볼까? 행동주의는 행동에 대한 보상, 인지주의는 인출과 전이라고 생각해봐.",
                reaction: "아, 이제 알 것 같아! 행동주의는 외부에서 오는 보상으로 행동을 만드는 거고, 인지주의는 내가 머릿속으로 지식을 정리해서 배운 내용을 활용할 수 있다는 거구나! 정말 고마워!",
                reward: { badge: '최고 멘토 뱃지', points: 10 }
            },
            { 
                id: 2, 
                scaffolding: "중간 비계", 
                prompt: "행동주의는 강아지 훈련처럼 외적인 보상이 중요하고, 인지주의는 네가 지식을 정리하는 과정을 스스로 계획하고 점검하고 확인해 조절하여 통제하는 것이 중요해.",
                reaction: "아! 그럼 행동주의는 외부에서 오는 보상, 인지주의는 내가 스스로를 되돌아보며 점검, 확인, 조절하는 거라는 거지? 덕분에 이해했어!",
                reward: { badge: '유능한 멘토 뱃지', points: 7 }
            },
            { 
                id: 3, 
                scaffolding: "강한 비계", 
                prompt: "행동주의는 '자극과 반응'의 연결을 학습이라고 보는 거야. 인지주의는 '자가 질문법' 등을 활용해 배운 내용에 대해 스스로 점검하여 정답을 인출해 내고, 배운 지식을 문제해결에 활용할 수 있도록 하는거야.",
                reaction: "아, 이제 알았어! 행동주의는 자극과 반응이니까 보상이 있으면 더 의욕이 나는거고, 인지주의에서는 내가 스스로 학습한 내용을 묻고 답하면서 그 내용을 더 잘 익히고 더 나아가 이를 문제해결에 활용할 수 있다는 거구나!",
                reward: { badge: '도움의 손길 뱃지', points: 5 }
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
    { number: 1, type: 'across', word: "자극", clue: "행동주의에서 반응을 일으키는 외부의 신호예요.", start_row: 1, start_col: 2, feedback: "행동주의에서 반응을 일으키는 외부의 신호입니다." },
    { number: 2, type: 'across', word: "동기", clue: "학습 목표를 향해 움직이게 만드는 심리적 원동력이에요.", start_row: 2, start_col: 1, feedback: "학습 목표를 향해 움직이게 만드는 심리적 원동력입니다." },
    { number: 4, type: 'across', word: "초인지", clue: "‘생각에 대한 생각’을 하면서 전략을 조절하는 능력이에요.", start_row: 3, start_col: 6, feedback: "‘생각에 대한 생각’을 하며 전략을 조절하는 능력입니다." },
    { number: 7, type: 'across', word: "비구조화", clue: "해결 방법이 여러 가지라서 답이 명확하지 않은 문제예요.", start_row: 7, start_col: 3, feedback: "현실의 복잡한 문제들이 대부분 여기에 해당합니다. 해결 방법이 여러 가지이고 답이 명확하지 않은 문제입니다." },
    
    { number: 1, type: 'down', word: "자기효능감", clue: "자신이 과제를 성공할 수 있다고 믿는 마음이에요.", start_row: 1, start_col: 2, feedback: "스스로 잘할 수 있다는 자신감입니다." },
    { number: 3, type: 'down', word: "근접발달", clue: "비고츠키가 말한, 도움을 받으면 가능한 발달 영역이에요.", start_row: 2, start_col: 4, feedback: "혼자서는 안 되지만, 도움이 있으면 가능한 잠재력의 영역입니다." },
    { number: 5, type: 'down', word: "인출", clue: "저장된 기억을 다시 꺼내는 과정이에요.", start_row: 3, start_col: 7, feedback: "시험 볼 때 필요한 바로 그 능력! 머릿속 정보를 밖으로 끄집어내는 것입니다." },
    { number: 6, type: 'down', word: "부호화", clue: "정보를 장기 기억으로 바꾸어 저장하는 과정이에요.", start_row: 5, start_col: 6, feedback: "정보를 머릿속 파일로 만드는 과정입니다. 압축이나 요약도 되고 정보를 장기적으로 가져갈 수 있어요." },
    { number: 7, type: 'down', word: "비계", clue: "학습자가 과제를 해결하도록 제공하는 임시적 도움이에요.", start_row: 7, start_col: 3, feedback: "구성주의의 핵심 개념으로, 친구나 교사의 '임시적 도움'입니다." }
];

// --------------------------------------------------
// 🚀 5. 기타 공통 데이터
// --------------------------------------------------
const strategyMap = {
    'behaviorism': '행동주의',
    'cognitivism': '인지주의',
    'constructivism': '구성주의'
};