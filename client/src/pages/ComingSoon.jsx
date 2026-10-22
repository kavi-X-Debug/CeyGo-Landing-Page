import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';

/**
 * Placeholder for parts of CeyGo that are not part of the landing page yet
 * (rider app, reports, legal pages). No fake functionality.
 */
export default function ComingSoon({ title, text }) {
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-night px-5 text-white">
      <div className="grid-texture pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/30 blur-[120px]" aria-hidden="true" />
      <div className="relative max-w-lg text-center">
        <Logo className="justify-center" />
        <h1 className="mt-10 text-[40px] font-extrabold leading-none tracking-[-0.045em] md:text-[56px]">{title}</h1>
        <p className="mt-5 text-lg text-white/65">{text}</p>
        <Link to="/" className="btn-mint mt-10 h-12 px-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
        </Link>
      </div>
    </main>
  );
}
