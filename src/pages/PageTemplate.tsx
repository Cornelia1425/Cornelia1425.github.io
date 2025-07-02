import React from 'react';
// import './PageTemplate.css';

const PageTemplate: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => {
  return (
    <div className="page-template">
      <div className="container">
        <h1 className="page-title">{title}</h1>
        <div className="content-placeholder">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageTemplate; 