import { Bike } from 'lucide-react';
import { Link } from 'react-router-dom';

/** CeyGo wordmark: teal tile with a bicycle, "Cey" + "Go". */
export default function Logo({ tone = 'dark', className = '' }) {
  const cey = tone === 'dark' ? 'text-white' : 'text-ink';
  const go = tone === 'dark' ? 'text-mint' : 'text-teal';
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`} aria-label="CeyGo home">
      <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-teal shadow-[0_6px_18px_-6px_rgba(20,184,166,0.6)] transition-transform duration-300 group-hover:-rotate-6">
        <Bike className="h-5 w-5 text-white" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[22px] font-extrabold tracking-[-0.03em]">
        <span className={cey}>Cey</span>
        <span className={go}>Go</span>
      </span>
    </Link>
  );
}
