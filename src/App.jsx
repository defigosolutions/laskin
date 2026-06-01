import { useState } from 'react';
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
import './App.css';

function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preSelectedTreatment, setPreSelectedTreatment] = useState('');

  const openBookingModal = (treatmentName = '') => {
    setPreSelectedTreatment(treatmentName);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setPreSelectedTreatment('');
  };

  const handleScrollToBooking = (treatmentName = '') => {
    setPreSelectedTreatment(treatmentName);
    const targetElement = document.querySelector('#booking');
    if (targetElement) {
      const offset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Navigation Header */}
      <Navbar onBookingClick={() => openBookingModal('')} />

      {/* Main Luxury Page Flow */}
      <main>
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

        {/* 6. Meet Our Specialists (hover credentials cards) */}
        <Specialists />

        {/* 7. Treatment Packages (invitations grid) */}
        <Packages onReservePackage={(pkgName) => openBookingModal(pkgName)} />

        {/* 8. Client Reviews (auto slide testimonial carousel) */}
        <Reviews />

        {/* 9. Appointment Booking CTA (inline scheduler form) */}
        <BookingCTA defaultTreatment={preSelectedTreatment} />

        {/* 10. Contact & Coordinates Section (stylized vector maps) */}
        <Contact />
      </main>

      {/* 11. Luxury Footer Directory */}
      <Footer onBookingClick={() => openBookingModal('')} />

      {/* Full-Screen Booking Scheduler Modal Overlay */}
      {bookingModalOpen && (
        <BookingForm 
          isModal={true} 
          onClose={closeBookingModal} 
          defaultTreatment={preSelectedTreatment} 
        />
      )}
    </>
  );
}

export default App;
