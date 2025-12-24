import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import GetStarted from './pages/GetStarted';
import './index.css';
import { ServiceProvider } from './context/ServiceContext';
import { AuthProvider } from './context/AuthContext';
import { SiteLayout } from './components/layout/SiteLayout';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ServiceProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/faq' element={<FAQ />} />
                <Route path='/start' element={<GetStarted />} />
                <Route path='*' element={<Navigate to='/' replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ServiceProvider>
    </HelmetProvider>
  </StrictMode>
);
