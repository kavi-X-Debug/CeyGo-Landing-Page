import { useId, useState } from 'react';
import { Plus } from 'lucide-react';

const ITEMS = [
  ['Do I need to install an app?', 'No. CeyGo works through your mobile browser without requiring an app installation.'],
  ['How do I unlock a bicycle?', 'Find a station, request a one-time QR code, and show it to the station camera for verification.'],
  ['How long is my QR code valid?', 'Each QR code expires after 60 seconds and can only be used once.'],
  ['How long do I have to collect my bicycle?', 'You have 30 seconds after the slot unlocks.'],
  ['Can I return a bicycle to another station?', 'You can return it to an available compatible smart-lock slot at a supported CeyGo station.'],
  ['How much does a ride cost?', 'LKR 5 per minute, with no unlocking fee.'],
  ['Do I need to provide bank card details?', 'No. The current prototype uses demo payments only.'],
];

function Item({ q, a, open, onToggle }) {
  const id = useId();
  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold tracking-[-0.01em] text-ink transition-all duration-300 hover:pl-2 hover:text-teal md:text-xl"
        >
          {q}
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${
              open ? 'rotate-45 bg-night text-mint' : 'bg-paper text-ink group-hover:rotate-90 group-hover:bg-teal group-hover:text-white'
            }`}
            aria-hidden="true"
          >
            <Plus className="h-4 w-4" />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 text-[17px] leading-relaxed text-muted">{a}</p>
        </div>
      </div>
    </li>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 bg-white py-24 md:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 id="faq-heading" data-reveal className="section-title">
            Questions, answered.
          </h2>
          <p data-reveal className="section-lead mt-5 max-w-sm">
            Everything you need to know before your first ride.
          </p>
        </div>
        <ul data-reveal className="border-t border-line">
          {ITEMS.map(([q, a], i) => (
            <Item key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
