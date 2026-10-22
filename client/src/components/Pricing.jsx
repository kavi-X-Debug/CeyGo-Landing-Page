import { Link } from 'react-router-dom';
import { Check, Info } from 'lucide-react';
import { ROUTES, PRICE_PER_MINUTE } from '../lib/content.js';

const INCLUDED = ['No unlock fee', 'Transparent pricing', 'Live ride-cost display', 'Automatic cost calculation', 'Ride history', 'Problem reporting'];

export default function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="scroll-mt-24 bg-paper py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <h2 id="pricing-heading" data-reveal className="section-title max-w-md">
            Simple pricing. More freedom.
          </h2>
          <p data-reveal className="section-lead mt-5 max-w-md">
            Pay only for the time you ride. The cost is shown live on your phone while you ride.
          </p>
          <div data-reveal className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
            <span className="text-sm text-muted">Example</span>
            <span className="font-semibold text-ink">30-minute ride</span>
            <span className="text-muted">=</span>
            <span className="text-xl font-extrabold tracking-tight text-teal">LKR {30 * PRICE_PER_MINUTE}</span>
          </div>
        </div>

        <div data-reveal>
        <div data-tilt="2" data-spotlight className="relative overflow-hidden rounded-[32px] bg-night p-8 text-white md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal/50 blur-[90px]" aria-hidden="true" />
          <div className="relative">
            <p className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-bold text-night">Pay as you ride</p>
            <p className="mt-6 flex items-end gap-3">
              <span className="pb-3 text-2xl font-bold text-white/60">LKR</span>
              <span className="text-[96px] font-extrabold leading-none tracking-[-0.06em] md:text-[120px]">{PRICE_PER_MINUTE}</span>
              <span className="pb-4 text-xl text-white/60">/ minute</span>
            </p>
            <p className="mt-2 text-white/70">Pay only for the time you ride.</p>
            <ul className="mt-8 grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-2">
              {INCLUDED.map((t) => (
                <li key={t} className="group flex items-center gap-3 text-white/85 transition-colors hover:text-white">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mint/15 transition-all duration-300 group-hover:scale-110 group-hover:bg-mint/30">
                    <Check className="h-3.5 w-3.5 text-mint" aria-hidden="true" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link to={ROUTES.rent} data-magnetic className="btn-mint mt-10 h-14 w-full text-base">
              Start riding
            </Link>
            <p className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-white">Prototype payment mode:</strong> Transactions are demonstrations only. No real money is
                charged, and no card or wallet information is collected.
              </span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
