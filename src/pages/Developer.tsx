import React from 'react';

const developerProjects = [
  {
    img: '6_dancetogether.png',
    title: 'Dance Galaxy',
    link: 'https://dancetogather.vercel.app/',
    description: 'A dance metaverse - mint, trade, and vibe. Built in a day with Fractal Tech NYC.'
  },
  {
    img: '5_sector77.png',
    title: 'Sector77 Spaceship Museum',
    link: 'https://sector77.vercel.app/',
    description: '3rd-Tier Solana & Icon-Trading hackathon winner: an interactive NFT museum for space explorers.'
  },
  {
    img: '4_moptopuniversal.png',
    title: 'MOPTOP Universal Dance Program',
    link: 'https://www.moptopuniversal.com/',
    description: 'Preserving street dance culture through education. A passion project for Peridance.'
  },
  {
    img: '7_mymindpalace.png',
    title: 'My Mind Palace',
    link: 'https://mymindpalace.vercel.app/',
    description: 'A digital space for organizing thoughts and memories.'
  },
  {
    img: '1_thespells.png',
    title: 'The Spells',
    link: 'https://thespells.xyz/',
    description: 'An interactive Harry Potter tribute - discover magic like a muggle.'
  },
  {
    img: '2_architheatre.png',
    title: 'Architheatre',
    link: 'https://drive.google.com/file/d/1n_Kt1cC9zjjdmqon3wTjqd6hAGrffSZO/view?usp=sharing',
    description: 'Visual storytelling at the intersection of architecture and travel.'
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