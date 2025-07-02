import React from 'react';
// import './About.css';

const About: React.FC = () => {
  return (
    <div className="about">
      <div className="container about-content">
        <div className="about-content">
          <h1 className="page-title">About</h1>
          
          <div className="about-grid">
            <div className="about-text-section">
              <h2>Yiran Shu</h2>
              <p className="bio-text">
                I am a creative professional with a passion for architecture, design, and digital fabrication. 
                My work explores the intersection of traditional craftsmanship and modern technology, 
                creating innovative solutions that bridge the gap between digital and physical worlds.
              </p>
              
              <p className="bio-text">
                With expertise in architectural design, graphic design, and digital fabrication, 
                I approach each project with a unique perspective that combines technical precision 
                with artistic expression. My portfolio showcases a diverse range of work, from 
                conceptual architectural projects to digital art and innovative manufacturing techniques.
              </p>
              
              <p className="bio-text">
                I believe in the power of design to transform spaces, experiences, and communities. 
                Through my work, I strive to create meaningful connections between people and their 
                environments, pushing the boundaries of what's possible in contemporary design.
              </p>
            </div>
            
            <div className="about-image-section">
              <div className="profile-image">
                <img 
                  src="https://via.placeholder.com/400x500/f8f9fa/666?text=Yiran+Shu" 
                  alt="Yiran Shu"
                  className="profile-img"
                />
              </div>
            </div>
          </div>
          
          <div className="skills-section">
            <h3>Areas of Expertise</h3>
            <div className="skills-grid">
              <div className="skill-item">
                <h4>Architectural Design</h4>
                <p>Conceptual design, urban planning, sustainable architecture</p>
              </div>
              <div className="skill-item">
                <h4>Graphic Design</h4>
                <p>Visual communication, branding, digital art</p>
              </div>
              <div className="skill-item">
                <h4>Digital Fabrication</h4>
                <p>3D printing, CNC machining, parametric design</p>
              </div>
              <div className="skill-item">
                <h4>Digital Art</h4>
                <p>Creative expression, digital illustration, concept art</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 