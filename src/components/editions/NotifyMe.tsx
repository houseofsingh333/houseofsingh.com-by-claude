import FooterNewsletter from "@/components/layout/FooterNewsletter";
import { CONSENT } from "@/lib/email/consent";

/**
 * "Notify me" (Sealed and Closed): the footer's newsletter line reused,
 * with its brass postmark once the email is in, posting to the Shop's
 * route, which tags the person in Kit with the Collection. The consent
 * wording sits beneath the field (lib/email/consent.ts).
 */
export default function NotifyMe({ collection, thanks, idSuffix }: { collection: string; thanks: string; idSuffix: string }) {
  return (
    <div className="ed-notify">
      <FooterNewsletter
        placeholder="Your email address"
        thanks={thanks}
        endpoint="/api/editions/notify"
        extra={{ collection }}
        fieldLabel="Your email, to hear when the Collection opens"
        buttonText="Notify me"
        note={CONSENT.shop}
        idSuffix={idSuffix}
      />
    </div>
  );
}
