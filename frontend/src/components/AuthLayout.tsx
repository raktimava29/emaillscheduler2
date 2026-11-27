import Logo from "./ui/Logo";
import SendDial from "./SendDial";

export default function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between gap-10 bg-cobalt p-12 text-white lg:flex">
        <Logo inverted />
        <div>
          <p className="max-w-md font-display text-5xl font-extrabold leading-[1.05]">
            Write now. Send at the right moment.
          </p>
          <p className="mt-5 max-w-sm text-lg text-white/85">
            Draft job outreach from your resume and schedule it through your own Gmail.
          </p>
        </div>
        <SendDial />
      </section>

      <main className="flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="card w-full max-w-md animate-rise shadow-xl shadow-cobalt/10">
          <div className="airmail" />
          <div className="p-6 sm:p-8">
            <h1 className="mb-6 text-3xl font-extrabold">{title}</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
