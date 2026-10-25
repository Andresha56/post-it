import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { graphqlRequest } from '../lib/graphqlClient';
import { CREATE_USER } from '../queries/user';
import { fetchAuthSession, getCurrentUser, signIn as amplifySignIn, signOut as amplifySignOut } from 'aws-amplify/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
type SignInResult = { ok: true } | { ok: false; reason: 'unconfirmed' | 'incomplete' };
type AuthValue = {
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

// Saves the Cognito profile in MongoDB. The backend upserts on the token's `sub`, so calling this on every
// sign-in is safe (no duplicates) and also retries a previous failure. It never blocks sign-in.
async function syncUser() {
  try {
    const { tokens } = await fetchAuthSession();
    const { name, email } = tokens?.idToken?.payload ?? {};
    if (typeof email !== 'string') throw new Error('Missing email in session');
    await graphqlRequest(CREATE_USER, { input: { name: typeof name === 'string' && name ? name : email, email } });
  } catch {
    toast.error("Signed in, but we couldn't save your profile. It will retry next time you sign in.");
  }
}

const AuthContext = createContext<AuthValue | null>(null);

// Authenticated only when Cognito holds a valid session with tokens. Registration alone never gets here:
// Cognito issues no tokens to a user until the email code has been confirmed.
async function hasVerifiedSession() {
  try {
    await getCurrentUser();
    const { tokens } = await fetchAuthSession();
    return Boolean(tokens?.accessToken && tokens.idToken?.payload.email_verified !== false);
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refresh = useCallback(async () => {
    setStatus((await hasVerifiedSession()) ? 'authenticated' : 'unauthenticated');
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<AuthValue>(() => ({
    status,
    async signIn(email, password) {
      try {
        // A stale session would make signIn throw "already signed in".
        if (await hasVerifiedSession()) await amplifySignOut();
        const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
        if (!isSignedIn) {
          return { ok: false, reason: nextStep.signInStep === 'CONFIRM_SIGN_UP' ? 'unconfirmed' : 'incomplete' };
        }
        await syncUser(); // before refresh(), so the sign-in form's loading state covers it
        await refresh();
        return { ok: true };
      } catch (error) {
        if (error instanceof Error && error.name === 'UserNotConfirmedException') return { ok: false, reason: 'unconfirmed' };
        throw error;
      }
    },
    async signOut() {
      await amplifySignOut();
      setStatus('unauthenticated');
    }
  }), [status, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
