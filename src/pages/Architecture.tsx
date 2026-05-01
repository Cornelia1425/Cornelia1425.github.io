import React, { useState, useEffect, useCallback } from 'react';

const architectureClusters = [
  {
    name: 'The Tool',
    images: ['0_1_tool.png', '0_2_tool.jpg', '0_3_tool.jpg'],
  },
  {
    name: 'The Dance Place',
    images: [
      '1_1_dance.jpg',
      '1_2_dance.jpg',
      '1_3_dance.jpg',
      '1_4_dance.jpg',
    ],
  },
  {
    name: 'Urban Sensorium',
    images: [
      '2_1_urbansensorium.jpg',
      '2_2_urbansensorium.jpg',
      '2_3_urbansensorium.jpg',
      '2_4_urbansensorium.jpg',
      '2_5_urbansensorium.jpg',
    ],
  },
  {
    name: 'Learning about Death',
    images: [
      '3_0_learningcenter.png',
      '3_1_learningcenter.jpg',
      '3_2_learningcenter.jpg',
      '3_3_learningcenter.jpg',
      '3_4_learningcenter.jpg',
      '3_5_learningcenter.jpg',
      '3_6_learningcenter.jpg',
      '3_7_learningcenter.jpg',
    ],
  },
  {
    name: 'AA Summer School',
    images: [
      '4_1_AA.jpg',
      '4_2_AA.jpg',
      '4_3_AA.jpg',
      '4_4_AA.jpg',
      '4_5_AA.jpg',
    ],
  },
  {
    name: 'Practice',
    images: ['5_1_practice.jpg'],
  },
];

type ModalState = { clusterIdx: number; imageIdx: number };

const Architecture: React.FC = () => {
  const [modalData, setModalData] = useState<ModalState | null>(null);

  const openModal = (clusterIdx: number, imageIdx: number) =>
    setModalData({ clusterIdx, imageIdx });
  const closeModal = useCallback(() => setModalData(null), []);

  const showPrev = useCallback(() => {
    setModalData((m) => {
      if (!m) return m;
      const { clusterIdx, imageIdx } = m;
      if (imageIdx > 0) {
        return { clusterIdx, imageIdx: imageIdx - 1 };
      }
      if (clusterIdx > 0) {
        const prev = architectureClusters[clusterIdx - 1];
        return { clusterIdx: clusterIdx - 1, imageIdx: prev.images.length - 1 };
      }
      return m;
    });
  }, []);

  const showNext = useCallback(() => {
    setModalData((m) => {
      if (!m) return m;
      const { clusterIdx, imageIdx } = m;
      const cluster = architectureClusters[clusterIdx];
      if (imageIdx < cluster.images.length - 1) {
        return { clusterIdx, imageIdx: imageIdx + 1 };
      }
      if (clusterIdx < architectureClusters.length - 1) {
        return { clusterIdx: clusterIdx + 1, imageIdx: 0 };
      }
      return m;
    });
  }, []);

  const canGoPrev = (m: ModalState) =>
    m.imageIdx > 0 || m.clusterIdx > 0;
  const canGoNext = (m: ModalState) => {
    const cluster = architectureClusters[m.clusterIdx];
    return (
      m.imageIdx < cluster.images.length - 1 ||
      m.clusterIdx < architectureClusters.length - 1
    );
  };

  useEffect(() => {
    if (modalData === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          showPrev();
          break;
        case 'ArrowRight':
          showNext();
          break;
        case 'Escape':
          setModalData(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalData, showPrev, showNext]);

  return (
    <div className="page-template architecture-gallery-page">
      <div className="container arch-gallery-shell">
        <div className="architecture-clusters">
          {architectureClusters.map((cluster, clusterIdx) => (
            <section
              key={cluster.name}
              className="architecture-cluster"
              aria-labelledby={`arch-cluster-${clusterIdx}`}
            >
              <h3 className="cluster-title" id={`arch-cluster-${clusterIdx}`}>
                {cluster.name}
              </h3>
              <div className="arch-gallery-stack">
                {cluster.images.map((img, imageIdx) => (
                  <button
                    key={img}
                    type="button"
                    className="arch-gallery-stack-item"
                    onClick={() => openModal(clusterIdx, imageIdx)}
                    aria-label={`Open ${cluster.name} image ${imageIdx + 1}`}
                  >
                    <img
                      src={`/images/2_architecture/${img}`}
                      alt={`${cluster.name} ${imageIdx + 1}`}
                      className="arch-gallery-stack-img"
                      loading={
                        clusterIdx === 0 && imageIdx < 2 ? 'eager' : 'lazy'
                      }
                      decoding="async"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {modalData && (
          <div className="gallery-modal-overlay" onClick={closeModal}>
            <div
              className="gallery-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gallery-modal-close"
                onClick={closeModal}
              >
                &times;
              </button>
              {canGoPrev(modalData) && (
                <button
                  type="button"
                  className="gallery-modal-arrow gallery-modal-arrow-left"
                  onClick={showPrev}
                  aria-label="Previous image"
                >
                  &#8592;
                </button>
              )}
              <img
                src={`/images/2_architecture/${architectureClusters[modalData.clusterIdx].images[modalData.imageIdx]}`}
                alt="Large preview"
                className="gallery-modal-img"
              />
              {canGoNext(modalData) && (
                <button
                  type="button"
                  className="gallery-modal-arrow gallery-modal-arrow-right"
                  onClick={showNext}
                  aria-label="Next image"
                >
                  &#8594;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Architecture;
