import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteContext } from '../App';
// import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSiteOpen, setIsSiteOpen } = useSiteContext();

  const navItems = [
    { path: '/axie-gallery', label: 'Axie Gallery' },
    { path: '/architecture', label: 'Architectural Design' },
    { path: '/graphic-design', label: 'Graphic Design' },
    { path: '/digital-fabrication', label: 'Digital Fabrication' },
    { path: '/developer', label: 'Developer' },
    { path: '/about', label: 'About' }
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
    <header className="header">
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