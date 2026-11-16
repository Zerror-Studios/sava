import { ButtonLink } from "@/components/ui/Button";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

interface StatusPanelProps {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body?: React.ReactNode;
  tone?: "accent" | "sale";
  actions?: { href: string; label: string; variant?: "outline" }[];
  children?: React.ReactNode;
}

/** The centred status page the payment-failed page uses: icon, kicker, h1, a line and actions */
export default function StatusPanel({
  icon,
  kicker,
  title,
  body,
  tone = "accent",
  actions = [],
  children,
}: StatusPanelProps) {
  return (
    <Frame className="py-section">
      <FrameRule />
      <div className="flex flex-col items-center gap-6 px-inset py-14 text-center md:py-20">
        <span
          aria-hidden="true"
          className={cn(
            "center size-16 rounded-full",
            tone === "sale" ? "bg-sale/10 text-sale" : "bg-accent/10 text-accent",
          )}
        >
          {icon}
        </span>
        <p className={cn("flex items-center gap-2 text-kicker", tone === "sale" ? "text-sale" : "text-accent")}>
          <Sparkle />
          {kicker}
        </p>
        <h1 data-heading-effect className="max-w-3xl">
          {title}
        </h1>
        {body && (
          <p data-reveal className="max-w-xl text-body-lg text-muted">
            {body}
          </p>
        )}
        {children}
        {actions.length > 0 && (
          <div data-reveal className="mt-2 flex flex-wrap justify-center gap-3">
            {actions.map((action) => (
              <ButtonLink key={action.href} href={action.href} size="lg" variant={action.variant}>
                {action.label}
              </ButtonLink>
            ))}
          </div>
        )}
      </div>
      <FrameRule />
    </Frame>
  );
}
