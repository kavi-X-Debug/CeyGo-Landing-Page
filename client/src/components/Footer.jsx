import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { ROUTES } from '../lib/content.js';

const COLS = [
  {
    title: 'Explore',
    links: [
      ['How it works', '#how-it-works'],
      ['Features', '#features'],
      ['Pricing', '#pricing'],
      ['FAQ', '#faq'],
    ],
  },
  {
    title: 'Platform',
    links: [
      ['Rent a bike', ROUTES.rent],
      ['Report a problem', ROUTES.report],
    ],
  },
  {
    title: 'Information',
    links: [
      ['Contact', '/contact'],
      ['Privacy policy', '/privacy'],
      ['Terms of use', '/terms'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-night text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-white/60">Smart bicycle sharing, made simple.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-white">{c.title}</h2>
            <ul className="mt-4 space-y-3">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith('#') ? (
                    <a href={href} className="link-underline text-white/60 hover:text-mint">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} className="link-underline text-white/60 hover:text-mint">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-6 text-sm text-white/45">© 2026 CeyGo. All rights reserved.</p>
      </div>
    </footer>
  );
}
