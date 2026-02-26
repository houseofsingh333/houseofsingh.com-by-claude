/**
 * Journal route layout — wraps listing + slug pages.
 * Adds the .journal-paper class for the archival grain texture.
 */
export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="journal-paper">
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
