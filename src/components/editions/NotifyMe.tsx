import FooterNewsletter from "@/components/layout/FooterNewsletter";
import { EDITIONS_DEFAULTS } from "@/lib/editions/defaults";

/**
 * "Notify me" (Sealed and Closed): the footer's newsletter line reused,
 * with its brass postmark once the email is in, posting to the Shop's own
 * list for the given Collection.
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
        note={EDITIONS_DEFAULTS.notifyNote}
        idSuffix={idSuffix}
      />
    </div>
  );
}
