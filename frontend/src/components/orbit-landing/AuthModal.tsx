import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode, signUp } from 'aws-amplify/auth';
import { Check, Loader2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authErrorMessage, errorName, maskEmail } from '../../lib/authErrors';
import { signInSchema, signUpSchema, verifyEmailSchema } from '../../types';
import type { AuthMode } from './types';

const inputCls =
    'h-10 w-full rounded-[12px] border border-orbit-border bg-orbit-background px-3.5 text-sm outline-none transition-colors placeholder:text-orbit-muted-foreground focus:border-orbit-brand/50';

/**
 * The Emergent-designed auth UI (exact visual language from the landing
 * integration) driven by the app's existing AWS Cognito implementation:
 * useAuth().signIn for login + session/token handling, aws-amplify signUp /
 * confirmSignUp / resendSignUpCode for registration and email verification.
 */
export default function AuthModal({
    open,
    onOpenChange,
    mode,
    onModeChange,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    mode: AuthMode;
    onModeChange: (m: AuthMode) => void;
}) {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
    const [values, setValues] = useState({ name: '', email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');
    const [verifyStep, setVerifyStep] = useState(false);
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    const setField =
        (key: keyof typeof values) =>
        (e: { target: { value: string } }) =>
            setValues((c) => ({ ...c, [key]: e.target.value }));

    const close = () => onOpenChange(false);

    const collectIssues = (path: string, message: string) =>
        setFieldErrors((prev) => ({ ...prev, [path]: message }));

    const setMode = (m: AuthMode) => {
        onModeChange(m);
        setFieldErrors({});
        setFormError('');
        setNotice('');
        setVerifyStep(false);
        setCode('');
        setStatus('idle');
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (status !== 'idle') return;
        setFormError('');
        setNotice('');

        if (mode === 'signup') {
            const parsed = signUpSchema.safeParse(values);
            if (!parsed.success) {
                setFieldErrors({});
                for (const issue of parsed.error.issues)
                    collectIssues(issue.path[0] as string, issue.message);
                return;
            }
            setFieldErrors({});
            setStatus('loading');
            try {
                const { nextStep } = await signUp({
                    username: parsed.data.email,
                    password: parsed.data.password,
                    options: {
                        userAttributes: {
                            email: parsed.data.email,
                            name: parsed.data.name,
                        },
                    },
                });
                if (nextStep.signUpStep === 'DONE') {
                    // Pool verifies automatically: continue with the normal Cognito sign-in.
                    const result = await signIn(parsed.data.email, parsed.data.password);
                    if (result.ok) {
                        setStatus('done');
                        toast.success('Welcome to Orbit!');
                        close();
                        navigate('/dashboard', { replace: true });
                    } else {
                        setVerifyStep(true);
                        setNotice('We sent a verification code to your email.');
                    }
                } else {
                    // Cognito has emailed a code; the user must confirm it before signing in.
                    setVerifyStep(true);
                    setNotice('We sent a verification code to your email.');
                    toast.success('Check your inbox for the verification code.');
                }
                return;
            } catch (err) {
                setStatus('idle');
                if (errorName(err) === 'UsernameExistsException') {
                    setFormError(
                        'An account with this email already exists. If you never verified it, enter your verification code below.',
                    );
                    setVerifyStep(true);
                } else {
                    setFormError(authErrorMessage(err));
                }
            }
            return;
        }

        // login — reuses the existing useAuth Cognito flow (tokens, session, sync, redirect).
        const parsed = signInSchema.safeParse({ email: values.email, password: values.password });
        if (!parsed.success) {
            setFieldErrors({});
            for (const issue of parsed.error.issues)
                collectIssues(issue.path[0] as string, issue.message);
            return;
        }
        setFieldErrors({});
        setStatus('loading');
        try {
            const result = await signIn(parsed.data.email, parsed.data.password);
            if (result.ok) {
                setStatus('done');
                toast.success('Welcome back!');
                close();
                navigate('/dashboard', { replace: true });
            } else if (result.reason === 'unconfirmed') {
                setStatus('idle');
                setVerifyStep(true);
                setNotice('We sent a verification code to your email.');
            } else {
                setStatus('idle');
                setFormError(
                    'Additional sign-in steps are required for this account, which are not supported yet.',
                );
            }
        } catch (err) {
            setStatus('idle');
            setFormError(authErrorMessage(err));
        }
    };

    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        if (verifying) return;
        const parsed = verifyEmailSchema.safeParse({ email: values.email, code });
        if (!parsed.success) {
            setFieldErrors({});
            for (const issue of parsed.error.issues)
                collectIssues(issue.path[0] as string, issue.message);
            return;
        }
        setFieldErrors({});
        setFormError('');
        setVerifying(true);
        try {
            await confirmSignUp({
                username: parsed.data.email,
                confirmationCode: parsed.data.code,
            });
            toast.success('Email verified. You can now sign in.');
            setMode('login');
        } catch (error) {
            if (
                errorName(error) === 'NotAuthorizedException' &&
                error instanceof Error &&
                /CONFIRMED/.test(error.message)
            ) {
                toast.success('Your email is already verified. Please sign in.');
                setMode('login');
                return;
            }
            setFormError(authErrorMessage(error));
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resending || verifying) return;
        const parsed = verifyEmailSchema.shape.email.safeParse(values.email);
        if (!parsed.success) {
            collectIssues('email', parsed.error.issues[0]?.message ?? 'Enter your email address.');
            return;
        }
        setFormError('');
        setResending(true);
        try {
            await resendSignUpCode({ username: parsed.data });
            setNotice('A new verification code is on its way. It may take a minute to arrive.');
        } catch (error) {
            if (errorName(error) === 'InvalidParameterException') {
                toast.success('Your email is already verified. Please sign in.');
                setMode('login');
                return;
            }
            setFormError(authErrorMessage(error));
        } finally {
            setResending(false);
        }
    };

    const busy = status === 'loading' || verifying || resending;

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
                <Dialog.Content
                    data-testid="auth-modal"
                    className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] border border-orbit-border bg-orbit-card p-8 shadow-[0_48px_90px_-30px_rgba(10,10,20,0.5)]"
                >
                    <Dialog.Close
                        data-testid="auth-modal-close"
                        aria-label="Close"
                        className="absolute right-4 top-4 grid size-8 place-items-center rounded-[10px] text-orbit-muted-foreground transition-colors hover:bg-orbit-foreground/5 hover:text-orbit-foreground"
                    >
                        <X className="size-4" />
                    </Dialog.Close>

                    <div className="flex flex-col items-center text-center">
                        <span className="grid size-10 place-items-center rounded-[10px] bg-primary text-primary-foreground">
                            <svg width="24" height="24" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M7 17 12.5 5.5 18 24.5 23.5 12.5" />
                                <path d="M7.5 21.5 11 14M19.5 19.5 23 11.5" strokeWidth="1.8" opacity=".7" />
                            </svg>
                        </span>
                        <Dialog.Title className="orbit-font-display mt-4 text-2xl font-semibold tracking-tight">
                            {verifyStep
                                ? 'Verify your email'
                                : mode === 'signup'
                                  ? 'Create your account'
                                  : 'Welcome back'}
                        </Dialog.Title>
                        <Dialog.Description className="mt-1.5 text-sm text-orbit-muted-foreground">
                            {verifyStep ? (
                                <>
                                    Enter the 6-digit code we sent to{' '}
                                    <span className="font-medium">{maskEmail(values.email)}</span>.
                                </>
                            ) : mode === 'signup' ? (
                                'Start managing all your social media in one place.'
                            ) : (
                                'Log in to your Orbit workspace.'
                            )}
                        </Dialog.Description>
                    </div>

                    {!verifyStep && (
                        <div className="mt-6 grid grid-cols-2 rounded-[12px] border border-orbit-border bg-orbit-surface p-1">
                            {(['signup', 'login'] as AuthMode[]).map((m) => (
                                <button
                                    key={m}
                                    data-testid={`auth-tab-${m}`}
                                    type="button"
                                    onClick={() => setMode(m)}
                                    className={`rounded-[10px] py-1.5 text-sm font-medium transition-all ${
                                        mode === m
                                            ? 'bg-orbit-card text-orbit-foreground shadow-sm'
                                            : 'text-orbit-muted-foreground'
                                    }`}
                                >
                                    {m === 'signup' ? 'Sign up' : 'Log in'}
                                </button>
                            ))}
                        </div>
                    )}

                    {notice && (
                        <p className="mt-5 rounded-[10px] bg-orbit-brand/10 px-3 py-2 text-center text-xs text-orbit-brand">
                            {notice}
                        </p>
                    )}
                    {formError && (
                        <p
                            data-testid="auth-form-error"
                            className="mt-5 rounded-[10px] bg-error/10 px-3 py-2 text-center text-xs text-error"
                        >
                            {formError}
                        </p>
                    )}

                    {verifyStep ? (
                        <form onSubmit={handleVerify} className="mt-5 space-y-3">
                            <input
                                data-testid="auth-input-code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={inputCls}
                            />
                            <button
                                data-testid="auth-verify-button"
                                type="submit"
                                disabled={busy}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-orbit-brand text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                            >
                                {verifying ? <Loader2 className="size-4 animate-spin" /> : 'Verify email'}
                            </button>
                            <button
                                data-testid="auth-resend-button"
                                type="button"
                                onClick={handleResend}
                                disabled={busy}
                                className="inline-flex h-10 w-full items-center justify-center rounded-[12px] border border-orbit-border bg-orbit-background text-sm font-medium transition-colors hover:border-orbit-brand/40 disabled:opacity-70"
                            >
                                {resending ? <Loader2 className="size-4 animate-spin" /> : 'Resend verification code'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="w-full text-center text-xs text-orbit-muted-foreground transition-colors hover:text-orbit-foreground"
                            >
                                Back to sign in
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={submit} className="mt-5 space-y-3">
                            {mode === 'signup' && (
                                <div>
                                    <input
                                        data-testid="auth-input-name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Full name"
                                        value={values.name}
                                        onChange={setField('name')}
                                        className={`${inputCls} ${fieldErrors.name ? 'border-error' : ''}`}
                                    />
                                    {fieldErrors.name && (
                                        <p className="mt-1 text-xs text-error">{fieldErrors.name}</p>
                                    )}
                                </div>
                            )}
                            <div>
                                <input
                                    data-testid="auth-input-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    value={values.email}
                                    onChange={setField('email')}
                                    className={`${inputCls} ${fieldErrors.email ? 'border-error' : ''}`}
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-xs text-error">{fieldErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    data-testid="auth-input-password"
                                    type="password"
                                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    placeholder="Password"
                                    value={values.password}
                                    onChange={setField('password')}
                                    className={`${inputCls} ${fieldErrors.password ? 'border-error' : ''}`}
                                />
                                {fieldErrors.password && (
                                    <p className="mt-1 text-xs text-error">{fieldErrors.password}</p>
                                )}
                            </div>
                            <button
                                data-testid="auth-submit-button"
                                type="submit"
                                disabled={status !== 'idle'}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-orbit-brand text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : status === 'done' ? (
                                    <>
                                        <Check className="size-4" /> You&apos;re in
                                    </>
                                ) : mode === 'signup' ? (
                                    'Create free account'
                                ) : (
                                    'Log in'
                                )}
                            </button>
                        </form>
                    )}

                    <p className="orbit-font-mono mt-5 text-center text-[10px] uppercase tracking-wider text-orbit-muted-foreground">
                        Secured with AWS Cognito — email &amp; password only
                    </p>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
