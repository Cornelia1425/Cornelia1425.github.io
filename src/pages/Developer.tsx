import React from 'react';

const developerProjects = [
  {
    img: '0_sector77.png',
    title: 'Sector77 Spaceship Museum',
    link: 'https://sector77.vercel.app/',
    description: '2025 July Solana & Icon Trading Hackathon 3rd Tier Winner. A futuristic space museum with interactive exhibits.'
  },
  {
    img: '1_moptopuniversal.png',
    title: 'MOPTOP Universal Dance Program',
    link: 'https://www.moptopuniversal.com/',
    description: 'A site for MOPTOP at Peridance, honoring street dance pioneers. A passion project passing down dance knowledge to new generations.'
  },
  {
    img: '2_thespells.png',
    title: 'The Spells',
    link: 'https://thespells.xyz/',
    description: 'An interactive tribute to J.K. Rowling, where muggles explore and search for spells.'
  },
  {
    img: '3_architheatre.png',
    title: 'Architheatre',
    link: 'https://drive.google.com/file/d/1n_Kt1cC9zjjdmqon3wTjqd6hAGrffSZO/view?usp=sharing',
    description: 'A digital journal showcasing architecture and travel through visuals and stories.'
  }
];

const Developer: React.FC = () => {
  return (
    <div className="page-template" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container developer-main-content">
        <div className="developer-gallery">
          {developerProjects.map((project) => (
            <div key={project.img} className="developer-project">
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={`/images/8_developer/${project.img}`}
                  alt={project.title}
                  className="developer-img"
                />
                <div className="developer-title">{project.title}</div>
                <div className="developer-description">{project.description}</div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Developer; 