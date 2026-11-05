import Link from "next/link";
import ErrorLayout, { errorLinkClass } from "@/components/ErrorLayout";

export default function NotFound() {
  return (
    <ErrorLayout
      label="404"
      title="Page not found"
      text="The page you were looking for has moved or no longer exists."
    >
      <Link href="/" className={errorLinkClass}>
        Return home
      </Link>
      <Link href="/journal" className={errorLinkClass}>
        Read the journal
      </Link>
    </ErrorLayout>
  );
}
