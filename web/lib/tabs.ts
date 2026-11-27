/** 제품 페이지 탭 — 신제품 개발 프로토콜 프로세스 순서(조건 → 검토 → 검증 계획 → 근거·관리) */
export type TabDef = { key: string; title: string; chapter?: string };
export type TabGroup = { title: string; tabs: TabDef[] };

export const TAB_GROUPS: TabGroup[] = [
  { title: "요약", tabs: [{ key: "overview", title: "한눈에 보기" }] },
  { title: "① 개발 조건", tabs: [{ key: "c0", title: "개요·전제", chapter: "0" }] },
  {
    title: "② 검토",
    tabs: [
      { key: "c1", title: "기술적 검토", chapter: "1" },
      { key: "c2", title: "환경적 검토", chapter: "2" },
      { key: "c3", title: "제도적 검토", chapter: "3" },
    ],
  },
  {
    title: "③ 검증 계획",
    tabs: [
      { key: "c4", title: "신뢰성 검증 (DVP&R)", chapter: "4" },
      { key: "c5", title: "실험계획 (DOE)", chapter: "5" },
    ],
  },
  {
    title: "④ 근거·관리",
    tabs: [
      { key: "c6", title: "백데이터 근거", chapter: "6" },
      { key: "c7", title: "리스크·미결", chapter: "7" },
      { key: "review", title: "자체 검토" },
      { key: "history", title: "변경 이력", chapter: "history" },
    ],
  },
];

export const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);
export const findTab = (key?: string) => ALL_TABS.find((t) => t.key === key) ?? ALL_TABS[0];
