import React from 'react';

const developerProjects = [
  {
    img: '0_sector77.png',
    title: 'Sector77 Spaceship Museum',
    link: 'https://sector77.vercel.app/'
  },
  {
    img: '1_moptopuniversal.png',
    title: 'MOPTOP Universal Dance Program',
    link: 'https://www.moptopuniversal.com/'
  },
  {
    img: '2_thespells.png',
    title: 'The Spells',
    link: 'https://thespells.xyz/'
  },
  {
    img: '3_architheatre.png',
    title: 'Architheatre',
    link: 'https://drive.google.com/file/d/1n_Kt1cC9zjjdmqon3wTjqd6hAGrffSZO/view?usp=sharing'
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
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Developer; 