import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 출처 태그를 링크 문법으로 바꿔 두면 a 컴포넌트가 배지로 그린다. 인라인 코드 안은 건드리지 않는다. */
function tagify(md: string): string {
  return md
    .split(/(`[^`\n]*`)/)
    .map((seg, i) =>
      i % 2
        ? seg
        : seg
            .replace(/\[(D|P|S|L):([^\]\n]*)\](?!\()/g, (_, t, v) => `[${t}:${v}](#tag-${t})`)
            .replace(/\[needs data([^\]\n]*)\](?!\()/g, (_, r) => `[needs data${r}](#tag-N)`)
            .replace(/⚠ 추정/g, "[⚠ 추정](#tag-E)"),
    )
    .join("");
}

const TAG_STYLE: Record<string, string> = {
  D: "bg-decided-soft text-decided border-decided/30",
  P: "bg-decided-soft text-decided border-decided/30",
  S: "bg-under-soft text-under border-under/30",
  L: "bg-under-soft text-under border-under/30",
  E: "bg-warn-soft text-warn border-warn/30",
  N: "bg-over-soft text-over border-over/30",
};

export const TAG_LEGEND: { k: string; label: string }[] = [
  { k: "D", label: "사내 문서 [D]" },
  { k: "P", label: "물성 데이터 [P]" },
  { k: "S", label: "규격 [S]" },
  { k: "L", label: "법령·고시 [L]" },
  { k: "E", label: "⚠ 추정 (근거 없음)" },
  { k: "N", label: "데이터 필요" },
];

export function TagChip({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded border px-1.5 py-px text-[0.78em] font-medium whitespace-nowrap ${TAG_STYLE[k] ?? ""}`}>
      {children}
    </span>
  );
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => {
            const tag = href?.match(/^#tag-(\w)$/)?.[1];
            if (tag) return <TagChip k={tag}>{c}</TagChip>;
            return (
              <a href={href} className="text-decided underline underline-offset-2" target="_blank" rel="noreferrer">
                {c}
              </a>
            );
          },
          table: ({ children: c }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table>{c}</table>
            </div>
          ),
        }}
      >
        {tagify(children)}
      </ReactMarkdown>
    </div>
  );
}
