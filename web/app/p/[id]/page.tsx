import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadProduct, processSteps, type Product, type Version } from "@/lib/protocols";
import { ALL_TABS, TAB_GROUPS, findTab } from "@/lib/tabs";
import { Markdown, TAG_LEGEND, TagChip } from "@/components/Markdown";
import { Chip, ProcessTrack, ReviewBar, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; v?: string }> };

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = loadProduct(decode((await params).id));
  return { title: p ? p.latest.title : "없는 제품" };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const p = loadProduct(decode(id));
  if (!p) notFound();
  const v = p.versions.find((x) => x.version === Number(sp.v)) ?? p.latest;
  const tab = findTab(sp.tab);
  const href = (t: string, ver = v.version) =>
    `/p/${encodeURIComponent(p.id)}?tab=${t}${ver !== p.latest.version ? `&v=${ver}` : ""}`;
  const idx = ALL_TABS.findIndex((t) => t.key === tab.key);
  const prev = ALL_TABS[idx - 1];
  const next = ALL_TABS[idx + 1];

  return (
    <div className="space-y-6">
      {/* 제품 머리 */}
      <section className="space-y-3">
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-900">
          ← 제품 목록
        </Link>
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="decided">{p.family}</Chip>
          <Chip>{p.industry}</Chip>
          <Chip>{p.part}</Chip>
          {v.header["개발 단계"] && <Chip>{v.header["개발 단계"]}</Chip>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">{v.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          {v.header["문서번호"] && <span>{v.header["문서번호"]}</span>}
          <span>작성 {v.date}</span>
          <span className="flex items-center gap-1" role="group" aria-label="버전 선택">
            {p.versions
              .slice()
              .reverse()
              .map((x) => (
                <Link
                  key={x.version}
                  href={href(tab.key, x.version)}
                  aria-current={x.version === v.version ? "true" : undefined}
                  className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    x.version === v.version
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  v{x.version}
                  {x.version === p.latest.version ? " 최신" : ""}
                </Link>
              ))}
          </span>
        </div>
        {v.version !== p.latest.version && (
          <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
            이전 버전(v{v.version})을 보고 있습니다. <Link href={href(tab.key, p.latest.version)} className="font-semibold underline">최신 v{p.latest.version}로 이동</Link>
          </p>
        )}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* 탭(목차) — 넓은 화면은 왼쪽 고정, 좁은 화면은 가로 스크롤 */}
        <nav aria-label="프로토콜 목차" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-4 lg:overflow-visible lg:px-0">
            {TAB_GROUPS.map((g) => (
              <div key={g.title} className="flex shrink-0 gap-1 lg:flex-col lg:gap-0.5">
                <div className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:block">{g.title}</div>
                {g.tabs.map((t) => {
                  const on = t.key === tab.key;
                  const missing = t.chapter && !v.chapters[t.chapter];
                  const missingReview = t.key === "review" && !v.review;
                  return (
                    <Link
                      key={t.key}
                      href={href(t.key)}
                      aria-current={on ? "page" : undefined}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                        on ? "bg-slate-900 font-semibold text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      } ${missing || missingReview ? "opacity-50" : ""}`}
                    >
                      {t.title}
                      {t.key === "c7" && v.metrics.openItems > 0 && (
                        <span className={`ml-1.5 rounded-full px-1.5 text-[11px] font-bold ${on ? "bg-white/20" : "bg-warn-soft text-warn"}`}>
                          {v.metrics.openItems}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* 본문 */}
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <TabBody p={p} v={v} tabKey={tab.key} />
          <div className="mt-10 flex justify-between gap-3 border-t border-slate-100 pt-5 text-sm">
            {prev ? (
              <Link href={href(prev.key)} className="text-slate-500 hover:text-slate-900">
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={href(next.key)} className="font-semibold text-slate-900 hover:underline">
                {next.title} →
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function TabTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <h2 className="text-xl font-bold text-slate-900">{children}</h2>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </header>
  );
}

function TabBody({ p, v, tabKey }: { p: Product; v: Version; tabKey: string }) {
  const mx = v.metrics;
  const tab = findTab(tabKey);

  if (tabKey === "overview") {
    return (
      <div className="space-y-8">
        <TabTitle sub="프로토콜 작성 프로세스의 단계별 상태와 핵심 수치">한눈에 보기</TabTitle>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">프로세스 진행</h3>
          <ProcessTrack steps={processSteps(v)} />
        </section>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="고위험 고장모드 / 전체" value={`${mx.fmHigh} / ${mx.fmTotal}`} sub="AP=H는 반드시 시험으로 검증" />
          <Stat
            label="검증 시험 (DVP)"
            value={mx.dvpTotal}
            sub={mx.highUncovered.length ? `시험 없는 고위험: ${mx.highUncovered.join(", ")}` : "고위험 모두 시험 연결됨"}
            tone={mx.highUncovered.length ? "over" : undefined}
          />
          <Stat label="미결 사항" value={mx.openItems} sub={`해결 ${mx.resolvedItems}건`} tone={mx.openItems ? "warn" : "under"} />
          <Stat label="추정 / 데이터 필요" value={`${mx.est} / ${mx.needsData}`} sub="사내 자료를 넣으면 줄어듭니다" tone={mx.est ? "warn" : "under"} />
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">근거 출처 구성</h3>
            <SourceBars v={v} />
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">버전별 자체 검토</h3>
            <div className="space-y-2.5">
              {p.versions
                .slice()
                .reverse()
                .map((x) => (
                  <div key={x.version} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 text-sm">
                    <span className={x.version === v.version ? "font-bold text-slate-900" : "text-slate-500"}>v{x.version}</span>
                    {x.review ? <ReviewBar {...x.review} /> : <span className="text-xs text-slate-400">기록 없음</span>}
                    <span className="text-xs text-slate-500">
                      {x.review ? `✅${x.review.ok} ⚠️${x.review.warn} ❌${x.review.bad}` : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>
        {v.review && v.review.top.length > 0 && (
          <section className="rounded-xl bg-warn-soft p-4">
            <h3 className="mb-2 text-sm font-semibold text-warn">다음에 할 일 (자체 검토 우선 수정)</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-800">
              {v.review.top.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </section>
        )}
        {v.chapters["0"] && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">개요</h3>
            <Markdown>{v.intro + "\n" + v.chapters["0"].body}</Markdown>
          </section>
        )}
      </div>
    );
  }

  if (tabKey === "review") {
    if (!v.review) return <Empty title="자체 검토" text="이 버전에는 검토 기록 파일(_review.md)이 없습니다. Claude Code에서 /review-protocol을 실행하세요." />;
    const r = v.review;
    const style = { ok: "bg-under-soft text-under", warn: "bg-warn-soft text-warn", bad: "bg-over-soft text-over" };
    const label = { ok: "✅ 충족", warn: "⚠️ 확인 필요", bad: "❌ 미충족" };
    return (
      <div className="space-y-6">
        <TabTitle sub="protocol-reviewer 스킬의 21개 체크리스트(완결성·근거·DVP·규격·DOE) 판정">자체 검토</TabTitle>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="충족" value={r.ok} tone="under" />
          <Stat label="확인 필요" value={r.warn} tone="warn" />
          <Stat label="미충족" value={r.bad} tone="over" />
        </div>
        <ReviewBar {...r} />
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2">항목</th>
                <th className="px-3 py-2">판정</th>
                <th className="px-3 py-2">위치</th>
                <th className="px-3 py-2">수정 제안</th>
              </tr>
            </thead>
            <tbody>
              {r.items.map((it, i) => (
                <tr key={i} className="border-t border-slate-100 align-top">
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-800">{it.item}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style[it.verdict]}`}>{label[it.verdict]}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{it.where}</td>
                  <td className="px-3 py-2 text-slate-700">{it.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {r.top.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">우선 수정</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {r.top.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  const ch = tab.chapter ? v.chapters[tab.chapter] : undefined;
  if (!ch) return <Empty title={tab.title} text="이 버전에는 해당 장이 없습니다." />;

  return (
    <div>
      <TabTitle sub={tab.chapter && tab.chapter !== "history" ? `프로토콜 ${tab.chapter}장 · ${ch.title}` : undefined}>{tab.title}</TabTitle>
      {tabKey === "c4" && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="고장모드" value={mx.fmTotal} />
          <Stat label="고위험 (AP=H)" value={mx.fmHigh} tone="over" />
          <Stat label="검증 시험" value={mx.dvpTotal} />
          <Stat
            label="시험 없는 고위험"
            value={mx.highUncovered.length}
            tone={mx.highUncovered.length ? "over" : "under"}
            sub={mx.highUncovered.length ? mx.highUncovered.join(", ") : "모두 연결됨"}
          />
        </div>
      )}
      {tabKey === "c7" && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="미결" value={mx.openItems} tone={mx.openItems ? "warn" : "under"} />
          <Stat label="해결" value={mx.resolvedItems} tone="under" />
          <Stat label="추정 / 데이터 필요" value={`${mx.est} / ${mx.needsData}`} tone="warn" />
        </div>
      )}
      {tabKey === "c6" && (
        <div className="mb-6 rounded-xl border border-slate-200 p-4">
          <SourceBars v={v} />
        </div>
      )}
      {["c1", "c2", "c3", "c4", "c6"].includes(tabKey) && <Legend />}
      <Markdown>{ch.body}</Markdown>
      {tabKey === "history" && (
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {p.versions.map((x) => (
            <Link key={x.version} href={`/p/${encodeURIComponent(p.id)}?tab=overview&v=${x.version}`} className="rounded-lg border border-slate-200 px-3 py-1.5 hover:border-slate-400">
              v{x.version} 열기 <span className="text-xs text-slate-400">{x.file}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      <span className="mr-1">출처 표시:</span>
      {TAG_LEGEND.map((t) => (
        <TagChip key={t.k} k={t.k}>
          {t.label}
        </TagChip>
      ))}
    </div>
  );
}

function SourceBars({ v }: { v: Version }) {
  const mx = v.metrics;
  const rows: [string, number, string][] = [
    ["사내 문서 [D]", mx.src.D, "bg-decided"],
    ["물성 데이터 [P]", mx.src.P, "bg-decided"],
    ["규격 [S]", mx.src.S, "bg-under"],
    ["법령·고시 [L]", mx.src.L, "bg-under"],
    ["⚠ 추정", mx.est, "bg-warn"],
    ["데이터 필요", mx.needsData, "bg-over"],
  ];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="space-y-2">
      {rows.map(([k, n, c]) => (
        <div key={k} className="grid grid-cols-[110px_1fr_32px] items-center gap-2 text-sm">
          <span className="text-xs text-slate-600">{k}</span>
          <span className="h-3 rounded bg-slate-100">
            <span className={`block h-3 rounded ${c}`} style={{ width: `${(n / max) * 100}%`, minWidth: n ? 3 : 0 }} />
          </span>
          <span className="text-right text-xs font-semibold text-slate-700">{n}</span>
        </div>
      ))}
      <p className="pt-1 text-xs text-slate-500">사내 문서·물성 데이터가 늘고 추정이 줄어야 신뢰도가 올라갑니다.</p>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <TabTitle>{title}</TabTitle>
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{text}</p>
    </div>
  );
}
