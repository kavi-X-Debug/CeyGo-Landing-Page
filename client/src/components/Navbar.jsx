import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { NAV_LINKS, ROUTES } from '../lib/content.js';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <nav
        aria-label="Main"
        className={`mx-auto flex h-16 max-w-site items-center justify-between rounded-full border pl-4 pr-2 transition-all duration-500 md:pl-5 ${
          scrolled || open
            ? 'border-white/10 bg-night/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl'
            : 'border-white/10 bg-white/[0.04] backdrop-blur-md'
        }`}
      >
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to={ROUTES.rent} data-magnetic className="btn-mint h-11 px-5 text-[15px]">
            Rent a bike
          </Link>
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="mx-auto mt-2 max-w-site rounded-3xl border border-white/10 bg-night/95 p-4 backdrop-blur-xl lg:hidden"
      >
        <ul className="flex flex-col">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-base font-semibold text-white/85 hover:bg-hover">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link to={ROUTES.rent} className="btn-mint mt-3 h-12 w-full">
          Rent a bike
        </Link>
      </div>
    </header>
  );
}
