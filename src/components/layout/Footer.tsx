import { siteSettings } from "@/lib/placeholder-data";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-neutral-500">
        <p>{siteSettings.footerText}</p>
      </div>
    </footer>
  );
}
