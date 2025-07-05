import React from 'react';
// import './PageTemplate.css';

const architectureClusters = [
  // Tool
  {
    name: 'The Tool',
    images: ['0_1_tool.png', '0_2_tool.jpg', '0_3_tool.jpg']
  },
  // Dance
  {
    name: 'The Dance Place',
    images: ['1_1_dance.jpg', '1_2_dance.jpg', '1_3_dance.jpg', '1_4_dance.jpg']
  },
  // Urban Sensorium
  {
    name: 'Urban Sensorium',
    images: ['2_1_urbansensorium.jpg', '2_2_urbansensorium.jpg', '2_3_urbansensorium.jpg', '2_4_urbansensorium.jpg',
             '2_5_urbansensorium.jpg', '2_6_urbansensorium.jpg', '2_7_urbansensorium.jpg', '2_8_urbansensorium.jpg',
             '2_9_urbansensorium.jpg', '2_10_urbansensorium.jpg', '2_11_urbansensorium.jpg', '2_12_urbansensorium.jpg', '2_13_urbansensorium.jpg']
  },
  // Learning Center
  {
    name: 'Learning about Death',
    images: ['3_1_learningcenter.jpg', '3_2_learningcenter.jpg', '3_3_learningcenter.jpg', '3_4_learningcenter.jpg',
             '3_5_learningcenter.jpg', '3_6_learningcenter.jpg', '3_7_learningcenter.jpg']
  },
  // AA
  {
    name: 'AA Summer School',
    images: ['4_1_AA.jpg', '4_2_AA.jpg', '4_3_AA.jpg', '4_4_AA.jpg', '4_5_AA.jpg']
  },
  // Practice
  {
    name: 'Practice',
    images: ['5_1_practice.jpg']
  }
];

const Architecture: React.FC = () => {
  return (
    <div className="page-template">
      <div className="container">
        <div className="architecture-clusters">
          {architectureClusters.map((cluster, clusterIdx) => (
            <div key={cluster.name} className="architecture-cluster">
              <h3 className="cluster-title">{cluster.name}</h3>
              <div className="axie-gallery-grid">
                {cluster.images.map((img, idx) => (
                  <img
                    key={img}
                    src={`/images/2_architecture/${img}`}
                    alt={`${cluster.name} ${idx + 1}`}
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

export default Architecture; 