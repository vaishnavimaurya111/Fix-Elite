import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useState, useEffect } from 'react';
import { GearLoader } from './components/GearLoader';

const splashStyles = `
  .splash-screen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    transition: opacity 0.6s ease, visibility 0.6s ease;
  }

  .splash-screen.fade-out {
    opacity: 0;
    visibility: hidden;
  }

  .splash-title {
    margin-top: 2rem;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(90deg, #E24B4A, #1D9E75);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    animation: splash-fade-in 0.8s ease 0.3s forwards;
  }

  .splash-subtitle {
    margin-top: 0.5rem;
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 0.95rem;
    color: #71717a;
    opacity: 0;
    animation: splash-fade-in 0.8s ease 0.6s forwards;
  }

  @keyframes splash-fade-in {
    to { opacity: 1; }
  }
`;

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);
    const removeTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {showSplash && (
        <>
          <style>{splashStyles}</style>
          <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <GearLoader size={240} speed={2} />
            <p className="splash-title">FixNow</p>
            <p className="splash-subtitle">Loading your experience...</p>
          </div>
        </>
      )}
      <RouterProvider router={router} />
    </>
  );
}
