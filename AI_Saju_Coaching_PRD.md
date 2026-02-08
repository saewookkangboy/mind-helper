# **\[PRD & Tech Spec\] AI 퍼스널 사주 코칭 서비스: "Fortune Mate" (v1.7)**

## **1\. 프로젝트 개요 (Executive Summary)**

### **1.1 서비스 정의**

사용자의 사주 명리학 정보(생년월일시)와 개인의 페르소나(MBTI, 취향, 현재 고민)를 결합하여, 생성형 AI가 \*\*"나만의 영적 라이프 코치"\*\*가 되어주는 모바일 웹/앱 서비스입니다. 단순한 운세 풀이를 넘어, \*\*매일의 행동 지침(Action Plan)\*\*과 **심리적 위로**를 게임처럼 제공합니다.

### **1.2 핵심 가치 (Value Proposition)**

1. **Hyper-Casual Saju:** 어려운 한자나 용어 대신, 현대적 언어와 캐릭터로 풀어낸 사주.  
2. **Daily Gamification:** 운세를 확인하는 행위를 '퀘스트'와 '보상'으로 연결하여 재방문 유도.  
3. **Global Scalability:** K-Culture(사주, MBTI)에 관심 있는 글로벌 유저를 위한 **다국어(KR, EN, JP) 지원**.  
4. **Trend-Savvy AI:** 최신 밈(Meme)과 유행어를 학습하여 친구처럼 대화하는 **위트 있는 AI**.  
5. **Seamless Cross-Platform:** **웹(PC/Tablet)과 모바일** 어디서든 끊김 없는 유기적인 사용자 경험 제공.

## **2\. 상세 기획 (PRD)**

### **2.1 타겟 유저 (Persona)**

* **메인 타겟:** 2030 MZ세대 (여성 비중 60% 예상)  
* **글로벌 타겟:** K-Drama나 K-Pop을 통해 한국식 운세(Saju)에 호기심을 가진 해외 팬덤 (영어권, 일본).

### **2.2 핵심 기능 (Key Features)**

#### **A. 글로벌 네비게이션 & 인증 (Global Nav & Auth)**

* **전역 언어 스위처:** 앱의 모든 화면 우측 상단에 고정된 언어 변경 버튼(KO | EN | JA).  
* **소셜 로그인 (Social Auth):**  
  * **구글, 애플 로그인 지원** (글로벌 표준 및 보안성 고려).  
  * 비회원(Guest) 체험 모드 지원 후, 결과 저장 시 회원가입 유도.

#### **B. 온보딩 & 대시보드 (Liquid Glass Design)**

* **Liquid Flow:** 배경의 유체 그래픽이 사용자 터치에 반응.  
* **Glass Cards:** 투명한 유리 질감의 UI 컴포넌트.  
* **음성 입력 옵션 (Voice Input) \[New\]:**  
  * **멀티모달 입력:** 키보드 타이핑이 귀찮거나 어려운 상황에서 마이크 아이콘을 터치하여 생년월일, 고민 등을 말로 입력.  
  * **자연어 처리:** "1995년 8월 15일 오후 2시에 태어났어"라고 말하면 자동으로 날짜/시간 포맷으로 변환되어 입력됨.

#### **C. AI 심층 코칭 (Deep Coaching)**

* **진로/취업/연애:** AI가 페르소나에 빙의하여 대화형 상담 진행.  
* **보이스 챗 (Voice Chat):** 텍스트 채팅뿐만 아니라 음성으로 질문하고 AI의 답변을 음성(TTS)으로 듣는 기능 옵션 제공.

#### **D. 관리자 대시보드 (Admin Dashboard)**

* **컨셉:** "Control Tower". 복잡한 표 대신 **데이터 시각화(Chart)** 위주의 미니멀 디자인.  
* **주요 기능:** 실시간 트래픽, AI 응답 만족도, 인기 사주 키워드 모니터링, 트렌드 단어 관리.

## **3\. UI/UX 디자인 가이드**

### **3.1 디자인 컨셉: "Liquid Glass" (유리 & 유체)**

* **키워드:** Translucent(반투명), Fluid(유동적인), Iridescent(무지개 빛), Depth(깊이감).  
* **핵심 요소:** 오로라 그라디언트 애니메이션, 프로스트 글래스(Frosted Glass) 효과.

### **3.3 관리자 페이지 디자인 (Admin UI)**

* **테마:** 앱과 동일한 Dark Mode 기반이지만, 가독성을 위해 명도 대비를 높임.  
* **레이아웃:**  
  * **LNB (Left Nav Bar):** 아이콘 위주의 슬림한 메뉴 (대시보드, 유저, 데이터, 설정).  
  * **Main:** 카드형 위젯으로 구성된 그리드 레이아웃.  
* **시각화:** Tremor 또는 Recharts 스타일의 심플한 라인/도넛 차트 사용.

### **3.4 반응형 및 멀티 플랫폼 전략 (Responsive & Cross-Platform)**

**"One Code, Multi View"** 전략을 통해 디바이스 크기에 따라 레이아웃이 유기적으로 변형됨.

1. **레이아웃 적응성 (Adaptive Layout):**  
   * **Mobile (\< 768px):** 싱글 컬럼(Single Column) 스택 구조. 네비게이션은 하단 탭 바(Bottom Tab Bar) 또는 햄버거 메뉴 사용.  
   * **Tablet/Desktop (\>= 768px):** 멀티 컬럼(Multi-Column) 그리드 구조.  
     * 좌측: 프로필 및 네비게이션 고정 (LNB).  
     * 중앙: 메인 대시보드 및 콘텐츠 카드.  
     * 우측: 실시간 AI 채팅창 또는 보조 위젯 (달력, 랭킹 등) 고정 노출.  
2. **인터랙션 최적화:**  
   * **Touch (Mobile):** 스와이프 제스처, 큰 터치 타겟, 하단 중심 조작부 배치.  
   * **Mouse/Trackpad (Web):** 호버(Hover) 효과 강화 (Glass Card 빛 반사 등), 단축키 지원, 스크롤 최적화.  
3. **PWA (Progressive Web App):**  
   * 모바일 웹에서 "홈 화면에 추가" 시 네이티브 앱처럼 전체 화면 실행.  
   * 데스크탑에서도 설치형 앱으로 구동 가능하도록 manifest.json 설정.

## **4\. 기술 명세서 (Technical Specification)**

### **4.1 시스템 아키텍처**

| 구분 | 기술 스택 (Tech Stack) | 설명 |
| :---- | :---- | :---- |
| **Frontend** | React, Tailwind CSS | **Mobile-First 반응형 디자인**. PWA 지원. |
| **Admin** | React, **Tremor (Chart Lib)** | 관리자용 웹 대시보드 (Desktop 최적화). |
| **Auth** | **Firebase Auth / NextAuth** | 소셜 로그인 및 세션 관리. |
| **Backend** | Node.js / Python | 만세력 계산 및 다국어 응답 처리. |
| **AI Core** | Gemini Pro / GPT-4o | 프롬프트 내 Output Language 파라미터를 통해 다국어 답변 생성. |
| **Voice/Audio** | **Web Speech API / OpenAI Whisper** | **\[New\]** STT(음성 인식) 및 TTS(음성 합성) 지원. |
| **Database** | **Firestore (NoSQL)** | 유저 데이터, 로그, 트렌드 데이터 저장. |

### **4.2 데이터베이스 모델링 (DB Schema)**

* **users (Collection)**: 회원 정보  
  * uid (PK): Firebase Auth UID  
  * email: 이메일  
  * provider: "google" | "apple"  
  * role: "user" | "admin"  
  * birth\_info: { date, time, calendar\_type }  
  * preferences: { language, mbti, interests, **voice\_input\_enabled** }  
  * stats: { level, exp, attendance\_streak }  
  * created\_at: timestamp  
* **saju\_logs (Collection)**: AI 상담 로그 (자가 발전 학습용)  
  * log\_id (PK)  
  * user\_id (FK)  
  * query\_type: "love" | "career" | "today"  
  * input\_type: **"text" | "voice"**  
  * ai\_response: AI 답변 내용  
  * user\_feedback: "positive" | "negative" | null  
  * timestamp  
* **trends (Collection)**: 크롤링된 유행어 데이터  
  * keyword: "원영적 사고"  
  * category: "meme" | "slang"  
  * usage\_count: AI가 답변에 사용한 횟수  
  * is\_active: true/false (관리자 승인 여부)

### **4.6 관리자 대시보드 기능 명세 (Admin Features)**

관리자가 한눈에 서비스 현황을 파악하고 AI 품질을 관리하는 기능.

1. **Dashboard Home (Minimal View):**  
   * **Live Metrics:** 현재 접속자 수, 금일 가입자(DAU), 실시간 AI 요청 수.  
   * **Satisfaction Index:** saju\_logs의 user\_feedback을 기반으로 한 긍정/부정 비율 도넛 차트.  
   * **Top Keywords:** 사용자들이 가장 많이 물어보는 질문 키워드 (예: "이직", "재회", "면접").  
2. **Trend Manager (트렌드 관리):**  
   * 크롤러가 수집한 신조어 리스트 검수 (Approve/Reject).  
   * 강제 주입 키워드 설정 (예: 특정 기념일 관련 단어).  
3. **User Insights:**  
   * 국가별 유저 비율 (KR/EN/JP) 지도 시각화.  
   * MBTI 유형별 서비스 체류 시간 분석.

## **5\. 자가 발전 및 트렌드 반영 (AI Logic)**

### **5.1 자가 발전형 사주 DB (Self-Evolving Saju Algorithm)**

1. **Feedback Loop:** 사용자 피드백(saju\_logs) 수집.  
2. **Pattern Reinforcement:** 적중률 높은 해석 가중치 부여.  
3. **Dynamic Prompt Tuning:** 고품질 로그를 Few-shot 예제로 활용.

### **5.2 트렌드 기반 동적 어휘 주입 (Trend Injection)**

1. **Trend Crawler:** SNS/커뮤니티 버즈워드 수집 및 trends 컬렉션 저장.  
2. **Context Injection:** AI 프롬프트에 활성 트렌드 키워드 주입하여 위트 있는 답변 생성.

## **6\. 글로벌 서비스 전략**

* **현지화:** 단순 번역 지양, 문화적 비유 사용.  
* **날짜 표기:** 국가별 포맷 자동 변환.

## **7\. 개발 로드맵 (Milestone Update)**

1. **Phase 1 (MVP):** 한국어 서비스, 소셜 로그인(구글/애플), 기본 사주 로직, **반응형 웹 UI 구현**.  
2. **Phase 1.5 (Global & Admin):** 다국어 지원, **음성 입력(STT) 도입**, 관리자 대시보드(Beta), 데이터 로깅 시작.  
3. **Phase 2.0 (Intelligence):** 자가 발전 알고리즘, 트렌드 크롤러, 관리자 대시보드 고도화, PWA 고도화.