import React, { useState, useEffect } from 'react';
// import './PageTemplate.css';

const graphicDesignClusters = [
  {
    title: "Summer Breeze",
    images: ['0_1_summerbreeze.png', '0_2_summerbreeze.png', '0_3_summerbreeze.jpg']
  },
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
  const [modalData, setModalData] = useState<{ clusterIdx: number; imageIdx: number } | null>(null);

  const openModal = (clusterIdx: number, imageIdx: number) => setModalData({ clusterIdx, imageIdx });
  const closeModal = () => setModalData(null);
  
  const showPrev = () => {
    if (!modalData) return;
    const { clusterIdx, imageIdx } = modalData;
    const cluster = graphicDesignClusters[clusterIdx];
    
    if (imageIdx > 0) {
      setModalData({ clusterIdx, imageIdx: imageIdx - 1 });
    } else if (clusterIdx > 0) {
      const prevCluster = graphicDesignClusters[clusterIdx - 1];
      setModalData({ clusterIdx: clusterIdx - 1, imageIdx: prevCluster.images.length - 1 });
    }
  };
  
  const showNext = () => {
    if (!modalData) return;
    const { clusterIdx, imageIdx } = modalData;
    const cluster = graphicDesignClusters[clusterIdx];
    
    if (imageIdx < cluster.images.length - 1) {
      setModalData({ clusterIdx, imageIdx: imageIdx + 1 });
    } else if (clusterIdx < graphicDesignClusters.length - 1) {
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
          {graphicDesignClusters.map((cluster, clusterIdx) => (
            <div key={clusterIdx} className="architecture-cluster">
              <h2 className="cluster-title">{cluster.title}</h2>
              {cluster.title === "Menna Branding Design" ? (
                <div className="menna-custom-layout">
                  {/* First two images in one row (smaller) */}
                  <div className="menna-small-row">
                    {cluster.images.slice(0, 2).map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/3_graphicdesign/${img}`}
                        alt={`${cluster.title} ${idx + 1}`}
                        className="axie-gallery-img menna-small-img"
                        onClick={() => openModal(clusterIdx, idx)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  {/* Next two images each on their own row (bigger) */}
                  {cluster.images.slice(2).map((img, idx) => (
                    <div key={img} className="menna-large-row">
                      <img
                        src={`/images/3_graphicdesign/${img}`}
                        alt={`${cluster.title} ${idx + 3}`}
                        className="axie-gallery-img menna-large-img"
                        onClick={() => openModal(clusterIdx, idx + 2)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
                </div>
              ) : cluster.title === "Summer Breeze" ? (
                <div className="summer-breeze-custom-layout">
                  {/* Second image on its own row */}
                  <div className="summer-breeze-large-row">
                    <img
                      src={`/images/3_graphicdesign/${cluster.images[1]}`}
                      alt={`${cluster.title} 2`}
                      className="axie-gallery-img summer-breeze-large-img"
                      onClick={() => openModal(clusterIdx, 1)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  {/* Third image on its own row */}
                  <div className="summer-breeze-large-row">
                    <img
                      src={`/images/3_graphicdesign/${cluster.images[2]}`}
                      alt={`${cluster.title} 3`}
                      className="axie-gallery-img summer-breeze-large-img"
                      onClick={() => openModal(clusterIdx, 2)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ) : cluster.title === "Alien Babies" ? (
                <div className="alien-babies-custom-layout">
                  <div className="alien-babies-row">
                    {cluster.images.map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/3_graphicdesign/${img}`}
                        alt={`${cluster.title} ${idx + 1}`}
                        className="axie-gallery-img alien-babies-img"
                        onClick={() => openModal(clusterIdx, idx)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              ) : cluster.title === "Soul Conference Visuals" ? (
                <div className="soul-conference-custom-layout">
                  {/* First two images in one row */}
                  <div className="soul-conference-first-row">
                    {cluster.images.slice(0, 2).map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/3_graphicdesign/${img}`}
                        alt={`${cluster.title} ${idx + 1}`}
                        className="axie-gallery-img soul-conference-first-img"
                        onClick={() => openModal(clusterIdx, idx)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                  {/* Next three images in another row */}
                  <div className="soul-conference-second-row">
                    {cluster.images.slice(2).map((img, idx) => (
                      <img
                        key={img}
                        src={`/images/3_graphicdesign/${img}`}
                        alt={`${cluster.title} ${idx + 3}`}
                        className="axie-gallery-img soul-conference-second-img"
                        onClick={() => openModal(clusterIdx, idx + 2)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="axie-gallery-grid">
                  {cluster.images.map((img, idx) => (
                    <img
                      key={img}
                      src={`/images/3_graphicdesign/${img}`}
                      alt={`${cluster.title} ${idx + 1}`}
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
                src={`/images/3_graphicdesign/${graphicDesignClusters[modalData.clusterIdx].images[modalData.imageIdx]}`} 
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

export default GraphicDesign; 