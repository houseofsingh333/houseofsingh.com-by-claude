import { ALT_MAX, COVER_MIN, COVER_REFUSE, DESCRIPTION_MAX, DESCRIPTION_MIN, PHOTO_MIN, TITLE_MAX } from "../guardrails";

/**
 * The Studio's "Content rules" page (Studio, Content rules): the checks the
 * Studio runs before publishing, in plain English (sanity/guardrails.ts).
 * Plain React and the Studio's own colours, so it needs no extra package.
 */
const muted = "var(--card-muted-fg-color, #6e7683)";
const h2 = { fontSize: 16, fontWeight: 600, margin: "28px 0 8px" } as const;
const li = { margin: "6px 0" } as const;

export default function ContentRules() {
  return (
    <div style={{ padding: 24, maxWidth: 680, lineHeight: 1.55, fontSize: 14 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>Content rules</h1>
      <p style={{ color: muted, margin: 0 }}>
        What the Studio checks before you publish. A <strong>warning</strong> (amber) lets you publish, but says what would make the page
        slower or less clear. An <strong>error</strong> (red) must be fixed first.
      </p>

      <h2 style={h2}>Photographs</h2>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li style={li}>
          <strong>Use a JPEG for a photograph.</strong> A PNG with no transparency is usually several times larger for the same picture: export
          it as JPEG, quality about 83. (Warning.) Logos are not checked.
        </li>
        <li style={li}>
          <strong>Keep each file under 5 MB.</strong> Larger files take longer for the Studio and for the site to prepare. (Warning.)
        </li>
        <li style={li}>
          <strong>Wide enough to stay sharp.</strong> A hero slide or a project cover: at least {COVER_MIN}px wide (warning below that,
          and an <strong>error under {COVER_REFUSE}px</strong>, which would look soft on a large screen). Any other photograph, Journal
          covers included: at least {PHOTO_MIN}px wide. (Warning.)
        </li>
      </ul>

      <h2 style={h2}>Alt text</h2>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li style={li}>
          <strong>Required on every photograph</strong> that shows something, unless you mark it Decorative. (Error, as before.)
        </li>
        <li style={li}>
          <strong>Describe what is in the photograph</strong>, as you would to someone who cannot see it. &ldquo;House of Singh&rdquo;,
          &ldquo;image&rdquo;, &ldquo;photo&rdquo; or the file&apos;s name say nothing. (Warning.)
        </li>
        <li style={li}>
          <strong>Under {ALT_MAX} characters.</strong> A screen reader reads it in one go; put the rest in a caption. (Warning.)
        </li>
      </ul>

      <h2 style={h2}>Search title and description (the SEO section)</h2>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li style={li}>
          <strong>Title: at most {TITLE_MAX} characters.</strong> Search results cut longer ones. (Warning.)
        </li>
        <li style={li}>
          <strong>Description: {DESCRIPTION_MIN} to {DESCRIPTION_MAX} characters.</strong> One full sentence that search results can show
          whole. Empty is fine: the page then uses its own. (Warning.)
        </li>
      </ul>

      <p style={{ color: muted, marginTop: 28 }}>
        The same rules are written down in the website&apos;s repository, docs/studio-guardrails.md. The import tool applies the photograph
        rules too, and stores covers at most 2800px wide.
      </p>
    </div>
  );
}
