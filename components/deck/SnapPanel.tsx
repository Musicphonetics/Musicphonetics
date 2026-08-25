import { cn } from "@/lib/utils";

// One full-screen "page" of the elite deck. The child <section> is stretched to
// fill the viewport and vertically centred, so its OWN background covers the
// whole panel (no bands) and short content sits centred. A section taller than
// the screen simply grows and scrolls through — nothing is ever clipped.
export function SnapPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      data-panel
      className={cn(
        "snap-start [&>section]:flex [&>section]:min-h-[100svh] [&>section]:flex-col [&>section]:justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
