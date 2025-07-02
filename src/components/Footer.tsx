import React from 'react';
// import './Footer.css';

const Footer: React.FC = () => {
  const socialLinks = [
    {
      name: 'instagram',
      url: 'https://www.instagram.com/yiranshu/',
      label: 'Instagram'
    },
    {
      name: 'linktree',
      url: 'https://linktr.ee/yiranshu',
      label: 'Linktree'
    },
    {
      name: 'behance',
      url: 'https://www.behance.net/gallery/228814189/Graphic-Design-Portfolio',
      label: 'Behance'
    },
    {
      name: 'x',
      url: 'https://x.com/MonsterSea7',
      label: 'X'
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="copyright">&copy; 2025 by Yiran Shu.</p>
          <ul className="social-links">
            {socialLinks.map((link) => (
              <li key={link.name} className="social-item">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`social-link ${link.name}`}
                  aria-label={link.label}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 