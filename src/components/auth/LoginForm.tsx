"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, TextField, formValues } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { errorMessage } from "@/utils/errors";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password } = formValues(e.currentTarget);
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err, "Incorrect email or password."));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <TextField label="Email" name="email" type="email" autoComplete="email" required />
      <div className="flex flex-col gap-2">
        <TextField label="Password" name="password" type="password" autoComplete="current-password" required />
        <Link
          href="/forgot-password"
          className="self-end px-1 text-caption font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
        >
          Forgot password?
        </Link>
      </div>
      {error && <FormAlert>{error}</FormAlert>}
      <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
        Sign in
      </Button>
    </form>
  );
}
