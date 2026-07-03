import { cn } from "@/lib/utils/cn";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-zinc-300", className)}>{children}</span>;
}
