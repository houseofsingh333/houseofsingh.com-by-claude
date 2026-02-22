/**
 * /pa/* layout — language is handled at the root layout level via middleware.
 * This file exists only to satisfy Next.js App Router's layout requirement.
 */
export default function PaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
