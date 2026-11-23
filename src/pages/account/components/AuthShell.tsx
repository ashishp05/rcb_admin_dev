import type { ReactNode } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { PUBLIC_SITE_URL } from "../../../shared/constants/venue";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const highlights = [
  "Take cash, UPI and card walk-ins in seconds",
  "See today's slots, payments and SMS in one place",
  "Online and counter bookings never clash",
];

// Two-column auth layout: brand panel (hidden on small screens) + form card.
const AuthShell = ({ title, subtitle, children }: AuthShellProps) => (
  <div className="flex min-h-screen w-full bg-background">
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-900 p-12 text-white md:flex lg:p-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 80% 15%, rgba(200,242,58,.18), transparent 45%), repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 2px, transparent 2px 80px)",
        }}
      />
      <div className="relative flex items-center gap-3">
        <img src="/favicon.svg" alt="" className="h-12 w-12 rounded-xl" />
        <div className="leading-tight">
          <p className="font-display text-2xl font-extrabold tracking-wide">
            The <span className="text-secondary">Riverside</span> Cricket Box
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">Counter desk · Staff portal</p>
        </div>
      </div>
      <div className="relative">
        <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] lg:text-6xl">
          Run the desk.
          <br />
          <span className="text-secondary">Fill the box.</span>
        </h2>
        <ul className="mt-8 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-center gap-3 text-white/80">
              <FiCheckCircle className="h-5 w-5 shrink-0 text-secondary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-white/50">Ashmavati Riverfront, Porbandar</p>
    </div>

    <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
      <div className="mb-8 flex items-center gap-3 md:hidden">
        <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
        <p className="font-display text-xl font-extrabold">
          The <span className="text-primary">Riverside</span> Counter Desk
        </p>
      </div>
      <main className="w-full max-w-md rounded-2xl border border-default-200/60 bg-content1 p-8 shadow-sm dark:border-default-100/10 sm:p-10">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-default-700">{subtitle}</p>
        </div>
        {children}
      </main>
      <p className="mt-6 text-xs text-default-700">
        Not staff?{" "}
        <a className="font-medium text-primary hover:underline" href={PUBLIC_SITE_URL}>
          Go to the booking site
        </a>
      </p>
    </div>
  </div>
);

export default AuthShell;
