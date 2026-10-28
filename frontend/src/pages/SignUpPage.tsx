import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "aws-amplify/auth";
import { AuthShell } from "../components/auth/AuthShell";
import { TextField } from "../components/auth/TextField";
import { useAuthForm } from "../components/auth/useAuthForm";
import { Button } from "../components/ui/Button";
import { authErrorMessage, errorName } from "../lib/authErrors";
import { signUpSchema } from "../types";

export default function SignUpPage() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const form = useAuthForm(
    signUpSchema,
    { name: "", email: "", password: "" },
    async ({ name, email, password }) => {
      setError("");
      try {
        const { nextStep } = await signUp({
          username: email,
          password,
          options: { userAttributes: { email, name } },
        });
        if (nextStep.signUpStep === "DONE") {
          navigate("/signin", {
            state: { notice: "Your account is ready. Please sign in.", email },
          });
          return;
        }
        // Cognito has emailed a code; the user must confirm it before they can sign in.
        navigate("/verify-email", { state: { email, codeSent: true } });
      } catch (err) {
        if (errorName(err) === "UsernameExistsException") {
          setError(
            "An account with this email already exists. If you never verified it, use the link below to enter your code.",
          );
        } else {
          setError(authErrorMessage(err));
        }
      }
    },
  );
  return (
    <AuthShell
      title="Create your account"
      description="Start scheduling posts in a few minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
          {error.includes("never verified") && (
            <>
              {" "}
              ·{" "}
              <Link
                to="/verify-email"
                state={{ email: form.values.email.trim() }}
                className="font-semibold text-primary hover:underline"
              >
                Enter verification code
              </Link>
            </>
          )}
        </>
      }
    >
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          value={form.values.name}
          onChange={form.setField("name")}
          error={form.errors.name}
        />
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
          autoComplete="new-password"
          value={form.values.password}
          onChange={form.setField("password")}
          error={form.errors.password}
        />
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-error-bg px-3.5 py-2.5 text-sm text-error"
          >
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={form.submitting}>
          {form.submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
