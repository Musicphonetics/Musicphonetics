// Thin gold "stave" hairline between the dark funnel sections.
export function GoldDivider() {
  return (
    <div className="bg-ink">
      <div className="container-mp">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>
    </div>
  );
}
