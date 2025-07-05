import React, { useState } from 'react';
// import './PageTemplate.css';

const axieImages = [
  '1_handdrawing.jpg',
  '2_handdrawing.jpg',
  '3_handdrawing.jpg',
  '4_axie.jpg',
  '5_axie.jpg',
  '6_axie.jpg',
  '7_axie.jpg',
  '8_axie.jpg',
];

const AxieGallery: React.FC = () => {
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = () => setModalIdx(null);
  const showPrev = () => modalIdx !== null && setModalIdx(modalIdx - 1);
  const showNext = () => modalIdx !== null && setModalIdx(modalIdx + 1);

  return (
    <div className="page-template">
      <div className="container">
        <div className="axie-gallery-grid">
          {axieImages.map((img, idx) => (
            <img
              key={img}
              src={`/images/1_axiegallery/${img}`}
              alt={`Axie Gallery ${idx + 1}`}
              className="axie-gallery-img"
              onClick={() => openModal(idx)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
        {modalIdx !== null && (
          <div className="gallery-modal-overlay" onClick={closeModal}>
            <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
              <button className="gallery-modal-close" onClick={closeModal}>&times;</button>
              {modalIdx > 0 && (
                <button className="gallery-modal-arrow gallery-modal-arrow-left" onClick={showPrev} aria-label="Previous image">&#8592;</button>
              )}
              <img src={`/images/1_axiegallery/${axieImages[modalIdx]}`} alt={`Large preview ${modalIdx + 1}`} className="gallery-modal-img" />
              {modalIdx < axieImages.length - 1 && (
                <button className="gallery-modal-arrow gallery-modal-arrow-right" onClick={showNext} aria-label="Next image">&#8594;</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AxieGallery; 