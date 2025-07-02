import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AxieGallery from './pages/AxieGallery';
import Architecture from './pages/Architecture';
import GraphicDesign from './pages/GraphicDesign';
import DigitalFabrication from './pages/DigitalFabrication';
import About from './pages/About';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/axie-gallery" element={<AxieGallery />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/graphic-design" element={<GraphicDesign />} />
            <Route path="/digital-fabrication" element={<DigitalFabrication />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
