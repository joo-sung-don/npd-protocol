import type { Metadata } from "next";
import { Chip } from "@/components/ui";

export const metadata: Metadata = { title: "실무 프로세스 비교" };

type Cover = "full" | "part" | "none";

const COVER: Record<Cover, { label: string; tone: "under" | "warn" | "muted" }> = {
  full: { label: "● 에이전트가 초안 작성", tone: "under" },
  part: { label: "◐ 일부 지원", tone: "warn" },
  none: { label: "○ 범위 밖", tone: "muted" },
};

const STAGES: { no: string; name: string; gate?: string; work: string; output: string; agent: string; human: string; cover: Cover }[] = [
  {
    no: "0",
    name: "기회 발굴",
    work: "고객 요청(RFQ), 시장·규제 동향, 기술 아이디어 수집",
    output: "아이디어 제안서",
    agent: "없음",
    human: "개발 과제 선정",
    cover: "none",
  },
  {
    no: "1",
    name: "개념·타당성 검토",
    gate: "Gate 1",
    work: "시장성, 원가, 특허(IP), 기술 가능성(TRL) 판단",
    output: "타당성 검토서",
    agent: "/new-protocol 인터뷰로 제품군·산업·부품·목표값·시장을 받고, 1장 기술적 검토에 원천기술 강도(TRL, 특허, 논문, 공정 성숙도)를 정리",
    human: "사업성·원가 판단, Gate 1 통과 결정",
    cover: "part",
  },
  {
    no: "2",
    name: "요구사양·개발 계획",
    gate: "Gate 2",
    work: "고객 규격(MS 등) 분석, 목표 특성값 확정, 법규·인증 조사, 일정 수립",
    output: "요구사양서, 개발계획서",
    agent: "0장 개발 조건, 2장 환경적 검토, 3장 제도적 검토 작성. 화재안전 규격, PFAS·REACH·화평법, 국내 법령은 korean-law로 확인",
    human: "고객 규격 원문 확보, 개발 착수 승인",
    cover: "full",
  },
  {
    no: "3",
    name: "위험 분석",
    work: "DFMEA로 고장모드·심각도 정리, 조치 우선순위(AP) 결정",
    output: "DFMEA",
    agent: "dfmea-design·action-priority-ap 스킬로 고장모드와 AP를 만들어 4장에 연결",
    human: "팀 FMEA 회의로 S/O/D 값 확정",
    cover: "full",
  },
  {
    no: "4",
    name: "소재·공정 개발",
    work: "배합·공정 조건 실험, 시제품 제작, 사내 물성 시험",
    output: "실험 기록, 시제품",
    agent: "5장 실험계획(DOE)에 변수·수준·설계 방식 제안(materials-doe), 6장 백데이터에 data/의 사내 자료를 근거로 연결",
    human: "실험과 시제품 제작 자체",
    cover: "part",
  },
  {
    no: "5",
    name: "설계 검증(DV)",
    gate: "Gate 3",
    work: "신뢰성 시험(노화, 열사이클, 연소성 등), 공인시험기관 의뢰, 고객 시험",
    output: "DVP&R, 시험 성적서",
    agent: "4장 DVP&R 계획 작성 — 시험명, 규격 번호, 조건, 샘플 수, 판정 기준을 고장모드와 연결(dvp-test-plan)",
    human: "시험 실행, 성적서 발급, 결과 판정",
    cover: "part",
  },
  {
    no: "6",
    name: "공정 검증·양산 준비(PV)",
    gate: "Gate 4",
    work: "PFMEA, 관리계획서, 시생산, PPAP(자동차)·형식승인(해양·항공)",
    output: "PFMEA, 관리계획서, PPAP",
    agent: "pfmea-process 스킬은 있으나 프로토콜 본문에서는 다루지 않음. 필요하면 따로 요청",
    human: "양산 공정 구축, 고객 승인",
    cover: "none",
  },
  {
    no: "7",
    name: "출시·사후관리",
    work: "양산, 변경관리(4M), 클레임 대응, 교훈(LL) 정리",
    output: "변경관리 기록",
    agent: "없음",
    human: "전부",
    cover: "none",
  },
];

const QUALITY: [string, string][] = [
  ["상급자·품질팀 검토 회의", "/review-protocol이 21개 항목을 자체 점검(✅·⚠️·❌)하고 _review.md 저장 → ④ 근거·관리 › 자체 검토 탭"],
  ["문서 개정 이력 관리", "고칠 때마다 _v1, _v2, _v3로 새 버전 파일 → 수정 이력 탭, 상단 버전 버튼"],
  ["근거 자료 첨부", "모든 내용에 출처 태그([D] 사내자료, [S] 규격, [L] 법령). 근거가 없으면 ⚠ 추정 → 6장 백데이터 탭"],
  ["미결 사항 관리", "7장 리스크·미결에 모으고 제품 카드·요약 탭에 남은 건수 표시"],
  ["Gate 회의 승인", "‘미결 해소 · 연구원 승인’ 단계로 진행 상태만 표시. 승인은 사람이 함"],
];

export default function ProcessPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">실무 프로세스 vs 에이전트</h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-slate-600">
          소재·부품 업계의 일반적인 Stage-Gate 절차에 자동차 협력사의 APQP 단계를 합친 기준입니다. 사내 절차서와 다른 부분은 고쳐 쓰세요.
          에이전트는 각 단계의 <b className="text-slate-900">문서와 계획</b>을 만들고, 실험·시험·승인은 사람이 합니다.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(Object.keys(COVER) as Cover[]).map((k) => (
            <Chip key={k} tone={COVER[k].tone}>
              {COVER[k].label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">1. 단계별 비교</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[960px] border-collapse text-[13.5px] leading-relaxed">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="w-[15%] px-4 py-3">실무 단계</th>
                <th className="w-[20%] px-4 py-3">실무에서 하는 일</th>
                <th className="w-[12%] px-4 py-3">주요 산출물</th>
                <th className="w-[33%] px-4 py-3 text-under">이 에이전트가 하는 일</th>
                <th className="w-[20%] px-4 py-3">사람이 해야 하는 일</th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s) => (
                <tr key={s.no} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {s.no}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        {s.gate && <div className="text-xs text-slate-500">{s.gate}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{s.work}</td>
                  <td className="px-4 py-3 text-slate-700">{s.output}</td>
                  <td className="px-4 py-3">
                    <Chip tone={COVER[s.cover].tone}>{COVER[s.cover].label}</Chip>
                    <p className="mt-1.5 text-slate-700">{s.agent}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">2. 문서 품질 관리 비교</h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-[13.5px] leading-relaxed">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="w-[30%] px-4 py-3">실무</th>
                <th className="px-4 py-3 text-under">이 에이전트 (대시보드 위치)</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY.map(([a, b]) => (
                <tr key={a} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3 font-semibold text-slate-900">{a}</td>
                  <td className="px-4 py-3 text-slate-700">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">3. 핵심 차이</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            ["에이전트가 맡는 범위", "실무 1~5단계의 문서·계획 작성. 규격·법령 조사, 계획서 초안, 빠진 근거 찾기처럼 매번 새로 조사하던 부분입니다."],
            ["사람이 맡는 범위", "실험, 시험, 시제품 제작, 고객 승인, Gate 의사결정. 에이전트 결과물은 이 단계들의 입력 자료입니다."],
            ["결과물의 성격", "규격 번호와 판정 기준은 LLM이 쓴 초안입니다. 고객·인증기관 제출 전에 담당자가 최신판을 확인해야 합니다."],
            ["아직 빠진 부분", "양산 준비(PFMEA, 관리계획서, PPAP)와 시험 결과 입력·합부 판정. 다음 확장 후보입니다."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900">{t}</div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
