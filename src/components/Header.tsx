import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteContext } from '../App';
// import './Header.css';

const SCROLL_TOP_REVEAL = 40;
const MOUSE_TOP_REVEAL_PX = 96;
const SCROLL_DIRECTION_THRESHOLD = 10;

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSiteOpen, setIsSiteOpen } = useSiteContext();

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setHeaderHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      setHeaderHidden(false);
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;

      if (y < SCROLL_TOP_REVEAL) {
        setHeaderHidden(false);
        lastScrollY.current = y;
        return;
      }

      const delta = y - lastScrollY.current;
      if (delta > SCROLL_DIRECTION_THRESHOLD) {
        setHeaderHidden(true);
      } else if (delta < -SCROLL_DIRECTION_THRESHOLD) {
        setHeaderHidden(false);
      }
      lastScrollY.current = y;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY <= MOUSE_TOP_REVEAL_PX) {
        setHeaderHidden(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isMenuOpen]);

  const navItems = [
    { path: '/axie-gallery', label: 'Axie Gallery' },
    { path: '/architecture', label: 'Architectural Design' },
    { path: '/digital-fabrication', label: 'Digital Fabrication' },
    { path: '/developer', label: 'Developer' },
    { path: '/contact', label: 'Contact' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoClick = () => {
    if (isSiteOpen) {
      // If site is open, close it and go to home page
      setIsSiteOpen(false);
      navigate('/');
    } else {
      // If site is closed, open it
      setIsSiteOpen(true);
    }
  };

  return (
    <header className={`header${headerHidden ? ' header--hidden' : ''}`}>
      <div className="header-container">
        <button 
          className="logo"
          onClick={handleLogoClick}
          aria-label={isSiteOpen ? 'Close site and return home' : 'Open site'}
        >
          <img 
            src={isSiteOpen ? "/images/0_homepage/close1.png" : "/images/0_homepage/open1.png"} 
            alt={isSiteOpen ? "Close" : "Open"}
            className="logo-image"
          />
        </button>
        
        {isSiteOpen && (
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {isSiteOpen && (
          <button 
            className={`hamburger ${isMenuOpen ? 'hamburger-open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 