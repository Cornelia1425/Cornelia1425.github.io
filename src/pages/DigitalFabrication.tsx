import React from 'react';
// import './PageTemplate.css';

const digitalFabImages = [
  '0.jpg', '1.jpg', '2.jpg', '3.jpg', '4.jpg',
];

const DigitalFabrication: React.FC = () => {
  return (
    <div className="page-template">
      <div className="container">
        <div className="digital-fab-gallery">
          {digitalFabImages.map((img, idx) => (
            <img
              key={img}
              src={`/images/4_digitalfabrication/${img}`}
              alt={`Digital Fabrication ${idx + 1}`}
              className="digital-fab-img"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalFabrication; 