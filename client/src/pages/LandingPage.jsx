import { useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import CinematicStory from '../components/CinematicStory.jsx';
import Features from '../components/Features.jsx';
import Pricing from '../components/Pricing.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCTA from '../components/FinalCTA.jsx';
import Footer from '../components/Footer.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useHoverEffects } from '../hooks/useHoverEffects.js';

export default function LandingPage() {
  const contentRef = useRef(null);
  useReveal(contentRef);
  useHoverEffects();

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-mint focus:px-4 focus:py-2 focus:font-semibold focus:text-night">
        Skip to content
      </a>
      <Navbar />
      <CinematicStory />
      <main id="main" ref={contentRef} className="bg-white">
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
