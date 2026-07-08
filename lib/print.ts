// Print a single document element as a clean, correctly-paginated PDF.
// Printing in-place leaves blank trailing pages (hidden page content still
// occupies height), so we open an isolated window containing only the element
// plus the app's compiled styles, and print that. Falls back to window.print().
export function printDoc(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) { window.print(); return; }

  const w = window.open("", "_blank");
  if (!w) { window.print(); return; } // popup blocked

  const head = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((n) => (n.tagName === "LINK"
      ? `<link rel="stylesheet" href="${(n as HTMLLinkElement).href}">`
      : n.outerHTML))
    .join("");

  w.document.open();
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>Musicphonetics</title>${head}` +
    `<style>@page{size:A4;margin:12mm}html,body{margin:0;padding:0;background:#fff}</style></head>` +
    `<body>${el.outerHTML}</body></html>`
  );
  w.document.close();

  let done = false;
  const go = () => { if (done || w.closed) return; done = true; try { w.focus(); w.print(); } catch { /* noop */ } };
  w.onload = () => setTimeout(go, 250);
  setTimeout(go, 1000); // fallback if onload already fired
}
