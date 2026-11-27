/**
 * protocols/*.md 와 *_review.md 를 요청마다 직접 읽는다(빌드·변환 단계 없음).
 * 새 프로토콜을 저장하면 새로고침만으로 화면에 나타난다.
 * 폴더는 PROTOCOLS_DIR 환경변수로 바꿀 수 있다(기본: 이 web/ 폴더의 상위 protocols/).
 */
import fs from "node:fs";
import path from "node:path";

export const PROTOCOLS_DIR = process.env.PROTOCOLS_DIR ?? path.resolve(process.cwd(), "..", "protocols");

const NAME_RE = /^(\d{4}-\d{2}-\d{2})_([^_]+)_([^_]+)_(.+)_v(\d+)\.md$/;

export type Chapter = { key: string; title: string; body: string };

export type ReviewItem = { item: string; verdict: "ok" | "warn" | "bad"; where: string; fix: string };
export type Review = { ok: number; warn: number; bad: number; items: ReviewItem[]; top: string[]; markdown: string };

export type Judge = "ok" | "warn" | "bad" | "unknown";
export type ReqRow = { req: string; value: string; source: string; assumed: boolean; judge: Judge; judgeText: string; reason: string; ref: string };
export type Verdict = "진행" | "조건부 진행" | "보류";
export type Report = {
  title: string;
  meta: [string, string][];
  verdict: Verdict | null;
  conclusion: string;
  reqs: ReqRow[];
  counts: Record<Judge, number>;
  rest: string; // 2장 이후 Markdown
};

export type Metrics = {
  fmTotal: number;
  fmHigh: number;
  dvpTotal: number;
  highUncovered: string[];
  openItems: number;
  resolvedItems: number;
  est: number;
  needsData: number;
  src: { D: number; P: number; S: number; L: number };
};

export type Version = {
  version: number;
  date: string;
  file: string;
  title: string;
  intro: string;
  header: Record<string, string>;
  chapters: Record<string, Chapter>;
  review: Review | null;
  report: Report | null;
  metrics: Metrics;
};

export type Product = {
  id: string;
  family: string;
  industry: string;
  part: string;
  versions: Version[]; // 오래된 순
  latest: Version;
};

const clean = (c: string) => c.replace(/\*\*|~~|`/g, "").trim();

function tableRows(lines: string[]): string[][] {
  const rows: string[][] = [];
  for (const ln of lines) {
    if (!ln.startsWith("|")) continue;
    const cells = ln.trim().replace(/^\||\|$/g, "").split("|").map(clean);
    if (cells.every((c) => !c || /^:?-{3,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  return rows.slice(1);
}

function section(lines: string[], start: RegExp): string[] {
  const out: string[] = [];
  let on = false;
  let level = 0;
  for (const ln of lines) {
    const m = ln.match(/^(#+)\s/);
    if (on && m && m[1].length <= level) break;
    if (on) out.push(ln);
    else if (start.test(ln)) {
      on = true;
      level = ln.match(/^(#+)/)![1].length;
    }
  }
  return out;
}

function splitChapters(lines: string[]): { intro: string; chapters: Record<string, Chapter> } {
  const chapters: Record<string, Chapter> = {};
  const intro: string[] = [];
  let cur: Chapter | null = null;
  for (const ln of lines.slice(1)) {
    const m = ln.match(/^##\s+(.*)$/);
    if (m) {
      const title = m[1].trim();
      const num = title.match(/^(\d+)\./)?.[1];
      const key = num ?? (title.includes("변경 이력") ? "history" : title);
      cur = { key, title: title.replace(/^\d+\.\s*/, ""), body: "" };
      chapters[key] = cur;
      continue;
    }
    if (cur) cur.body += ln + "\n";
    else intro.push(ln);
  }
  return { intro: intro.join("\n"), chapters };
}

function parseReview(file: string): Review | null {
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/\*\*요약\*\*:\s*✅\s*(\d+)\D+?(\d+)\D+?(\d+)/);
  const items: ReviewItem[] = tableRows(text.split("\n")).map((r) => ({
    item: r[0] ?? "",
    verdict: r[1]?.includes("❌") ? "bad" : r[1]?.includes("⚠") ? "warn" : "ok",
    where: r[2] ?? "",
    fix: r[3] ?? "",
  }));
  const top = [...text.matchAll(/^\d+\.\s+(.+)$/gm)].map((x) => x[1]).filter((t) => t !== "(없음)");
  return {
    ok: m ? +m[1] : 0,
    warn: m ? +m[2] : 0,
    bad: m ? +m[3] : 0,
    items,
    top,
    markdown: text.replace(/^##[^\n]*\n/, ""),
  };
}

/** *_report.md — protocol-builder references/report-template.md 형식 */
function parseReport(file: string): Report | null {
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\n");
  const firstH2 = lines.findIndex((l) => l.startsWith("## "));
  const meta = tableRows(lines.slice(0, firstH2 < 0 ? lines.length : firstH2))
    .filter((r) => r.length >= 2)
    .map((r) => [r[0], r[1]] as [string, string]);
  const concl = section(lines, /^## 결론/);
  const vm = concl.join("\n").match(/\*\*판정\*\*:\s*(조건부 진행|진행|보류)/);
  const conclusion = concl
    .filter((l) => !/\*\*판정\*\*/.test(l))
    .join("\n")
    .trim();
  const judgeOf = (t: string): Judge => (t.includes("❌") ? "bad" : t.includes("⚠") ? "warn" : t.includes("✅") ? "ok" : "unknown");
  const reqs: ReqRow[] = tableRows(section(lines, /^## 1\./)).map((r) => ({
    req: r[0] ?? "",
    value: r[1] ?? "",
    source: r[2] ?? "",
    assumed: (r[2] ?? "").includes("가정"),
    judge: judgeOf(r[3] ?? ""),
    judgeText: (r[3] ?? "").replace(/^[✅⚠❌❓️\s]+/u, ""),
    reason: r[4] ?? "",
    ref: r[5] ?? "",
  }));
  const counts: Record<Judge, number> = { ok: 0, warn: 0, bad: 0, unknown: 0 };
  for (const r of reqs) counts[r.judge]++;
  const restStart = lines.findIndex((l) => /^## 2\./.test(l));
  return {
    title: lines[0].replace(/^#\s*/, ""),
    meta,
    verdict: (vm?.[1] as Verdict) ?? null,
    conclusion,
    reqs,
    counts,
    rest: restStart < 0 ? "" : lines.slice(restStart).join("\n").replace(/^## (\d+)\./gm, "### $1."),
  };
}

function metrics(lines: string[]): Metrics {
  const body = lines.filter((l) => !l.startsWith(">")).join("\n");
  const fm = tableRows(section(lines, /^### 4\.1/)).filter((r) => r[0]?.startsWith("FM"));
  const dvp = tableRows(section(lines, /^### 4\.2/)).filter((r) => r[0]?.startsWith("DVP"));
  const open = tableRows(section(lines, /^## 7\./)).filter((r) => /^\d+$/.test(r[0] ?? ""));
  const high = fm.filter((r) => r[8] === "H").map((r) => r[0]);
  const covered = new Set(dvp.flatMap((r) => r[1]?.match(/FM\d+/g) ?? []));
  const resolved = open.filter((r) => r[1]?.includes("해결")).length;
  const count = (re: RegExp) => (body.match(re) ?? []).length;
  return {
    fmTotal: fm.length,
    fmHigh: high.length,
    dvpTotal: dvp.length,
    highUncovered: high.filter((h) => !covered.has(h)),
    openItems: open.length - resolved,
    resolvedItems: resolved,
    est: count(/⚠ 추정/g),
    needsData: count(/\[needs data/g),
    src: { D: count(/\[D:/g), P: count(/\[P:/g), S: count(/\[S:/g), L: count(/\[L:/g) },
  };
}

function headerTable(lines: string[]): Record<string, string> {
  const head: Record<string, string> = {};
  const firstChapter = lines.findIndex((l) => l.startsWith("## "));
  for (const r of tableRows(lines.slice(0, firstChapter < 0 ? 30 : firstChapter))) if (r.length >= 2) head[r[0]] = r[1];
  return head;
}

export function loadProducts(): Product[] {
  if (!fs.existsSync(PROTOCOLS_DIR)) return [];
  const byId = new Map<string, Product>();
  for (const file of fs.readdirSync(PROTOCOLS_DIR).sort()) {
    const m = file.match(NAME_RE);
    if (!m) continue;
    const [, date, family, industry, partRaw, ver] = m;
    const text = fs.readFileSync(path.join(PROTOCOLS_DIR, file), "utf8");
    const lines = text.split("\n");
    const { intro, chapters } = splitChapters(lines);
    const v: Version = {
      version: +ver,
      date,
      file,
      title: lines[0].replace(/^#\s*/, "").replace(/\s*v\d+\s*$/, ""),
      intro,
      header: headerTable(lines),
      chapters,
      review: parseReview(path.join(PROTOCOLS_DIR, file.replace(/\.md$/, "_review.md"))),
      report: parseReport(path.join(PROTOCOLS_DIR, file.replace(/\.md$/, "_report.md"))),
      metrics: metrics(lines),
    };
    const id = `${family}_${industry}_${partRaw}`;
    const p = byId.get(id) ?? { id, family, industry, part: partRaw.replace(/_/g, " "), versions: [], latest: v };
    p.versions.push(v);
    byId.set(id, p);
  }
  return [...byId.values()]
    .map((p) => {
      p.versions.sort((a, b) => a.version - b.version);
      p.latest = p.versions[p.versions.length - 1];
      return p;
    })
    .sort((a, b) => b.latest.date.localeCompare(a.latest.date) || a.id.localeCompare(b.id));
}

export function loadProduct(id: string): Product | undefined {
  return loadProducts().find((p) => p.id === id);
}

/** 신제품 개발 프로토콜 프로세스(protocol-builder 스킬 순서)의 단계별 상태 */
export type StepState = "done" | "partial" | "todo";
export type Step = { key: string; title: string; detail: string; state: StepState };

export function processSteps(v: Version): Step[] {
  const mx = v.metrics;
  const allChapters = ["0", "1", "2", "3", "4", "5", "6", "7"].every((k) => v.chapters[k]);
  const internal = mx.src.D + mx.src.P;
  return [
    {
      key: "interview",
      title: "조건 인터뷰",
      detail: v.header["제품군 / 적용 산업 / 부품"] ? "제품·산업·부품·단계 입력됨" : "기본 조건 없음",
      state: v.header["제품군 / 적용 산업 / 부품"] ? "done" : "todo",
    },
    {
      key: "evidence",
      title: "근거 수집",
      detail: `사내 ${internal} · 규격 ${mx.src.S} · 법령 ${mx.src.L} · 추정 ${mx.est}`,
      state: mx.est === 0 && mx.needsData === 0 ? "done" : "partial",
    },
    {
      key: "draft",
      title: "프로토콜 작성 (0~7장)",
      detail: allChapters ? "8개 장 모두 작성" : "빠진 장 있음",
      state: allChapters ? "done" : "partial",
    },
    {
      key: "review",
      title: "자체 검토 (21개 항목)",
      detail: v.review ? `✅ ${v.review.ok} · ⚠️ ${v.review.warn} · ❌ ${v.review.bad}` : "검토 기록 없음",
      state: !v.review ? "todo" : v.review.bad > 0 || v.review.warn > 0 ? "partial" : "done",
    },
    {
      key: "report",
      title: "개발 계획 보고서",
      detail: v.report ? `판정: ${v.report.verdict ?? "미기재"} (v${v.version})` : "보고서 없음",
      state: v.report?.verdict ? "done" : "todo",
    },
    {
      key: "approve",
      title: "미결 해소 · 연구원 승인",
      detail: `미결 ${mx.openItems}건 · 해결 ${mx.resolvedItems}건`,
      state: mx.openItems === 0 ? "done" : mx.resolvedItems > 0 ? "partial" : "todo",
    },
  ];
}
