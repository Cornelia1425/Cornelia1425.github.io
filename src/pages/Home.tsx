import React, { useState, useRef } from 'react';
import { useSiteContext } from '../App';
// import './Home.css';

const Home: React.FC = () => {
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { isSiteOpen } = useSiteContext();
  const imageRef = useRef<HTMLImageElement>(null);

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
    <div className={`home ${isSiteOpen ? 'site-open' : 'site-closed'}`}>
      {/* Homepage Gallery Section with Single Image - Only show when site is open */}
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
                    backgroundPosition: `${magnifierPos.x}% ${magnifierPos.y}%`
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