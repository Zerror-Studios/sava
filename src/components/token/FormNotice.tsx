import { RiCheckboxCircleLine, RiInformationLine } from "@remixicon/react";
import { cn } from "@/utils/cn";

interface FormNoticeProps {
  /** success: the green "done" note; info: a quiet blue one (expired links, nothing left to do) */
  tone?: "success" | "info";
  children: React.ReactNode;
  className?: string;
}

/** A form's outcome in place of the form — FormAlert's shape, in success green or SAVA blue */
export default function FormNotice({ tone = "success", children, className }: FormNoticeProps) {
  const Icon = tone === "success" ? RiCheckboxCircleLine : RiInformationLine;
  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-caption",
        tone === "success" ? "border-success/20 bg-success/5 text-success" : "border-accent/20 bg-accent/5 text-ink",
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", tone === "info" && "text-accent")} />
      <span>{children}</span>
    </p>
  );
}
