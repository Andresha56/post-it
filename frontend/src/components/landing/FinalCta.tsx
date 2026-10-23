import { LinkButton } from './LinkButton';

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 text-center sm:px-8 lg:py-28">
      <h2 className="mx-auto max-w-xl text-balance text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">Put your next week of posts on autopilot</h2>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-[var(--text-muted)]">Create an account and schedule your first post in minutes.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton to="/signup" size="lg">Create your account</LinkButton>
        <LinkButton to="/signin" variant="secondary" size="lg">Sign in</LinkButton>
      </div>
    </section>
  );
}
