import React from 'react';
// import './About.css';

const About: React.FC = () => {
  return (
    <div className="about">
      <div className="container about-content">
        <div className="about-hero">
          <h1 className="about-title">Design Manifesto</h1>
          <div className="manifesto-container">
            <div className="manifesto-line">
              <span className="manifesto-text">Spaces that have always been, quietly seen, yet still unseen.</span>
            </div>
            <div className="manifesto-line">
              <span className="manifesto-text">Darkness stands, but light extends - harmonies hum where wall meets wind.</span>
            </div>
            <div className="manifesto-line">
              <span className="manifesto-text">Felt before the mind unfolds, personal depths grow universal.</span>
            </div>
            <div className="manifesto-line">
              <span className="manifesto-text">Timeless as the moon's return, absence burns - yet presence earns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 