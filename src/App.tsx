import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Treatments from './sections/Treatments';
import BeforeAfter from './sections/BeforeAfter';
import WhyChooseUs from './sections/WhyChooseUs';
import Specialists from './sections/Specialists';
import Packages from './sections/Packages';
import Reviews from './sections/Reviews';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import Products from './sections/Products';
import AdminPanel from './components/AdminPanel';
import DynamicSEO from './components/DynamicSEO';
import './App.css';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/laskin-manage');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal-in:not(.observed)');
      elements.forEach((el) => {
        observer.observe(el);
        el.classList.add('observed');
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const openBookingModal = (treatmentName = '') => {
    window.open('https://booksy.com/en-us/1467369_la-skin-aesthetics_skin-care_15431_north-haven', '_blank');
  };

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/laskin-manage/*" element={<AdminPanel />} />
      </Routes>
    );
  }

  return (
    <>
      <DynamicSEO />
      
      {/* Navigation Header */}
      <Navbar onBookingClick={() => openBookingModal('')} />

      {/* Main Luxury Page Flow */}
      <main>
        <Routes>
          <Route path="/" element={
            <>
              {/* 1. Hero Section */}
              <Hero onBookingClick={() => openBookingModal('')} />

              {/* 2. About Our Clinic */}
              <About />

              {/* 3. Featured Treatments (interactive details drawer) */}
              <Treatments onBookTreatment={(tName) => openBookingModal(tName)} />

              {/* 4. Before & After Gallery (touch compare slider) */}
              <BeforeAfter />

              {/* 5. Why Choose Us */}
              <WhyChooseUs />

              {/* 6. Meet Our Specialists */}
              <Specialists />

              {/* 7. Treatment Packages (invitations grid) */}
              <Packages onReservePackage={(pkgName) => openBookingModal(pkgName)} />

              {/* 8. Client Reviews (auto slide testimonial carousel) */}
              <Reviews />

              {/* 9. Contact & Coordinates Section (stylized vector maps) */}
              <Contact />
            </>
          } />

          <Route path="/products" element={<Products />} />
        </Routes>
      </main>

      {/* 11. Luxury Footer Directory */}
      <Footer onBookingClick={() => openBookingModal('')} />
    </>
  );
}

export default App;
