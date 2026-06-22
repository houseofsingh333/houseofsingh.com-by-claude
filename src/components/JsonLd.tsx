/**
 * Renders a JSON-LD <script> tag. Accepts a single node or an array of nodes.
 *
 * `<` is escaped to `<` so structured-data text (e.g. an answer that
 * contains "</script>") can never break out of the script element.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
