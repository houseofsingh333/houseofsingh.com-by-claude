export const metadata = {
  title: "Sanity Studio | House of Singh",
};

/**
 * Studio layout — full-screen, no site Header/Footer.
 * The root layout still wraps this, so we override with a clean shell.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100]">
      {children}
    </div>
  );
}
