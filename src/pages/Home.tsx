import React from 'react';
import { Link } from 'react-router-dom';
// import './Home.css';

const Home: React.FC = () => {
  const projects = [
    {
      id: 'axie-gallery',
      title: 'Axie Gallery',
      image: 'https://via.placeholder.com/400x300/f8f9fa/666?text=Axie+Gallery',
      description: 'Digital art and creative expressions'
    },
    {
      id: 'architecture',
      title: 'Architectural Design',
      image: 'https://via.placeholder.com/400x300/e9ecef/666?text=Architecture',
      description: 'Learning Center, Urban Sensorium, The Instrument'
    },
    {
      id: 'graphic-design',
      title: 'Graphic Design',
      image: 'https://via.placeholder.com/400x300/dee2e6/666?text=Graphic+Design',
      description: 'Visual communication and branding'
    },
    {
      id: 'digital-fabrication',
      title: 'Digital Fabrication',
      image: 'https://via.placeholder.com/400x300/ced4da/666?text=Digital+Fabrication',
      description: 'Innovative manufacturing and prototyping'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Yiran Shu</h1>
          <p className="hero-subtitle">Creative Portfolio</p>
          <p className="hero-description">
            Exploring the intersection of architecture, design, and digital fabrication
          </p>
        </div>
        <div className="hero-image">
          <img 
            src="https://via.placeholder.com/600x400/f8f9fa/333?text=Featured+Work" 
            alt="Featured work by Yiran Shu"
            className="hero-img"
          />
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects">
        <div className="container">
          <h2 className="section-title">Featured Work</h2>
          <div className="projects-grid">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                to={`/${project.id}`} 
                className="project-card"
              >
                <div className="project-image">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="project-img"
                  />
                  <div className="project-overlay">
                    <div className="project-info">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-description">{project.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <h2 className="section-title">About</h2>
            <p className="about-text">
              I'm a creative professional passionate about architecture, design, and digital fabrication. 
              My work explores the boundaries between traditional craftsmanship and modern technology.
            </p>
            <Link to="/about" className="about-link">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 