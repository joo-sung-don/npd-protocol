import Link from "next/link";
import { loadProducts, processSteps, PROTOCOLS_DIR } from "@/lib/protocols";
import { Chip, ProcessTrack, ReviewBar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function Home() {
  const products = loadProducts();
  const open = products.reduce((s, p) => s + p.latest.metrics.openItems, 0);
  const est = products.reduce((s, p) => s + p.latest.metrics.est, 0);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">신제품 개발 프로토콜</h1>
        <p className="max-w-3xl text-[15px] leading-relaxed text-slate-600">
          신제품마다 기술·환경·제도 검토, 신뢰성 검증 계획, 실험계획, 근거와 미결 사항을 프로세스 순서대로 봅니다.
          현재 <b className="text-slate-900">{products.length}</b>개 제품, 최신 버전 기준 미결 <b className="text-warn">{open}</b>건, 추정 표시{" "}
          <b className="text-warn">{est}</b>건이 남아 있습니다.
        </p>
      </section>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          <p>아직 프로토콜이 없습니다.</p>
          <p className="mt-1">
            Claude Code에서 <code className="rounded bg-slate-100 px-1">/new-protocol</code>로 작성하면{" "}
            <code className="rounded bg-slate-100 px-1">{PROTOCOLS_DIR}</code>에 저장되고 여기에 나타납니다.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {products.map((p) => {
            const v = p.latest;
            const mx = v.metrics;
            return (
              <Link
                key={p.id}
                href={`/p/${encodeURIComponent(p.id)}`}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip tone="decided">{p.family}</Chip>
                  <Chip>{p.industry}</Chip>
                  {v.header["개발 단계"] && <Chip>{v.header["개발 단계"]}</Chip>}
                  <span className="ml-auto text-xs text-slate-500">
                    v{v.version} · {v.date}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:underline">{v.title}</h2>
                  {v.header["문서번호"] && <p className="mt-0.5 text-xs text-slate-500">{v.header["문서번호"]}</p>}
                </div>
                <dl className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["고위험 FM", `${mx.fmHigh}/${mx.fmTotal}`, ""],
                    ["검증 시험", mx.dvpTotal, ""],
                    ["미결", mx.openItems, mx.openItems ? "text-warn" : "text-under"],
                    ["추정", mx.est, mx.est ? "text-warn" : "text-under"],
                  ].map(([k, val, c]) => (
                    <div key={k as string} className="rounded-lg bg-slate-50 py-2">
                      <dt className="text-[11px] text-slate-500">{k}</dt>
                      <dd className={`text-lg font-bold ${c || "text-slate-900"}`}>{val}</dd>
                    </div>
                  ))}
                </dl>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>프로세스 진행</span>
                    {v.review && (
                      <span>
                        자체 검토 ✅ {v.review.ok} · ⚠️ {v.review.warn} · ❌ {v.review.bad}
                      </span>
                    )}
                  </div>
                  <ProcessTrack steps={processSteps(v)} compact />
                  {v.review && <ReviewBar {...v.review} />}
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
