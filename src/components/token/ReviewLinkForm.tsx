"use client";

import { RiStarFill, RiStarLine } from "@remixicon/react";
import { useReviewLink } from "@zcom/storefront-kit/client";
import { takeQueryParams } from "@zcom/storefront-kit/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import FormNotice from "@/components/token/FormNotice";
import { Button, ButtonLink } from "@/components/ui/Button";
import Skeleton, { SkeletonLine } from "@/components/ui/Skeleton";
import { FormAlert, TextArea, TextField, formValues } from "@/components/ui/form";
import { cn } from "@/utils/cn";
import { errorMessage } from "@/utils/errors";
import { mediaUrl } from "@/utils/media";

/** 1–5 stars as a radio group: keyboard arrows move between them, the filled ones show the choice */
function StarRating({ name, value, onChange }: { name: string; value: number; onChange: (value: number) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-caption font-medium text-ink">Your rating</legend>
      <div className="flex gap-1 text-star">
        {[1, 2, 3, 4, 5].map((n) => {
          const Star = n <= value ? RiStarFill : RiStarLine;
          return (
            <label
              key={n}
              className="center size-10 cursor-pointer rounded-full transition-colors hover:bg-surface has-focus-visible:ring-4 has-focus-visible:ring-accent/15"
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="sr-only"
              />
              <Star aria-hidden="true" className="size-6" />
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Message({ tone, children }: { tone?: "success" | "info"; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <FormNotice tone={tone}>{children}</FormNotice>
      <ButtonLink href="/shop" size="lg" variant="outline" className="self-start">
        Continue shopping
      </ButtonLink>
    </div>
  );
}

/**
 * /review?token=… from the review-request email (no sign-in). The link covers a whole order: each
 * product not yet reviewed gets a rating, an optional title and a comment, sent together.
 * The server page passes the token (so the first render is already right); the kit's
 * takeQueryParams then strips it from the address bar.
 */
export default function ReviewLinkForm({ token }: { token: string | null }) {
  const { order, loading, error, submit } = useReviewLink(token);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    takeQueryParams(["token"]);
  }, []);

  if (sent) {
    return <Message>Thank you — your review has been sent. It helps others find their SAVA.</Message>;
  }
  if (token && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-2xl" />
          <SkeletonLine role="text-h5" className="w-48" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }
  if (!token || error || !order) {
    return (
      <Message tone="info">
        This review link is invalid or has expired. Links work for a limited time — check for a newer email from us.
      </Message>
    );
  }

  const pending = order.items.filter((item) => !item.review);
  if (pending.length === 0) {
    return <Message tone="info">You&apos;ve already reviewed everything in this order — thank you!</Message>;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = formValues(e.currentTarget);

    const rated = pending.filter((item) => ratings[item.productId]);
    const found: Record<string, string> = {};
    for (const item of rated) {
      if (!v[`comment-${item.productId}`]) found[item.productId] = "Tell us a little about it.";
    }
    setFieldErrors(found);
    setFormError(rated.length ? "" : "Choose a star rating for at least one product.");
    if (!rated.length || Object.keys(found).length) return;

    setSending(true);
    try {
      await submit(
        rated.map((item) => ({
          productId: item.productId,
          rating: ratings[item.productId],
          title: v[`title-${item.productId}`] || undefined,
          comment: v[`comment-${item.productId}`],
          displayName: v.displayName || undefined,
        })),
      );
      setSent(true);
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't send your review. Please try again."));
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {order.orderNo && (
        <p className="text-caption text-muted">
          Order <span className="font-medium text-ink tabular-nums">#{order.orderNo}</span>
        </p>
      )}

      {pending.map((item, i) => (
        <section
          key={item.productId}
          aria-labelledby={`review-${item.productId}`}
          className={cn("flex flex-col gap-5", i > 0 && "border-t border-line pt-8")}
        >
          <div className="flex items-center gap-4">
            <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
              <Image src={mediaUrl(item.imageUrl)} alt="" fill sizes="5rem" className="object-cover" />
            </span>
            <h2 id={`review-${item.productId}`} className="text-h5">
              {item.name || "Your product"}
            </h2>
          </div>
          <StarRating
            name={`rating-${item.productId}`}
            value={ratings[item.productId] ?? 0}
            onChange={(n) => setRatings((r) => ({ ...r, [item.productId]: n }))}
          />
          <TextField label="Title (optional)" name={`title-${item.productId}`} maxLength={120} />
          <TextArea
            label="Your review"
            name={`comment-${item.productId}`}
            maxLength={2000}
            error={fieldErrors[item.productId]}
          />
        </section>
      ))}

      <TextField
        label="Display name"
        name="displayName"
        defaultValue={order.displayName ?? ""}
        autoComplete="given-name"
        hint="Shown with your review"
        maxLength={60}
        className="border-t border-line pt-8"
      />
      {formError && <FormAlert>{formError}</FormAlert>}
      <Button type="submit" size="lg" loading={sending} className="self-start">
        {pending.length > 1 ? "Send reviews" : "Send review"}
      </Button>
    </form>
  );
}
