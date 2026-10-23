import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { AuthShell } from '../components/auth/AuthShell';
import { TextField } from '../components/auth/TextField';
import { Button } from '../components/ui/Button';
import { authErrorMessage, errorName, maskEmail } from '../lib/authErrors';
import { verifyEmailSchema } from '../types';

type LocationState = { email?: string; codeSent?: boolean } | null;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  // Only the email travels in router state (in memory/history); never the password or a code.
  const state = useLocation().state as LocationState;
  const [email, setEmail] = useState(state?.email ?? '');
  const emailKnown = Boolean(state?.email);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(state?.codeSent ? 'We sent a verification code to your email.' : '');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const goToSignIn = (message: string) => navigate('/signin', { replace: true, state: { notice: message, email } });

  const validateEmail = () => {
    const parsed = verifyEmailSchema.shape.email.safeParse(email);
    if (parsed.success) return parsed.data;
    setErrors({ email: parsed.error.issues[0]?.message });
    return null;
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (verifying) return;
    const parsed = verifyEmailSchema.safeParse({ email, code });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as 'email' | 'code'] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setFormError('');
    setNotice('');
    setVerifying(true);
    try {
      await confirmSignUp({ username: parsed.data.email, confirmationCode: parsed.data.code });
      goToSignIn('Email verified. You can now sign in.');
    } catch (error) {
      if (errorName(error) === 'NotAuthorizedException' && error instanceof Error && /CONFIRMED/.test(error.message)) {
        // Cognito reports "User cannot be confirmed. Current status is CONFIRMED" this way.
        goToSignIn('Your email is already verified. Please sign in.');
        return;
      }
      setFormError(authErrorMessage(error));
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending || verifying) return;
    const target = validateEmail();
    if (!target) return;
    setErrors({});
    setFormError('');
    setNotice('');
    setResending(true);
    try {
      await resendSignUpCode({ username: target });
      setNotice('A new verification code is on its way. It may take a minute to arrive.');
    } catch (error) {
      if (errorName(error) === 'InvalidParameterException') {
        // Cognito rejects resend for users that are already confirmed.
        goToSignIn('Your email is already verified. Please sign in.');
        return;
      }
      setFormError(authErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  const busy = verifying || resending;

  return (
    <AuthShell
      title="Verify your email"
      description={emailKnown ? `Enter the 6-digit code we sent to ${maskEmail(email)}.` : 'Enter your email address and the 6-digit code we sent you.'}
      footer={<>Wrong address? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Back to sign up</Link></>}
    >
      <form onSubmit={handleVerify} noValidate className="space-y-5">
        {!emailKnown && (
          <TextField label="Email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        )}
        <TextField label="Verification code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} error={errors.code} />
        <div aria-live="polite">
          {formError && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{formError}</p>}
          {notice && <p role="status" className="rounded-xl bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">{notice}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>{verifying ? 'Verifying…' : 'Verify email'}</Button>
        <Button variant="secondary" className="w-full" onClick={handleResend} disabled={busy}>
          {emailKnown ? (resending ? 'Sending…' : 'Resend verification code') : 'Continue'}
        </Button>
      </form>
    </AuthShell>
  );
}
