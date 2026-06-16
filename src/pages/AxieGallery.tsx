import React, { useState, useEffect, useCallback } from 'react';
import { AXIE_GALLERY_IMAGES } from '../data/axieGalleryImages';

const AxieGallery: React.FC = () => {
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const total = AXIE_GALLERY_IMAGES.length;

  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = useCallback(() => setModalIdx(null), []);
  const showPrev = useCallback(() => {
    setModalIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);
  const showNext = useCallback(() => {
    setModalIdx((i) => (i !== null && i < total - 1 ? i + 1 : i));
  }, [total]);

  useEffect(() => {
    if (modalIdx === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          setModalIdx((i) => (i !== null && i > 0 ? i - 1 : i));
          break;
        case 'ArrowRight':
          setModalIdx((i) =>
            i !== null && i < total - 1 ? i + 1 : i
          );
          break;
        case 'Escape':
          setModalIdx(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalIdx, total]);

  return (
    <div className="page-template axie-gallery-page">
      <div className="axie-gallery-inner">
        <div className="axie-gallery-stack" role="list">
          <div className="axie-gallery-video-wrap" role="listitem">
            <iframe
              src="https://www.youtube.com/embed/zz_lvZjToiI"
              title="Axie Infinity video"
              className="axie-gallery-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {AXIE_GALLERY_IMAGES.map((img, idx) => (
            <button
              key={img}
              type="button"
              className="axie-gallery-stack-item"
              onClick={() => openModal(idx)}
              aria-label={`Open image ${idx + 1} of ${total} in full view`}
              role="listitem"
            >
              <img
                src={`/images/1_axiegallery/${img}`}
                alt={`Axie gallery, image ${idx + 1}`}
                className="axie-gallery-stack-img"
                loading={idx < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </button>
          ))}
        </div>
      </div>
      {modalIdx !== null && (
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
            {modalIdx > 0 && (
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
              src={`/images/1_axiegallery/${AXIE_GALLERY_IMAGES[modalIdx]}`}
              alt={`Preview ${modalIdx + 1}`}
              className="gallery-modal-img"
            />
            {modalIdx < total - 1 && (
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
  );
};

export default AxieGallery;
