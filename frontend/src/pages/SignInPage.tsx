import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { resendSignUpCode } from "aws-amplify/auth";
import { AuthShell } from "../components/auth/AuthShell";
import { TextField } from "../components/auth/TextField";
import { useAuthForm } from "../components/auth/useAuthForm";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { authErrorMessage } from "../lib/authErrors";
import { signInSchema } from "../types";

type LocationState = { notice?: string; email?: string; from?: string } | null;

export default function SignInPage() {
  const state = useLocation().state as LocationState;
  const navigate = useNavigate();
  const { status, signIn } = useAuth();
  const [notice, setNotice] = useState(state?.notice ?? "");
  const [error, setError] = useState("");
  const form = useAuthForm(
    signInSchema,
    { email: state?.email ?? "", password: "" },
    async ({ email, password }) => {
      setError("");
      setNotice("");
      try {
        const result = await signIn(email, password);
        if (result.ok) {
          navigate(
            state?.from && state.from.startsWith("/")
              ? state.from
              : "/dashboard",
            { replace: true },
          );
        } else if (result.reason === "unconfirmed") {
          // Unverified accounts never get a session: send them to verification with a fresh code.
          await resendSignUpCode({ username: email }).catch(() => undefined);
          navigate("/verify-email", { state: { email, codeSent: true } });
        } else {
          setError(
            "Additional sign-in steps are required for this account, which are not supported yet.",
          );
        }
      } catch (err) {
        setError(authErrorMessage(err));
      }
    },
  );
  if (status === "authenticated" && !form.submitting)
    return <Navigate to="/dashboard" replace />;
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage and schedule your posts."
      footer={
        <>
          New to Orbit?{" "}
          <Link
            to="/signup"
            className="font-semibold text-brand-600 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.values.email}
          onChange={form.setField("email")}
          error={form.errors.email}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.setField("password")}
          error={form.errors.password}
        />
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-xl bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]"
          >
            {notice}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={form.submitting}>
          {form.submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
