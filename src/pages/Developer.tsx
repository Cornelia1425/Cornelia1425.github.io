import React, { useEffect, useRef } from 'react';

type DeveloperProject = {
  img?: string;
  // File name (without extension) in /images/8_developer/video/: <name>.mp4 plus <name>.jpg, its first frame.
  video?: string;
  bgGradient?: string;
  title: string;
  link: string;
};

// A silent looping clip in place of the still image, same box and crop. It starts
// loading with the page. React does not write the muted attribute, and browsers only
// autoplay muted video, so set it by hand before playing.
const DeveloperVideo: React.FC<{ name: string; title: string }> = ({ name, title }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      // Autoplay refused (for example Low Power Mode): the poster frame stays.
    });
  }, []);
  return (
    <video
      ref={ref}
      className="developer-thumb"
      src={`/images/8_developer/video/${name}.mp4`}
      poster={`/images/8_developer/video/${name}.jpg`}
      aria-label={title}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
};

const developerProjects: DeveloperProject[] = [
  {
    img: '13_voyage.png',
    video: 'voyage',
    title: 'Voyage',
    link: 'https://www.yiranshu.com/voyage/',
  },
  {
    img: '12_nuwacreation.png',
    video: 'nuwa',
    title: 'Nüwa Creation',
    link: 'https://www.yiranshu.com/nuwa-creation/',
  },
  {
    img: '11_summerbreeze.png',
    title: 'Summer Breeze',
    link: 'https://summer-breeze.cargo.site/',
  },
  {
    img: '4_moptopuniversal.png',
    video: 'moptop',
    title: 'MOPTOP Universal Dance Program',
    link: 'https://www.moptopuniversal.com/',
  },
  {
    img: '10_escapeorbit.png',
    video: 'escapeorbit',
    title: 'Escape Orbit',
    link: 'https://escape-orbit.vercel.app/',
  },
  {
    img: '6_dancetogether.png',
    video: 'dancetogether',
    title: 'Dance Galaxy',
    link: 'https://dancetogather.vercel.app/',
  },
  {
    img: '5_sector77.png',
    video: 'sector77',
    title: 'Sector77 Spaceship Museum',
    link: 'https://sector77.vercel.app/',
  },
  {
    img: '7_mymindpalace.png',
    video: 'mymindpalace',
    title: 'My Mind Palace',
    link: 'https://mymindpalace.vercel.app/',
  },
  {
    img: '1_thespells.png',
    title: 'The Spells',
    link: 'https://drive.google.com/file/d/1azuTCD-HcRHkvGg9qHq-5FzVHQ3wEp3N/view?usp=sharing',
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
              {project.video ? (
                <DeveloperVideo name={project.video} title={project.title} />
              ) : project.img ? (
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
            <h2 className="developer-label">{project.title}</h2>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Developer;
