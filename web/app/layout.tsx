import type { Metadata } from "next";
import Link from "next/link";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "신제품 개발 프로토콜", template: "%s | 신제품 개발 프로토콜" },
  description: "(주)컴퍼지트솔루션즈 신제품별 개발 프로토콜 — 기술·환경·제도 검토, 신뢰성 검증, 실험계획, 근거",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-[17px] font-bold tracking-tight text-slate-900">NPD 프로토콜</span>
              <span className="hidden text-xs text-slate-500 sm:inline">(주)컴퍼지트솔루션즈 신제품 개발</span>
            </Link>
            <nav className="text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">제품 목록</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">{children}</main>
      </body>
    </html>
  );
}
