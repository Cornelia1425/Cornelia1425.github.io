// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AxieGallery from './pages/AxieGallery';
import Architecture from './pages/Architecture';
import GraphicDesign from './pages/GraphicDesign';
import DigitalFabrication from './pages/DigitalFabrication';
import About from './pages/About';
import Developer from './pages/Developer';
import './App.css';
import { createContext, useContext, useState, useEffect } from 'react';

// Create context for site state
interface SiteContextType {
  isSiteOpen: boolean;
  setIsSiteOpen: (open: boolean) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteContext = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider');
  }
  return context;
};

function App() {
  const location = useLocation();
  const [isSiteOpen, setIsSiteOpen] = useState(() => {
    // Open site if not on home page
    return Boolean(location.hash && location.hash !== '#/');
  });

  useEffect(() => {
    if (location.hash && location.hash !== '#/') {
      setIsSiteOpen(true);
    }
  }, [location]);

  return (
    <SiteContext.Provider value={{ isSiteOpen, setIsSiteOpen }}>
      <div className={`App ${isSiteOpen ? 'site-open' : 'site-closed'}`}>
        <Header />
        <main className={`main-content ${isSiteOpen ? 'with-header' : 'without-header'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/axie-gallery" element={<AxieGallery />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/graphic-design" element={<GraphicDesign />} />
            <Route path="/digital-fabrication" element={<DigitalFabrication />} />
            <Route path="/about" element={<About />} />
            <Route path="/developer" element={<Developer />} />
          </Routes>
        </main>
        {isSiteOpen && <Footer />}
      </div>
    </SiteContext.Provider>
  );
}

export default App;
