# Fortune Mate Backend

백엔드 API 서버 및 크롤러

## 기능

- 트렌드 크롤러 (SNS/커뮤니티 버즈워드 수집)
- 자가 발전 알고리즘 (피드백 기반 학습)
- REST API 엔드포인트

## 설치

```bash
npm install
```

### 만세력/사주 계산 (선택)

사주 API(`POST /api/v1/saju`)는 KARI 음력 데이터 기반 만세력을 사용합니다. Python 가상환경과 패키지가 필요합니다.

```bash
python3 -m venv venv
./venv/bin/pip install /path/to/korean_lunar_calendar-0.3.1.tar.gz
# 또는: ./venv/bin/pip install -r requirements.txt  # PyPI에 동일 버전이 있는 경우
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

```bash
cp .env.example .env
```

## 실행

### 개발 모드
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

### 크롤러만 실행
```bash
npm run crawler
```

## API 엔드포인트

- `GET /health` - 헬스 체크
- `POST /api/v1/saju` - 만세력 기반 사주 계산 (모든 산출 **KST 기준**)
  - body: `{ birthDate: "YYYY-MM-DD", birthTime: "HH:MM", timezone?: "Asia/Seoul"|"UTC"|... }`
  - `timezone` 미지정 시 입력 일시를 KST(Asia/Seoul)로 해석. 지정 시 해당 타임존으로 해석 후 KST로 변환해 연·월·일·시주 산출.
  - 00:00~00:59 KST는 만자시(晚子時)로 전일 일주 + 자시로 처리.
- `POST /api/crawler/run` - 트렌드 크롤러 수동 실행
- `POST /api/self-evolution/run` - 자가 발전 알고리즘 수동 실행

## 스케줄링

- 트렌드 크롤러: 매 시간마다 자동 실행
- 자가 발전 알고리즘: 매일 자정에 자동 실행
