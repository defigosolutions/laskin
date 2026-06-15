import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import About from './sections/About';
import Treatments from './sections/Treatments';
import BeforeAfter from './sections/BeforeAfter';
import WhyChooseUs from './sections/WhyChooseUs';
import Specialists from './sections/Specialists';
import Packages from './sections/Packages';
import Reviews from './sections/Reviews';
import BookingCTA from './sections/BookingCTA';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import BookingForm from './components/BookingForm';
import Products from './sections/Products';
import './App.css';

function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preSelectedTreatment, setPreSelectedTreatment] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-in');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const openBookingModal = (treatmentName = '') => {
    setPreSelectedTreatment(treatmentName);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setPreSelectedTreatment('');
  };

  return (
    <>
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

              {/* 9. Appointment Booking CTA (inline scheduler form) */}
              <BookingCTA defaultTreatmentId={preSelectedTreatment} />

              {/* 10. Contact & Coordinates Section (stylized vector maps) */}
              <Contact />
            </>
          } />

          <Route path="/products" element={<Products />} />
        </Routes>
      </main>

      {/* 11. Luxury Footer Directory */}
      <Footer onBookingClick={() => openBookingModal('')} />

      {/* Full-Screen Booking Scheduler Modal Overlay */}
      {bookingModalOpen && (
        <BookingForm 
          isModal={true} 
          onClose={closeBookingModal} 
          defaultTreatmentId={preSelectedTreatment} 
        />
      )}
    </>
  );
}

export default App;
