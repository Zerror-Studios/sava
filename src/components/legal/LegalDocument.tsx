import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";

/** The store's contact email (siteConfig.contact.email) as an inline link for policy copy */
export function ContactEmail() {
  const { email } = siteConfig.contact;
  return (
    <a
      href={`mailto:${email}`}
      className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {email}
    </a>
  );
}

export interface LegalSection {
  /** Anchor for the contents list, e.g. "cookies" → #cookies */
  id: string;
  title: string;
  paragraphs: React.ReactNode[];
}

interface LegalDocumentProps {
  title: string;
  description: string;
  /** e.g. "November 2026" */
  updated: string;
  sections: LegalSection[];
}

/**
 * A framed policy page (privacy, terms, shipping, licences): the h1 band, then a contents list beside
 * the sections on wide screens — the contact page's two-column frame. Static: no API calls.
 */
export default function LegalDocument({ title, description, updated, sections }: LegalDocumentProps) {
  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader eyebrow="Legal" title={title} description={description} align="center" className="px-inset py-10" />
      <FrameRule />

      <div className="grid lg:grid-cols-12">
        <aside className="px-inset py-10 md:py-14 lg:col-span-4 lg:border-r lg:border-line">
          <nav aria-label="On this page" className="flex flex-col gap-4 lg:sticky lg:top-32">
            <p className="text-kicker text-accent">On this page</p>
            <ol data-reveal="stagger" className="flex flex-col gap-3 text-body">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-3 text-muted transition-colors hover:text-ink">
                    <span className="text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="text-caption text-muted">Last updated: {updated}</p>
          </nav>
        </aside>
        <FrameRule className="lg:hidden" />

        <div className="flex flex-col gap-12 px-inset py-10 md:py-14 lg:col-span-8">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} data-reveal className="flex scroll-mt-32 flex-col gap-4">
              <h2 className="flex gap-3 text-h4">
                <span className="text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph, j) => (
                <p key={j} className="max-w-3xl text-body-lg text-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Frame>
  );
}
