import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteContext } from '../App';
import { MatrixRainThree } from '../components/MatrixRainThree';

const openSite = (setIsSiteOpen: (v: boolean) => void) => {
  setIsSiteOpen(true);
};

const Home: React.FC = () => {
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isSiteOpen, setIsSiteOpen } = useSiteContext();
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isSiteOpen) {
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSiteOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMousePos({ x, y });
    setMagnifierPos({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => setIsMagnifying(true);
  const handleMouseLeave = () => setIsMagnifying(false);

  return (
    <div className={`home ${isSiteOpen ? 'site-open' : 'site-closed matrix-landing'}`}>
      {!isSiteOpen && (
        <section className="matrix-entry" aria-label="Portfolio entry">
          <MatrixRainThree className="matrix-entry-canvas" active={!isSiteOpen} />
          <div className="matrix-entry-ui">
            <p className="matrix-entry-kicker">MATRIX NEXUS</p>
            <h1 className="matrix-entry-title">YIRAN SHU</h1>
            <p className="matrix-entry-hub">
              <span className="matrix-entry-dot" aria-hidden>
                ●
              </span>{' '}
              HUB WORLD
            </p>

            <nav className="matrix-entry-nav matrix-entry-nav--surfaces" aria-label="Quick links">
              <Link
                className="matrix-entry-link matrix-entry-link--btn matrix-entry-surface"
                to="/3d-narrative"
                onClick={() => openSite(setIsSiteOpen)}
              >
                <span className="matrix-entry-surface__label">3D Narrative</span>
              </Link>
              <Link
                className="matrix-entry-link matrix-entry-link--btn matrix-entry-surface matrix-entry-surface--alt"
                to="/movement-storytelling"
                onClick={() => openSite(setIsSiteOpen)}
              >
                <span className="matrix-entry-surface__label">movement storytelling</span>
              </Link>
            </nav>

            <p className="matrix-entry-status">SYSTEM.ACTIVE</p>
            <p className="matrix-entry-dim">DIMENSION.00</p>
          </div>
        </section>
      )}

      {isSiteOpen && (
        <section className="homepage-gallery">
          <div className="homepage-gallery-col">
            <div className="homepage-image-container">
              <img
                ref={imageRef}
                src="/images/0_homepage/0_thetool.png"
                alt="The Tool"
                className="homepage-gallery-img"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              {isMagnifying && (
                <div
                  className="homepage-magnifier"
                  style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    backgroundImage: `url(/images/0_homepage/0_thetool.png)`,
                    backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`,
                  }}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
