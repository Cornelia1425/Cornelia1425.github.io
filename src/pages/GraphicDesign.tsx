import React from 'react';
// import './PageTemplate.css';

const graphicDesignClusters = [
  {
    title: "Menna Branding Design",
    images: ['1_1_menna.png', '1_2_menna.png', '1_3_menna.png', '1_4_menna.png']
  },
  {
    title: "Soul Conference Visuals", 
    images: ['2_1_soul.png', '2_2_soul.png', '2_3_soul.png', '2_4_soul.png', '2_5_soul.png']
  },
  {
    title: "Web Design",
    images: ['3_1_web.jpg', '3_2_web.png', '3_3_web.png']
  },
  {
    title: "Animation",
    images: ['4_1_ejoe.gif']
  },
  {
    title: "Alien Babies",
    images: ['5_1_alien.png', '5_2_alien.png', '5_3_alien.png', '5_4_alien.png', '5_5_alien.png']
  },
  {
    title: "Sculpture",
    images: ['6_1_sculpture.jpg']
  }
];

const GraphicDesign: React.FC = () => {
  return (
    <div className="page-template">
      <div className="container">
        <div className="architecture-clusters">
          {graphicDesignClusters.map((cluster, clusterIdx) => (
            <div key={clusterIdx} className="architecture-cluster">
              <h2 className="cluster-title">{cluster.title}</h2>
              <div className="axie-gallery-grid">
                {cluster.images.map((img, idx) => (
                  <img
                    key={img}
                    src={`/images/3_graphicdesign/${img}`}
                    alt={`${cluster.title} ${idx + 1}`}
                    className="axie-gallery-img"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphicDesign; 