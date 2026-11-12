import type { Metadata } from "next";
import { UNSUBSCRIBE_DESCRIPTION } from "@/lib/pageDescriptions";
import Link from "@/components/Link";
import { OutlineButton } from "@/components/OutlineCta";
import { readUnsubscribeToken } from "@/lib/email/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: UNSUBSCRIBE_DESCRIPTION,
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** "maninder@example.com" → "m•••@example.com": enough to recognise, nothing more. */
const masked = (email: string) => email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2");

/**
 * Leaving the list, from the link in the welcome or the Notify me
 * confirmation: one question, one button (mail scanners open links, so
 * nothing happens until the button is pressed), then a plain answer.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string; done?: string; invalid?: string; failed?: string }> }) {
  const { t, done, invalid, failed } = await searchParams;
  const email = done || invalid ? null : readUnsubscribeToken(t);

  let label = "Letters";
  let heading = "Unsubscribe";
  let body: React.ReactNode;
  if (done) {
    heading = "You are unsubscribed.";
    body = (
      <p className="text-body-l text-muted-foreground">
        No more letters or Collection emails will reach you. Emails about an order you placed still will. If you change your mind, the field at the foot of every page signs you up again.
      </p>
    );
  } else if (!email) {
    heading = "This link is not valid.";
    body = (
      <p className="text-body-l text-muted-foreground">
        It may have been copied only in part. Open it again from the email, or write through the{" "}
        <Link href="/contact" className="text-foreground hairline-rest">
          contact page
        </Link>{" "}
        and you will be removed.
      </p>
    );
  } else {
    label = "Letters and the Shop";
    body = (
      <>
        <p className="text-body-l text-muted-foreground">
          {`Stop every letter and Collection email from House of Singh to ${masked(email)}? Emails about an order you placed still reach you.`}
        </p>
        <form method="post" action="/api/email/unsubscribe">
          <input type="hidden" name="t" value={t} />
          <input type="hidden" name="from" value="page" />
          <OutlineButton type="submit">Unsubscribe</OutlineButton>
        </form>
        {failed && (
          <p role="alert" className="text-small text-[color:var(--error)]">
            That did not go through. Please try again in a moment.
          </p>
        )}
      </>
    );
  }

  return (
    <section className="px-6 md:px-16 page-top-offset section-pb">
      <div className="flex max-w-[640px] flex-col items-start gap-7">
        <p className="type-label text-muted-foreground">{label}</p>
        <h1 className="font-editorial text-balance font-normal text-display-l leading-[1.05] text-foreground">{heading}</h1>
        {body}
      </div>
    </section>
  );
}
