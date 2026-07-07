/**
 * Renders a JSON-LD <script> tag for structured data.
 * Server component - safe to drop into any page or layout.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here (no user input); this is the
      // standard Next.js pattern for embedding structured data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
