import React, { useState, useEffect } from 'react';
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
             '2_5_urbansensorium.jpg']
  },
  // Learning Center
  {
    name: 'Learning about Death',
    images: ['3_0_learningcenter.png', '3_1_learningcenter.jpg', '3_2_learningcenter.jpg', '3_3_learningcenter.jpg',
             '3_4_learningcenter.jpg', '3_5_learningcenter.jpg', '3_6_learningcenter.jpg', '3_7_learningcenter.jpg']
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
  const [modalData, setModalData] = useState<{ clusterIdx: number; imageIdx: number } | null>(null);

  const openModal = (clusterIdx: number, imageIdx: number) => setModalData({ clusterIdx, imageIdx });
  const closeModal = () => setModalData(null);
  
  const showPrev = () => {
    if (!modalData) return;
    const { clusterIdx, imageIdx } = modalData;
    const cluster = architectureClusters[clusterIdx];
    
    if (imageIdx > 0) {
      setModalData({ clusterIdx, imageIdx: imageIdx - 1 });
    } else if (clusterIdx > 0) {
      const prevCluster = architectureClusters[clusterIdx - 1];
      setModalData({ clusterIdx: clusterIdx - 1, imageIdx: prevCluster.images.length - 1 });
    }
  };
  
  const showNext = () => {
    if (!modalData) return;
    const { clusterIdx, imageIdx } = modalData;
    const cluster = architectureClusters[clusterIdx];
    
    if (imageIdx < cluster.images.length - 1) {
      setModalData({ clusterIdx, imageIdx: imageIdx + 1 });
    } else if (clusterIdx < architectureClusters.length - 1) {
      setModalData({ clusterIdx: clusterIdx + 1, imageIdx: 0 });
    }
  };

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalData === null) return;

      switch (event.key) {
        case 'ArrowLeft':
          showPrev();
          break;
        case 'ArrowRight':
          showNext();
          break;
        case 'Escape':
          closeModal();
          break;
      }
    };

    // Add event listener when modal is open
    if (modalData !== null) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalData]);

  return (
    <div className="page-template">
      <div className="container">
        <div className="architecture-clusters">
          {architectureClusters.map((cluster, clusterIdx) => (
            <div key={cluster.name} className="architecture-cluster">
              <h3 className="cluster-title">{cluster.name}</h3>
              {clusterIdx < 3 ? (
                <div className="architecture-custom-layout">
                  {/* First image on its own row */}
                  <div className="architecture-first-row">
                    <img
                      src={`/images/2_architecture/${cluster.images[0]}`}
                      alt={`${cluster.name} 1`}
                      className="axie-gallery-img architecture-first-img"
                      onClick={() => cluster.images.length > 1 && openModal(clusterIdx, 0)}
                      style={{ cursor: cluster.images.length > 1 ? 'pointer' : 'default' }}
                    />
                  </div>
                  {/* Remaining images in grid */}
                  {cluster.images.length > 1 && (
                    <div className="axie-gallery-grid">
                      {cluster.images.slice(1).map((img, idx) => (
                        <img
                          key={img}
                          src={`/images/2_architecture/${img}`}
                          alt={`${cluster.name} ${idx + 2}`}
                          className="axie-gallery-img"
                          onClick={() => openModal(clusterIdx, idx + 1)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : cluster.name === 'AA Summer School' ? (
                <div className="aa-summer-school-custom-layout">
                  <div className="aa-summer-school-row">
                    {cluster.images.map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/2_architecture/${img}`}
                        alt={`${cluster.name} ${idx + 1}`}
                        className="axie-gallery-img aa-summer-school-img"
                        onClick={() => openModal(clusterIdx, idx)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              ) : cluster.name === 'Urban Sensorium' ? (
                <div className="urban-sensorium-custom-layout">
                  {/* First image on its own row */}
                  <div className="urban-sensorium-first-row">
                    <img
                      src={`/images/2_architecture/${cluster.images[0]}`}
                      alt={`${cluster.name} 1`}
                      className="axie-gallery-img urban-sensorium-first-img"
                      onClick={() => openModal(clusterIdx, 0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  {/* Remaining images in rows with same height */}
                  <div className="urban-sensorium-grid">
                    {cluster.images.slice(1).map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/2_architecture/${img}`}
                        alt={`${cluster.name} ${idx + 2}`}
                        className="axie-gallery-img urban-sensorium-grid-img"
                        onClick={() => openModal(clusterIdx, idx + 1)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              ) : cluster.name === 'Learning about Death' ? (
                <div className="axie-gallery-grid">
                  {cluster.images.map((img, idx) => (
                    <img
                      key={img}
                      src={`/images/2_architecture/${img}`}
                      alt={`${cluster.name} ${idx + 1}`}
                      className="axie-gallery-img"
                      onClick={() => openModal(clusterIdx, idx)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>
              ) : (
                <div className="axie-gallery-grid">
                  {cluster.images.map((img, idx) => (
                    <img
                      key={img}
                      src={`/images/2_architecture/${img}`}
                      alt={`${cluster.name} ${idx + 1}`}
                      className="axie-gallery-img"
                      onClick={() => cluster.images.length > 1 && openModal(clusterIdx, idx)}
                      style={{ cursor: cluster.images.length > 1 ? 'pointer' : 'default' }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {modalData && (
          <div className="gallery-modal-overlay" onClick={closeModal}>
            <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
              <button className="gallery-modal-close" onClick={closeModal}>&times;</button>
              <button className="gallery-modal-arrow gallery-modal-arrow-left" onClick={showPrev} aria-label="Previous image">&#8592;</button>
              <img 
                src={`/images/2_architecture/${architectureClusters[modalData.clusterIdx].images[modalData.imageIdx]}`} 
                alt={`Large preview ${modalData.imageIdx + 1}`} 
                className="gallery-modal-img" 
              />
              <button className="gallery-modal-arrow gallery-modal-arrow-right" onClick={showNext} aria-label="Next image">&#8594;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Architecture; 