// A single, very subtle headline that drifts across the very top of the site.
// Server-rendered (pure CSS animation) so there is no layout shift on load.
// To change the words, edit HEADLINE — that is the only thing you need to touch.
const HEADLINE = "Music education, built like an institution — now enrolling across Delhi NCR";

export function TopTicker() {
  return (
    <div className="mp-ticker fixed inset-x-0 top-0 z-[70] h-7 overflow-hidden border-b border-hairline bg-paper/95 backdrop-blur">
      <div className="mp-ticker-track h-7 text-[11px] font-medium uppercase tracking-[0.16em] text-ink/50">
        {[0, 1].map((i) => (
          <span key={i} className="flex items-center" aria-hidden={i === 1}>
            <span className="px-8">{HEADLINE}</span>
            <span className="text-gold/70">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
