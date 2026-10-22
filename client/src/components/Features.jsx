import { Lock, MapPinned, QrCode, Receipt, MessageSquareWarning } from 'lucide-react';
import { MapArt, QrGlyph, DockMock, CostMock, PhoneFrame, ReportScreen } from './mockups.jsx';

function FeatureHead({ icon: Icon, title, text, dark = false }) {
  return (
    <div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? 'bg-hover text-mint' : 'bg-[#E6F4F1] text-teal'}`}>
        <Icon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true" />
      </span>
      <h3 className={`mt-5 text-2xl font-extrabold tracking-[-0.03em] ${dark ? 'text-white' : 'text-ink'}`}>{title}</h3>
      <p className={`mt-2 max-w-md leading-relaxed ${dark ? 'text-white/65' : 'text-muted'}`}>{text}</p>
    </div>
  );
}

const lift = 'group transition-[box-shadow,border-color] duration-500 hover:shadow-[0_30px_60px_-30px_rgba(4,32,29,0.45)]';

export default function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="scroll-mt-24 bg-white py-24 md:py-32">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" data-reveal className="section-title">
            Smart technology behind every ride.
          </h2>
          <p data-reveal className="section-lead mx-auto mt-5 max-w-xl">
            Experience connected bicycle sharing, designed to make every journey simpler and more secure.
          </p>
        </div>

        <div className="mt-16 grid gap-5 lg:grid-cols-6">
          {/* GPS — large dark */}
          <article data-reveal data-spotlight className={`relative overflow-hidden rounded-[28px] bg-night p-8 md:p-10 lg:col-span-4 lg:min-h-[440px] ${lift}`}>
            <div className="absolute inset-y-0 right-0 hidden w-[62%] md:block">
              <MapArt dark className="h-full w-full" />
              <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-night to-transparent" />
              <div className="absolute right-6 top-6 rounded-xl border border-white/10 bg-night/80 px-3 py-2 text-xs text-white/80 backdrop-blur">
                <p className="font-semibold text-white">B02 · on a ride</p>
                <p className="text-white/50">Last GPS update 3 s ago</p>
              </div>
            </div>
            <div className="relative md:max-w-[46%]">
              <FeatureHead
                dark
                icon={MapPinned}
                title="Live GPS tracking"
                text="Stay connected with GPS-enabled bicycle tracking powered by ESP32 and NEO-6M technology."
              />
              <p className="mt-6 inline-flex rounded-full bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint">ESP32 + NEO-6M on every bike</p>
            </div>
            <MapArt dark className="mt-8 h-48 w-full rounded-2xl md:hidden" />
          </article>

          {/* QR */}
          <article data-reveal data-spotlight className={`card spot-light flex flex-col justify-between p-8 lg:col-span-2 ${lift}`}>
            <FeatureHead icon={QrCode} title="One-time QR access" text="Secure, single-use QR codes expire automatically after 60 seconds." />
            <div className="mt-8 flex items-center gap-5 rounded-2xl bg-paper p-5">
              <QrGlyph size={92} />
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-ink">0:42</p>
                <p className="text-sm text-muted">left · single use</p>
              </div>
            </div>
          </article>

          {/* Dock */}
          <article data-reveal data-spotlight className={`card spot-light flex flex-col justify-between p-8 lg:col-span-2 ${lift}`}>
            <FeatureHead icon={Lock} title="Smart docking stations" text="Electronic locks secure bicycles when they are returned to compatible slots." />
            <div className="mt-8">
              <DockMock />
            </div>
          </article>

          {/* Pricing */}
          <article data-reveal data-spotlight className={`card spot-light flex flex-col justify-between gap-8 p-8 lg:col-span-2 ${lift}`}>
            <FeatureHead icon={Receipt} title="Transparent pricing" text="Know exactly what your ride costs with straightforward per-minute pricing." />
            <CostMock />
          </article>

          {/* Report */}
          <article data-reveal data-spotlight className={`card spot-light relative flex flex-col gap-6 overflow-hidden p-8 lg:col-span-2 ${lift}`}>
            <FeatureHead icon={MessageSquareWarning} title="Report a problem" text="Report bicycle or station problems directly from your browser." />
            <div className="relative -mb-44 h-[300px]">
              <PhoneFrame className="scale-90">
                <ReportScreen />
              </PhoneFrame>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
