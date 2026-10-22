import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/rent"
          element={<ComingSoon title="The rider app is on its way." text="Finding bikes, QR unlocking and live rides will open here when the CeyGo rider app is connected." />}
        />
        <Route path="/report" element={<ComingSoon title="Report a problem" text="Problem reporting will open here with the rider app." />} />
        <Route path="/contact" element={<ComingSoon title="Contact" text="Contact details will be added here." />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy policy" text="Our privacy policy will be published here." />} />
        <Route path="/terms" element={<ComingSoon title="Terms of use" text="Our terms of use will be published here." />} />
        <Route path="*" element={<ComingSoon title="Page not found" text="That page does not exist. Let's get you back on the road." />} />
      </Routes>
    </>
  );
}
