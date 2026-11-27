---
name: materials-doe
description: 신제품 목표 특성값을 확보하기 위한 실험계획(DOE)을 설계하거나 검토할 때 사용. srPET 성형 공정 변수(온도·압력·시간·적층 수), EcoFlamix 배합·도포량 등 요인/수준을 정해 완전요인, 다구치 직교배열, 스크리닝(Plackett-Burman, 부분요인), 반응표면(CCD, Box-Behnken) 행렬을 만든다. protocol-builder의 "5. 실험계획" 섹션에서 호출된다. Triggers: 실험계획, DOE, 직교배열, 다구치, 반응표면, 요인 스크리닝, 공정 최적화.
---

# 소재 실험계획(DOE)

> 원본: [cooleava1-gif/Materials-Science-Skills](https://github.com/cooleava1-gif/Materials-Science-Skills) `materials-doe` v1.1.0 (MIT, commit 602077d).
> 이 플러그인에 맞게 진입 파일(SKILL.md)만 새로 썼다. `static/`과 `scripts/`는 원본 그대로이다. 원본의 manifest 라우팅, 공유 프로필, 다른 materials-* 스킬로 넘기는 기능은 제외했다.

요인, 수준, 제약 조건, 응답 정의를 사용자에게 확인받은 뒤에만 설계 행렬을 만든다.

## 진행 순서

1. 항상 먼저 읽는다: [static/core/stance.md](static/core/stance.md), [static/core/contract.md](static/core/contract.md), [static/core/workflow.md](static/core/workflow.md).
   - workflow.md의 "manifest 라우팅"과 "experiment-record.yaml" 관련 지시는 무시한다. 대신 이 파일의 2~5단계를 따른다.
2. **목적 분류**: 다음 중 하나로 분류한다.
   - 스크리닝(중요 요인 찾기)
   - 특성 파악
   - 최적화
   - 강건 설계
3. **설계 방식을 고르고 해당 파일 하나만 읽는다**:

   | 상황 | 설계 | 파일 |
   |---|---|---|
   | 요인 2~4개, 교호작용 확인 필요 | 완전요인 / 대조군 포함 고전 설계 | [static/core/classical-doe.md](static/core/classical-doe.md) |
   | 요인 3~5개, 교호작용 무시 가능, 실험 수 최소화 | 다구치 직교배열 (L9/L16/L25) | [static/core/orthogonal-tables.md](static/core/orthogonal-tables.md) |
   | 요인 6개 이상, 중요 요인만 추리기 | Plackett-Burman / 부분요인 | [static/core/screening-designs.md](static/core/screening-designs.md) |
   | 핵심 요인 2~3개, 최적점 찾기 | CCD / Box-Behnken | [static/core/response-surface.md](static/core/response-surface.md) |

4. **고분자 소재 참고**: PET 계열 공정 변수, 대표 응답, 시험법 예시는 [static/reference/polymers-experiments.md](static/reference/polymers-experiments.md)를 참고한다. 요인·수준 표 양식은 [static/reference/factor-level-template.md](static/reference/factor-level-template.md)에 있다.
5. **출력**: Markdown으로 아래 항목을 낸다.
   - 요인·수준 표(코드값과 실제값)
   - 실험 순서(표준 순서와 랜덤 순서를 구분)
   - 반복 수, 중심점, 대조군
   - 분석 방법
   - 미결 사항(`[needs data: ...]`)

   사용자가 요청하면 [assets/templates/experiment-plan-template.csv](assets/templates/experiment-plan-template.csv) 형식의 CSV도 만든다.

## 분석 스크립트 (실험 결과가 나온 뒤)

필요 패키지는 `pandas numpy scipy matplotlib`이다. 스크립트는 이 스킬 폴더의 `scripts/`에 있다. 아래 `<SKILL_DIR>`은 이 스킬의 base directory 절대경로로 바꿔서 실행한다.

```bash
python "<SKILL_DIR>/scripts/orthogonal_analysis.py" results.csv -f 온도 압력 시간 -r 인장강도 -g max
python "<SKILL_DIR>/scripts/rsm_analysis.py" --help
python "<SKILL_DIR>/scripts/screening_analysis.py" --help
python "<SKILL_DIR>/scripts/experiment_plot.py" --help
```

## 반드시 지킬 것 (Gates)

- **차단 조건**: 요인 목록과 수준 수를 사용자가 확인하기 전에는 행렬을 만들지 않는다.
- 직교배열은 교호작용이 없다고 가정한다. 교호작용이 있을 수 있으면 `[needs interaction assessment]`를 표시한다. 예: srPET의 성형 온도 × 압력.
- 반복, 랜덤화, 대조군, 교호작용 가정은 모두 명시한다.
- 실험 데이터, 유의성, 최적 조합을 지어내지 않는다.
- srPET은 자기강화 복합재이므로 성형 온도 창이 핵심 제약이다. 보강 섬유의 융점과 기지의 융점 사이에서만 성형해야 한다. 이 온도 범위의 근거(DSC 데이터 등)가 없으면 `[needs data: DSC 융점 창]`으로 표시한다.
