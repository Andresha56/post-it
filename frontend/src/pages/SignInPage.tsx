import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';
import { TextField } from '../components/auth/TextField';
import { useAuthForm } from '../components/auth/useAuthForm';
import { Button } from '../components/ui/Button';
import { signInSchema } from '../types';

export default function SignInPage() {
  const [notice, setNotice] = useState('');
  const form = useAuthForm(signInSchema, { email: '', password: '' }, () => {
    // TODO: call the real sign-in endpoint here, then redirect to the requested route
    // (e.g. location.state.from) or /dashboard. Intentionally does not authenticate.
    setNotice('Sign in is not connected to a backend yet.');
  });
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage and schedule your posts."
      footer={<>New to PostFlow? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></>}
    >
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <TextField label="Email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.values.email} onChange={form.setField('email')} error={form.errors.email} />
        <TextField label="Password" type="password" name="password" autoComplete="current-password" value={form.values.password} onChange={form.setField('password')} error={form.errors.password} />
        {notice && <p role="status" className="rounded-xl bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">{notice}</p>}
        <Button type="submit" className="w-full" disabled={form.submitting}>Sign in</Button>
      </form>
    </AuthShell>
  );
}
