import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../lib/content.js';

export default function FinalCTA() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <section aria-labelledby="cta-heading" className="bg-white pb-24 md:pb-32">
      <div className="wrap">
        <div
          data-reveal
          data-spotlight
          className="group relative overflow-hidden rounded-[36px] bg-[radial-gradient(ellipse_at_70%_40%,#0F766E_0%,#0B2E2B_45%,#04201D_100%)] px-7 py-14 md:px-14 md:py-20"
        >
          {imgOk && (
            <img
              src="/frames/poster-fleet.webp"
              alt="Three CeyGo bicycles lined up"
              loading="lazy"
              onError={() => setImgOk(false)}
              className="pointer-events-none absolute -right-[12%] bottom-0 hidden h-[115%] w-auto max-w-none opacity-90 transition-transform duration-[1.2s] ease-out group-hover:-translate-x-4 group-hover:scale-[1.04] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_72%)] lg:block"
            />
          )}
          <div className="relative max-w-xl">
            <h2 id="cta-heading" className="text-[44px] font-extrabold leading-[0.98] tracking-[-0.045em] text-white md:text-[64px]">
              Your next ride is one scan away.
            </h2>
            <p className="mt-5 text-lg text-white/70">Discover a simpler, smarter way to explore your surroundings.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={ROUTES.rent} data-magnetic className="btn-mint h-14 px-7 text-base">
                Rent a bike now <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="btn-ghost h-14 px-7 text-base">
                Learn how it works
              </a>
            </div>
          </div>
          {imgOk && (
            <img
              src="/frames/poster-fleet.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="relative mt-10 w-full [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_75%)] lg:hidden"
            />
          )}
        </div>
      </div>
    </section>
  );
}
