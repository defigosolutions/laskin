import React, { useState, useRef, useEffect } from 'react';

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Before", 
  afterLabel = "After", 
  aspectRatio = "4/3",
  title = "" 
}) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {title && (
        <h4 style={{ 
          fontFamily: 'var(--font-serif)', 
          fontSize: '20px', 
          color: 'var(--color-text-dark)', 
          marginBottom: '16px',
          fontWeight: 400
        }}>
          {title}
        </h4>
      )}
      
      <div 
        ref={containerRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onTouchStart={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-luxury)',
          aspectRatio: aspectRatio,
          cursor: isDragging ? 'ew-resize' : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          border: '1px solid var(--color-border-light)'
        }}
      >
        {/* Before Image (Bottom Layer) */}
        <img 
          src={beforeImage} 
          alt="Before treatment" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            display: 'block'
          }}
        />
        
        {/* Before Label (Left side) */}
        <span style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'rgba(42, 36, 33, 0.65)',
          color: 'var(--color-text-light)',
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {beforeLabel}
        </span>

        {/* After Image (Top Layer, Clipped Width) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: '100%',
          overflow: 'hidden',
          zIndex: 5,
          borderRight: '1px solid transparent' // for layout alignment
        }}>
          <img 
            src={afterImage} 
            alt="After treatment" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
              height: '100%',
              maxWidth: 'none',
              objectFit: 'cover',
              pointerEvents: 'none',
              display: 'block'
            }}
          />
        </div>
        
        {/* After Label (Right side) */}
        <span style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          background: 'var(--color-gold-gradient)',
          color: 'var(--color-text-light)',
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {afterLabel}
        </span>

        {/* Vertical divider line */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: '2px',
          background: 'var(--color-gold-gradient)',
          zIndex: 15,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          boxShadow: '0 0 10px rgba(194, 155, 120, 0.4)'
        }} />

        {/* Drag handle button */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPosition}%`,
          transform: 'translate(-50%, -50%)',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-bg-primary)',
          border: '2px solid var(--color-gold-base)',
          boxShadow: '0 4px 10px rgba(42, 36, 33, 0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20,
          cursor: 'ew-resize',
          transition: 'transform 0.1s ease'
        }}
        className="slider-handle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-dark)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 19l-7-7 7-7" />
            <path d="M16 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      <span style={{ 
        fontFamily: 'var(--font-sans)', 
        fontSize: '11px', 
        color: 'var(--color-text-muted)', 
        marginTop: '12px',
        letterSpacing: '0.05em' 
      }}>
        Drag the slider to compare before and after results.
      </span>

      <style>{`
        .slider-handle:hover {
          transform: translate(-50%, -50%) scale(1.1) !important;
          box-shadow: 0 4px 14px rgba(194, 155, 120, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
