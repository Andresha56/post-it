const steps = [
  { title: 'Connect your social accounts', body: 'Add the accounts you want to publish to.' },
  { title: 'Create a post and choose when', body: 'Write your caption, then pick a date and time on the calendar.' },
  { title: 'Let PostFlow publish it', body: 'Your post goes out at the scheduled time, and its status updates as it does.' }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-[#321923] text-white">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <p className="text-sm font-semibold text-[#FFB4C0]">How it works</p>
        <h2 className="mt-3 max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">Three steps, then it runs on its own</h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="md:border-t md:border-white/15 md:pt-6">
              <span className="text-sm font-semibold tabular-nums text-[#F45B72]">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-white/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
