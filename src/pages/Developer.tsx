import React from 'react';

type DeveloperProject = {
  img?: string;
  bgGradient?: string;
  title: string;
  link: string;
};

const developerProjects: DeveloperProject[] = [
  {
    img: '6_dancetogether.png',
    title: 'Dance Galaxy',
    link: 'https://dancetogather.vercel.app/',
  },
  {
    img: '5_sector77.png',
    title: 'Sector77 Spaceship Museum',
    link: 'https://sector77.vercel.app/',
  },
  {
    bgGradient: 'linear-gradient(135deg, #0a0a2e 0%, #1e1e5a 40%, #0d2b45 70%, #0a1628 100%)',
    title: 'Escape Orbit',
    link: 'https://escape-orbit.vercel.app/',
  },
  {
    img: '4_moptopuniversal.png',
    title: 'MOPTOP Universal Dance Program',
    link: 'https://www.moptopuniversal.com/',
  },
  {
    img: '7_mymindpalace.png',
    title: 'My Mind Palace',
    link: 'https://mymindpalace.vercel.app/',
  },
  {
    img: '1_thespells.png',
    title: 'The Spells',
    link: 'https://thespells.xyz/',
  },
  {
    img: '2_architheatre.png',
    title: 'Architheatre',
    link: 'https://drive.google.com/file/d/1n_Kt1cC9zjjdmqon3wTjqd6hAGrffSZO/view?usp=sharing',
  },
];

const Developer: React.FC = () => {
  return (
    <div className="page-template developer-page">
      <div className="developer-grid">
        {developerProjects.map((project) => (
          <a
            key={project.title}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="developer-item"
          >
            <div className="developer-thumb-wrap">
              {project.img ? (
                <img
                  src={`/images/8_developer/${project.img}`}
                  alt={project.title}
                  className="developer-thumb"
                />
              ) : (
                <div
                  className="developer-thumb developer-thumb--gradient"
                  style={{ background: project.bgGradient }}
                />
              )}
            </div>
            <div className="developer-label">{project.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Developer;
