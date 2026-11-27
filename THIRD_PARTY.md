# 외부 오픈소스 구성요소

이 플러그인은 아래 MIT 라이선스 스킬을 포함한다. 원 저작권 표시와 라이선스 전문은 각 폴더의 LICENSE 파일에 있다.

| 폴더 | 원본 | 버전 / 커밋 | 라이선스 | 변경 사항 |
|---|---|---|---|---|
| `skills/dvp-test-plan/` | [RBraga01/Quality-Engineering-Skills](https://github.com/RBraga01/Quality-Engineering-Skills) `skills/planning/dvp-test-plan` | v1.1 / `50a7ff8` | MIT ([LICENSE](skills/LICENSE-Quality-Engineering-Skills)) | 한국어로 번역 (내용·구조는 원본과 같음) |
| `skills/dfmea-design/` | 같은 저장소 `skills/risk-analysis/dfmea-design` | v1.1 / `50a7ff8` | MIT | 한국어로 번역 |
| `skills/action-priority-ap/` | 같은 저장소 `skills/risk-analysis/action-priority-ap` | `50a7ff8` | MIT | 한국어로 번역 |
| `skills/pfmea-process/` | 같은 저장소 `skills/risk-analysis/pfmea-process` | `50a7ff8` | MIT | 한국어로 번역 (action-priority-ap가 참조하는 AP 표 때문에 포함) |
| `skills/materials-doe/` | [cooleava1-gif/Materials-Science-Skills](https://github.com/cooleava1-gif/Materials-Science-Skills) `plugins/materials-skills/skills/materials-doe` | v1.1.0 / `602077d` | MIT ([LICENSE](skills/materials-doe/LICENSE)) | SKILL.md를 새로 작성(원본의 manifest 라우팅과 공유 프로필 의존 제거, 한국어화). `static/core` 7개, `static/reference` 2개(고분자·요인표)는 한국어로 번역해 포함. `scripts` 4개, CSV 템플릿 1개는 원본 그대로 포함. 콘크리트·아스팔트 배합 설계 등 무관한 항목은 제외 |

알려진 제한: `pfmea-process`에는 원본 저장소의 `problem-solving/5why-root-cause` 스킬로 가는 링크가 2개 있다. 그 스킬은 포함하지 않았으므로 두 링크는 동작하지 않는다. 프로토콜 작성에는 영향이 없다.

## 업데이트 방법
원본 저장소의 새 버전을 반영할 때는 원본과 이전 커밋의 차이(diff)를 확인해 바뀐 부분만 번역해 넣고, 위 표의 커밋을 갱신한다. 폴더를 그대로 덮어쓰면 번역이 사라진다. `materials-doe/SKILL.md`는 이 플러그인에서 새로 쓴 파일이므로 덮어쓰지 않는다.

## 규격 관련
Quality-Engineering-Skills는 AIAG·VDA·IATF 규격 원문을 포함하지 않고 방법만 설명한다(원본 THIRD_PARTY_CONTENT.md 참조). 이 플러그인의 `knowledge/standards/`도 같은 원칙을 따른다. 규격 번호, 제목, 일반 기준만 담고 원문은 담지 않는다.
