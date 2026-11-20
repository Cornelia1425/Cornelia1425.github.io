import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AxieGallery from './pages/AxieGallery';
import Architecture from './pages/Architecture';
import DigitalFabrication from './pages/DigitalFabrication';
import Contact from './pages/Contact';
import Developer from './pages/Developer';
import './App.css';
import { createContext, useContext, useState, useEffect } from 'react';

// Create context for site state
interface SiteContextType {
  isSiteOpen: boolean;
  setIsSiteOpen: (open: boolean) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// One name per route: it is the page's h1 and the start of the browser tab title.
const SITE_NAME = 'Yiran Shu';
const PAGE_NAMES: Record<string, string> = {
  '/axie-gallery': 'Axie Gallery',
  '/architecture': 'Architectural Design',
  '/digital-fabrication': 'Digital Fabrication',
  '/developer': 'Developer',
  '/contact': 'Contact',
};

// Hook is consumed by Header/Footer; kept here next to provider for a single module boundary.
// eslint-disable-next-line react-refresh/only-export-components -- Vite fast refresh: non-component export
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
    return location.pathname !== '/';
  });

  useEffect(() => {
    if (location.pathname !== '/') {
      setIsSiteOpen(true);
    }
  }, [location]);

  const pageName = PAGE_NAMES[location.pathname];
  const pageHeading = pageName ?? `${SITE_NAME} — Portfolio`;

  useEffect(() => {
    document.title = pageName ? `${pageName} — ${SITE_NAME}` : `${SITE_NAME} — Portfolio`;
  }, [pageName]);

  return (
    <SiteContext.Provider value={{ isSiteOpen, setIsSiteOpen }}>
      <div className={`App ${isSiteOpen ? 'site-open' : 'site-closed'}`}>
        <Header />
        <main className={`main-content ${isSiteOpen ? 'with-header' : 'without-header'}`}>
          <h1 className="visually-hidden">{pageHeading}</h1>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/axie-gallery" element={<AxieGallery />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/graphic-design" element={<Navigate to="/" replace />} />
            <Route path="/digital-fabrication" element={<DigitalFabrication />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<Navigate to="/contact" replace />} />
            <Route path="/developer" element={<Developer />} />
          </Routes>
        </main>
        {isSiteOpen && <Footer />}
      </div>
    </SiteContext.Provider>
  );
}

export default App;
