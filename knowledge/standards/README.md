# 규격 팩

산업별 적용 후보 규격 목록이다. **규격 원문은 넣지 않는다**(저작권). 번호, 제목, 용도, 일반적 판정 기준, 비고만 적는다.

## 상태값
- `draft-unverified`: LLM 일반지식으로 만든 초안. 사내 담당자가 최신판과 적용성을 확인하기 전까지 프로토콜에 `(규격 팩 미검증)`으로 표시된다.
- `verified`: 사내에서 확인함. `verified_by`와 `verified_date`를 함께 적는다.

## 항목 스키마
```yaml
- id: ASTM-D3039            # 고유 ID (프로토콜 출처 태그 [S:ID])
  title: ...                # 규격 제목
  scope: ...                # 무엇을 시험·규정하는가
  use_when: ...             # 이 회사 제품에서 언제 쓰는가
  typical_criteria: ...     # 일반적 판정 기준 (고객/법규에 따라 다름)
  notes: ...
  status: draft-unverified
```

## 파일
| 파일 | 내용 |
|---|---|
| common-mechanical.yaml | 복합재·샌드위치·폼 기계물성, 열특성 |
| common-environmental.yaml | 노화, 내후, 고온고습, 열사이클 |
| automotive.yaml | 자동차 내장재 |
| aerospace.yaml | 항공기 객실 내장재 |
| marine.yaml | 선박 |
| building.yaml | 건축 마감재·단열재 |
| flame-general.yaml | 일반 난연, 필터·섬유, 연기·가스 |
| eco-regulation.yaml | 화학물질 규제, 친환경 인증 |
