import type { Judge, Report, Verdict } from "@/lib/protocols";
import { Markdown } from "@/components/Markdown";
import { PrintButton } from "@/components/PrintButton";

const VERDICT: Record<Verdict, { box: string; text: string; mark: string }> = {
  진행: { box: "border-under/40 bg-under-soft", text: "text-under", mark: "●" },
  "조건부 진행": { box: "border-warn/40 bg-warn-soft", text: "text-warn", mark: "◐" },
  보류: { box: "border-over/40 bg-over-soft", text: "text-over", mark: "■" },
};

export const JUDGE: Record<Judge, { label: string; cls: string }> = {
  ok: { label: "✅ 가능", cls: "bg-under-soft text-under" },
  warn: { label: "⚠ 위험", cls: "bg-warn-soft text-warn" },
  bad: { label: "❌ 어려움", cls: "bg-over-soft text-over" },
  unknown: { label: "❓ 미확인", cls: "bg-muted-soft text-slate-600" },
};

export function VerdictChip({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) return null;
  const v = VERDICT[verdict];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${v.box} ${v.text}`}>{v.mark} {verdict}</span>;
}

export function ReportView({ r, file }: { r: Report; file: string }) {
  const v = r.verdict ? VERDICT[r.verdict] : null;
  const assumed = r.reqs.filter((x) => x.assumed).length;
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{r.title}</h2>
          <p className="mt-1 text-sm text-slate-500">결정하는 사람용 1~2쪽 요약 · 근거는 왼쪽 탭의 프로토콜 본문</p>
        </div>
        <PrintButton />
      </header>

      {/* 기본 정보 */}
      <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-slate-200 p-4 text-sm sm:grid-cols-[auto_1fr]">
        {r.meta.map(([k, val]) => (
          <div key={k} className="contents">
            <dt className="font-semibold text-slate-500">{k}</dt>
            <dd className="text-slate-800 [&_.md]:text-sm [&_p]:m-0">
              <Markdown>{val}</Markdown>
            </dd>
          </div>
        ))}
      </dl>

      {/* 결론 */}
      <section className={`rounded-2xl border-2 p-5 ${v?.box ?? "border-slate-200"}`}>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-sm font-semibold text-slate-600">결론</span>
          <span className={`text-2xl font-extrabold ${v?.text ?? "text-slate-900"}`}>
            {v?.mark} {r.verdict ?? "판정 미기재"}
          </span>
        </div>
        <div className="mt-2 [&_.md]:text-slate-800 [&_p:last-child]:mb-0">
          <Markdown>{r.conclusion}</Markdown>
        </div>
      </section>

      {/* 1. 고객 요구 대비 */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[17px] font-bold text-slate-900">1. 고객 요구 대비 대응 가능성</h3>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(JUDGE) as Judge[])
              .filter((k) => r.counts[k])
              .map((k) => (
                <span key={k} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${JUDGE[k].cls}`}>
                  {JUDGE[k].label} {r.counts[k]}
                </span>
              ))}
          </div>
        </div>
        {assumed > 0 && (
          <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
            요구값 {r.reqs.length}개 중 <b>{assumed}개가 [가정]</b>입니다. 고객 문서를 받으면 이 값들이 바뀔 수 있습니다.
          </p>
        )}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-[13.5px] leading-relaxed">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="w-[16%] px-3 py-2.5">고객 요구</th>
                <th className="w-[24%] px-3 py-2.5">요구값 · 출처</th>
                <th className="w-[13%] px-3 py-2.5">판단</th>
                <th className="px-3 py-2.5">이유</th>
                <th className="w-[13%] px-3 py-2.5">근거 위치</th>
              </tr>
            </thead>
            <tbody>
              {r.reqs.map((x) => (
                <tr key={x.req} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{x.req}</td>
                  <td className="px-3 py-2.5">
                    <div className="text-slate-800">{x.value}</div>
                    <div className={`mt-0.5 text-xs ${x.assumed ? "font-semibold text-warn" : "text-slate-500"}`}>{x.source}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${JUDGE[x.judge].cls}`}>{JUDGE[x.judge].label}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{x.reason}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">{x.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2장 이후 */}
      <section className="[&_.md_h3]:text-[17px]">
        <Markdown>{r.rest}</Markdown>
      </section>

      <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">원본: {file}</p>
    </div>
  );
}
