// Interface mockups used to illustrate the product. They are static pictures
// of the UI built in HTML/SVG — not working features.
import { Bike, Camera, Lock, MapPin } from 'lucide-react';
import { QR_PATH, QR_SIZE } from '../lib/qrPath.js';

export function PhoneFrame({ children, className = '' }) {
  return (
    <div
      className={`relative mx-auto w-[232px] rounded-[38px] bg-[#0B1513] p-[9px] shadow-[0_30px_60px_-20px_rgba(4,32,29,0.45),0_0_0_1px_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="relative h-[440px] overflow-hidden rounded-[30px] bg-[#F4F8F6]">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0B1513]" />
        {children}
      </div>
    </div>
  );
}

export function QrGlyph({ size = 140, color = '#04201D' }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} role="img" aria-label="Example QR code">
      <path d={QR_PATH} fill={color} />
    </svg>
  );
}

/** Stylised map with roads, a coastline and a route. */
export function MapArt({ dark = false, route = true, className = '' }) {
  const c = dark
    ? { land: '#0C2F2B', water: '#0A3A44', road: '#174640', minor: '#12403A', block: '#113833' }
    : { land: '#E8EFEB', water: '#C9E5EC', road: '#FFFFFF', minor: '#FFFFFF', block: '#D9E7DF' };
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="400" height="300" fill={c.land} />
      <path d="M0 238 C 120 214, 240 262, 400 232 L400 300 L0 300Z" fill={c.water} />
      <g stroke={c.road} strokeWidth="11" fill="none" strokeLinecap="round">
        <path d="M0 176 C 120 160, 250 196, 400 168" />
        <path d="M118 0 L 142 176" />
        <path d="M18 64 L 384 86" />
      </g>
      <g stroke={c.minor} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M222 0 L 204 176" />
        <path d="M40 124 L 268 130" />
        <path d="M330 18 L 344 170" />
      </g>
      <g fill={c.block}>
        <rect x="152" y="92" width="34" height="26" rx="5" />
        <rect x="240" y="20" width="40" height="32" rx="5" />
        <rect x="54" y="140" width="28" height="22" rx="5" />
        <rect x="290" y="104" width="30" height="40" rx="5" />
      </g>
      {route && (
        <>
          <path
            d="M132 120 L 204 128 L 268 130 L 262 74 L 226 64"
            stroke="#2DD4BF"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 10"
          />
          <circle cx="226" cy="64" r="9" fill="#F59E0B" stroke="#fff" strokeWidth="3" />
        </>
      )}
      <circle cx="132" cy="120" r="22" fill="#14B8A6" opacity="0.22" />
      <circle cx="132" cy="120" r="12" fill="#0F766E" stroke="#fff" strokeWidth="3" />
    </svg>
  );
}

export function FindScreen() {
  return (
    <>
      <MapArt className="absolute inset-0 h-full w-full" route={false} />
      <div className="absolute left-3 right-3 top-9 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] text-muted shadow-sm">
        <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden="true" /> Stations near you
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white p-4 shadow-[0_-10px_30px_-12px_rgba(4,32,29,0.25)]">
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-line" />
        <p className="text-[13px] font-bold text-ink">Station 01</p>
        <p className="text-[11px] text-muted">2 bikes free · 1 empty slot</p>
        <div className="mt-3 flex gap-1.5">
          {['B01', 'B02', null].map((b, i) => (
            <span
              key={i}
              className={`flex h-9 flex-1 items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${
                b ? 'bg-[#E6F4F1] text-teal' : 'border border-dashed border-line text-muted'
              }`}
            >
              {b ? <Bike className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {b || 'Empty'}
            </span>
          ))}
        </div>
        <div className="mt-3 rounded-full bg-teal py-2 text-center text-[12px] font-semibold text-white">Rent a bike here</div>
      </div>
    </>
  );
}

export function QrScreen({ seconds = 42 }) {
  const pct = seconds / 60;
  return (
    <div className="flex h-full flex-col px-4 pt-10">
      <p className="text-[10px] font-semibold text-muted">Station 01 · Slot 2</p>
      <p className="text-[17px] font-extrabold leading-tight tracking-tight text-ink">Show this to the station camera</p>
      <div className="mt-4 flex flex-col items-center rounded-2xl bg-white p-4 shadow-[0_10px_30px_-12px_rgba(4,32,29,0.2)]">
        <QrGlyph size={128} />
        <div className="mt-3 flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="9" fill="none" stroke="#E6F4F1" strokeWidth="3" />
            <circle
              cx="11"
              cy="11"
              r="9"
              fill="none"
              stroke="#0F766E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${pct * 56.5} 56.5`}
              transform="rotate(-90 11 11)"
            />
          </svg>
          <span className="text-[12px] font-bold text-teal">Expires in 0:{String(seconds).padStart(2, '0')}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] leading-snug text-muted">Works once. You have 30 seconds to take the bike after the slot opens.</p>
    </div>
  );
}

export function DockScreen() {
  return (
    <div className="flex h-full flex-col px-4 pt-10">
      <p className="text-[10px] font-semibold text-muted">Ride ended</p>
      <p className="text-[17px] font-extrabold leading-tight tracking-tight text-ink">B02 is locked in Slot 3</p>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {[
          ['Slot 1', 'B01', true],
          ['Slot 2', '—', false],
          ['Slot 3', 'B02', true],
        ].map(([s, b, on]) => (
          <div key={s} className={`rounded-xl p-2 text-center ${on ? 'bg-[#E6F4F1]' : 'border border-dashed border-line'}`}>
            <Lock className={`mx-auto h-4 w-4 ${on ? 'text-teal' : 'text-muted'}`} aria-hidden="true" />
            <p className="mt-1 text-[10px] font-bold text-ink">{s}</p>
            <p className="text-[9px] text-muted">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 rounded-2xl bg-white p-3 text-[11px] shadow-sm">
        {[
          ['Time', '24 min'],
          ['Rate', 'LKR 5 / min'],
          ['Unlock fee', 'Free'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-muted">
            <span>{k}</span>
            <span className="font-semibold text-ink">{v}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-2 text-[13px] font-extrabold text-ink">
          <span>Total</span>
          <span>LKR 120</span>
        </div>
      </div>
      <p className="mt-2 text-center text-[9px] text-muted">Demo payment · no real money charged</p>
    </div>
  );
}

export function ReportScreen() {
  const chips = ['Brakes', 'Flat tyre', 'Chain', 'Lock', 'Seat', 'Other'];
  return (
    <div className="flex h-full flex-col px-4 pt-10">
      <p className="text-[17px] font-extrabold tracking-tight text-ink">Report a problem</p>
      <p className="text-[10px] text-muted">Bike B02 · your last ride</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${i === 0 ? 'bg-teal text-white' : 'border border-line bg-white text-ink'}`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mt-3 h-16 rounded-xl border border-line bg-white p-2 text-[10px] text-muted">The front brake feels loose…</div>
      <div className="mt-2 flex h-14 items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal/40 text-[10px] font-semibold text-teal">
        <Camera className="h-3.5 w-3.5" aria-hidden="true" /> Add a photo
      </div>
      <div className="mt-3 rounded-full bg-teal py-2 text-center text-[11px] font-semibold text-white">Send report</div>
    </div>
  );
}

/** Live ride cost readout. */
export function CostMock() {
  return (
    <div className="rounded-2xl bg-night p-5 text-white">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/20 px-2.5 py-1 text-[11px] font-semibold text-[#86EFAC]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> Live ride
        </span>
        <span className="text-xs text-white/50">Bike B02</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] text-white/50">Time</p>
          <p className="whitespace-nowrap text-[26px] font-extrabold tracking-tight">12:40</p>
        </div>
        <div>
          <p className="text-[11px] text-white/50">Cost so far</p>
          <p className="whitespace-nowrap text-[26px] font-extrabold tracking-tight text-mint">LKR 65</p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-mint to-teal" />
      </div>
      <p className="mt-2 text-[11px] text-white/45">Charged at LKR 5 per minute</p>
    </div>
  );
}

/** Three-slot dock status panel. */
export function DockMock({ dark = false }) {
  const slots = [
    { name: 'Slot 1', bike: 'B01', state: 'Locked', tone: 'ok' },
    { name: 'Slot 2', bike: null, state: 'Free', tone: 'muted' },
    { name: 'Slot 3', bike: 'B03', state: 'Locked', tone: 'ok' },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((s) => (
        <div
          key={s.name}
          className={`rounded-2xl p-3 ${
            s.bike ? (dark ? 'bg-white/5' : 'bg-[#F0FAF7]') : dark ? 'border border-dashed border-white/15' : 'border border-dashed border-line'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${dark ? 'text-white' : 'text-ink'}`}>{s.name}</span>
            <span className={`h-2 w-2 rounded-full ${s.bike ? 'bg-[#22C55E]' : 'bg-[#94A3B8]'}`} aria-hidden="true" />
          </div>
          <div className="mt-3 flex h-12 items-end justify-center">
            {s.bike ? <Bike className="h-9 w-9 text-teal" strokeWidth={1.6} aria-hidden="true" /> : null}
          </div>
          <div className={`mt-2 h-1 rounded-full ${dark ? 'bg-white/20' : 'bg-ink/80'}`} />
          <p className={`mt-2 text-[10px] font-semibold ${s.bike ? 'text-teal' : 'text-muted'}`}>
            {s.bike ? `${s.bike} · ${s.state}` : 'Free slot'}
          </p>
        </div>
      ))}
    </div>
  );
}
