# npd-protocol — 신제품 개발 프로토콜 작성 도우미 (Claude Code 플러그인)

(주)컴퍼지트솔루션즈의 srPET 복합재와 EcoFlamix™ 난연재 신제품을 위한 개발 프로토콜을 작성하는 플러그인이다. 대화로 조건을 입력받고, 사내 백데이터와 산업별 규격에 근거해 아래 내용을 Markdown 문서로 만든 뒤 스스로 검토한다.

- 기술적 검토: 원천기술 강도, 목표 특성값
- 환경적 검토
- 제도적 검토
- 신뢰성 검증(DVP&R)
- 실험계획(DOE)

## 사용법

```
/new-protocol srPET 샌드위치 패널로 항공기 기내 사이드월 개발
/review-protocol protocols/2026-11-26_srPET_항공_사이드월_v1.md
```

슬래시 명령 없이 "○○ 개발 프로토콜 만들어줘"라고 해도 동작한다.

## 설치

### 개발자 (이 저장소에서 바로 시험)
```bash
claude --plugin-dir /path/to/protocol_chatbot
```

### 사내 사용자 (로컬 마켓플레이스로 설치)
```
/plugin marketplace add /path/to/protocol_chatbot
/plugin install npd-protocol@comp-sol-local
```

### 작업 폴더 준비
연구원은 아래 구조로 작업 폴더를 만들고, 그 폴더에서 Claude Code를 실행한다. 이 저장소 자체도 작업 폴더로 쓸 수 있다.
```
내작업폴더/
├─ data/documents/    # 성적서·논문·특허·고객 규격 (data/README.md 참조)
├─ data/properties/   # 물성 Excel/CSV
└─ protocols/         # 생성된 프로토콜이 저장됨
```

## 구성

```
.claude-plugin/        plugin.json, marketplace.json
commands/              /new-protocol, /review-protocol
skills/
  protocol-builder/    ★ 메인: 인터뷰 → 근거 수집 → 템플릿 작성 → 저장
  protocol-reviewer/   ★ 자체 검토 체크리스트 (완결성·근거·DVP·규격·DOE)
  dvp-test-plan/       DVP&R 작성 방법 — RBraga01/Quality-Engineering-Skills (MIT)
  dfmea-design/        DFMEA — 같은 저장소 (MIT)
  action-priority-ap/  AP 판정 — 같은 저장소 (MIT)
  pfmea-process/       PFMEA·AP 표 — 같은 저장소 (MIT)
  materials-doe/       실험계획 — cooleava1-gif/Materials-Science-Skills (MIT, 진입 파일 재작성)
knowledge/
  company/             회사 프로필
  products/            srPET, EcoFlamix 제품군 프로필 (기술 이슈 → 시험 매핑)
  standards/           산업별 규격 팩 YAML (자동차·항공·해양·건축·난연·친환경 규제)
data/                  백데이터 (git 제외)
protocols/             생성 결과 (git 제외)
web/                   신제품별 프로토콜 대시보드 웹앱 (Next.js)
```

외부 스킬의 출처와 변경 내역은 [THIRD_PARTY.md](THIRD_PARTY.md)에 있다.

## 대시보드 웹 (신제품별 프로토콜 보기)

`web/`은 신제품별 프로토콜을 탭으로 보는 웹앱이다(Next.js). 탭은 프로토콜 프로세스 순서를 따른다.
- 요약: 개발 계획 보고서(`*_report.md` — 결론, 고객 요구 대비 판단, 검증 일정, 고객 요청 사항, 인쇄·PDF 저장) / 진행 현황(프로세스 진행, 핵심 수치, 근거 구성, 버전별 자체 검토, 다음 할 일)
- ① 개발 조건: 개요·전제
- ② 검토: 기술적 / 환경적 / 제도적
- ③ 검증 계획: 신뢰성(DVP&R) / 실험계획(DOE)
- ④ 근거·관리: 백데이터 근거 / 리스크·미결 / 자체 검토 / 변경 이력

```bash
cd web
npm install      # 처음 한 번
npm run dev      # http://localhost:3210
```

`protocols/*.md`, `*_review.md`, `*_report.md`를 요청마다 직접 읽으므로, 새 프로토콜을 저장하면 새로고침만 하면 된다. 다른 폴더를 보려면 `PROTOCOLS_DIR=/경로 npm run dev`.

## ⚠ 사용 전 확인

1. **규격 팩은 초안이다.** `knowledge/standards/*.yaml`의 모든 항목은 `status: draft-unverified` 상태다. 사내 담당자가 최신판과 판정 기준을 확인한 뒤 `verified`로 바꿔야 한다. 그 전에는 프로토콜에 "(규격 팩 미검증)"이 표시된다.
2. **회사·제품 프로필은 웹사이트 기준이다.** `knowledge/company`와 `knowledge/products`를 사내 정보로 갱신해야 한다.
3. **보안**: `data/`의 문서 내용은 Claude API로 전송된다. 미공개 특허나 고객 규격을 넣기 전에 사내 정책을 확인한다.
4. **국내 법령 연동(권장)**: 국내 법령과 고시의 현행 조문은 **korean-law 커넥터**로 조회한다. 이 커넥터는 플러그인에 포함되어 있지 않다. **사용자마다 자기 Claude 계정에 연결해야 한다**(claude.ai → 설정 → 커넥터 → korean-law).
   - 연결되어 있으면: 법률·시행규칙 조문(`get_law_text`)과 고시·행정규칙의 본문·별표(`get_admin_rule`)를 조회해 `[L:...]` 출처로 인용한다. 예: 자동차규칙 제95조, 신규제작자동차 실내공기질 관리기준 별표 1.
   - 연결되어 있지 않으면: 프로토콜은 그대로 작성되지만 법령 항목에 모두 `⚠ 현행 여부 확인 필요`가 붙고, 미결 사항으로 넘어간다.
   - 확인 방법: Claude Code에서 `/mcp`를 실행해 목록에 korean-law가 있는지 본다.
