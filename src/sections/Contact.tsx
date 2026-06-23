import React, { useState, useEffect } from 'react';
import { usePublicBranches } from '../hooks/usePublicApi';
import { publicApi } from '../lib/api';

export default function Contact() {
  const { data: branches, isLoading, isError } = usePublicBranches();
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branches && branches.length > 0 && !activeBranchId) {
      setActiveBranchId(branches[0].id);
    }
  }, [branches, activeBranchId]);

  const selectedBranch = branches?.find(b => b.id === activeBranchId);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !subject || !message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      await publicApi.submitInquiry({ fullName, email, phone, subject, message });
      setSuccess('Your inquiry was successfully sent. Our concierge will contact you shortly.');
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Background design accents */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: '80px',
          alignItems: 'start'
        }}
        className="booking-grid"
        >
          {/* Left Column: Reassurance & Narrative */}
          <div className="reveal-in active">
            <span className="section-subtitle">Locations & Inquiries</span>
            
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '24px' }}>
              Get in Touch
            </h2>
            
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 300,
              lineHeight: '1.8',
              color: 'var(--color-text-muted)',
              marginBottom: '32px'
            }}>
              Visit our North Haven sanctuary or reach out to us directly through our online concierge inquiry form. Our team is ready to assist you.
            </p>

            {isLoading ? (
              <div style={{ color: 'var(--color-text-muted)' }}>Loading locations...</div>
            ) : isError ? (
              <div style={{ color: 'red' }}>Failed to load locations.</div>
            ) : selectedBranch ? (
              <>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  color: 'var(--color-text-dark)',
                  marginBottom: '24px',
                  fontWeight: 400
                }}>
                  {selectedBranch.displayName} Sanctuary
                </h3>
                {/* List of client guarantees (Contact details) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-glass-white)',
                      border: '1px solid var(--color-border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold-dark)',
                      boxShadow: 'var(--shadow-luxury)',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Address
                      </h4>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300 }}>
                        {selectedBranch.addressLine}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-glass-white)',
                      border: '1px solid var(--color-border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold-dark)',
                      boxShadow: 'var(--shadow-luxury)',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Phone
                      </h4>
                      <a href={`tel:${selectedBranch.phone}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300, textDecoration: 'none' }}>
                        {selectedBranch.phone}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-glass-white)',
                      border: '1px solid var(--color-border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gold-dark)',
                      boxShadow: 'var(--shadow-luxury)',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Hours of Reception
                      </h4>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 300, whiteSpace: 'pre-line' }}>
                        {'Mon \u2013 Fri: 9:00 AM \u2013 8:00 PM\nSat: 10:00 AM \u2013 6:00 PM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real Google Map */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-light)',
                  boxShadow: 'var(--shadow-luxury)'
                }}>
                  <iframe 
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selectedBranch.addressLine)}&output=embed`} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </>
            ) : null}

          </div>

          {/* Right Column: Inline Form */}
          <div className="reveal-in active" style={{ animationDelay: '0.2s', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div 
              className="glass-panel"
              style={{
                width: '100%',
                padding: '40px',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                color: 'var(--color-text-dark)',
                marginBottom: '8px',
                fontWeight: 400
              }}>
                Send Us a Message
              </h3>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                marginBottom: '32px'
              }}>
                Please fill out the form below and we will get back to you shortly.
              </p>

              <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {success && (
                  <div style={{ padding: '16px', backgroundColor: 'rgba(0, 200, 80, 0.1)', border: '1px solid #00c850', borderRadius: 'var(--radius-sm)', color: '#00c850', fontSize: '13px' }}>
                    {success}
                  </div>
                )}

                {error && (
                  <div style={{ padding: '16px', backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', borderRadius: 'var(--radius-sm)', color: 'red', fontSize: '13px' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.08em', fontWeight: 600 }}>Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-dark)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      transition: 'border-color 0.3s'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.08em', fontWeight: 600 }}>Email *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      style={{
                        padding: '14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-dark)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.08em', fontWeight: 600 }}>Phone</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(475) 209-6384"
                      style={{
                        padding: '14px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        border: '1px solid var(--color-border-strong)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text-dark)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.08em', fontWeight: 600 }}>Subject *</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Booking inquiry / Custom treatment mapping"
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-dark)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-dark)', letterSpacing: '0.08em', fontWeight: 600 }}>Message *</label>
                  <textarea 
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our aesthetic specialists assist you today?"
                    style={{
                      padding: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      border: '1px solid var(--color-border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-dark)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={sending}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '10px'
                  }}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
        }
      `}</style>
    </section>
  );
}
