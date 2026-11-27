import type { Step } from "@/lib/protocols";

export function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "under" | "warn" | "over" | "decided" }) {
  const cls = {
    muted: "bg-muted-soft text-slate-600",
    under: "bg-under-soft text-under",
    warn: "bg-warn-soft text-warn",
    over: "bg-over-soft text-over",
    decided: "bg-decided-soft text-decided",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "under" | "warn" | "over" }) {
  const color = tone ? { under: "text-under", warn: "text-warn", over: "text-over" }[tone] : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const STATE = {
  done: { mark: "✓", ring: "bg-under text-white", text: "완료" },
  partial: { mark: "…", ring: "bg-warn text-white", text: "진행 중" },
  todo: { mark: "", ring: "bg-white border-2 border-slate-300 text-slate-400", text: "대기" },
};

/** 프로세스 단계 표시 — 가로(넓은 화면)·세로(좁은 화면) */
export function ProcessTrack({ steps, compact = false }: { steps: Step[]; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1" aria-label="프로세스 진행">
        {steps.map((s) => (
          <span
            key={s.key}
            title={`${s.title}: ${STATE[s.state].text}`}
            className={`h-1.5 flex-1 rounded-full ${s.state === "done" ? "bg-under" : s.state === "partial" ? "bg-warn" : "bg-slate-200"}`}
          />
        ))}
      </div>
    );
  }
  return (
    <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((s, i) => (
        <li key={s.key} className="relative rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${STATE[s.state].ring}`}>
              {STATE[s.state].mark || i + 1}
            </span>
            <span className="text-[13px] font-semibold leading-tight text-slate-900">{s.title}</span>
          </div>
          <div className="mt-2 text-xs leading-snug text-slate-500">{s.detail}</div>
          <div className={`mt-1 text-[11px] font-semibold ${s.state === "done" ? "text-under" : s.state === "partial" ? "text-warn" : "text-slate-400"}`}>
            {STATE[s.state].text}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ReviewBar({ ok, warn, bad }: { ok: number; warn: number; bad: number }) {
  const total = ok + warn + bad || 1;
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100" aria-label={`충족 ${ok}, 확인 필요 ${warn}, 미충족 ${bad}`}>
      <span className="bg-under" style={{ width: `${(ok / total) * 100}%` }} />
      <span className="bg-warn" style={{ width: `${(warn / total) * 100}%` }} />
      <span className="bg-over" style={{ width: `${(bad / total) * 100}%` }} />
    </div>
  );
}
