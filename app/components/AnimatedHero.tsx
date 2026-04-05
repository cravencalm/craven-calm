"use client";

import { useEffect, useState } from "react";

export default function AnimatedHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Triggers animations slightly after mount for smoother effect
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <header className="animated-hero-container">
      {/* Panning Background Image */}
      <div 
        className={`hero-bg-pan ${mounted ? 'start-pan' : ''}`}
        style={{ backgroundImage: "url('/assets/gothic_evening_forest.png')" }}
      ></div>

      {/* Dark vignette overlay */}
      <div className="hero-overlay"></div>

      {/* Main Logo */}
      <div className={`hero-logo-wrapper ${mounted ? 'fade-in-logo' : ''}`}>
        <img 
          src="/assets/cravencalm.png" 
          alt="Craven Calm Logo" 
          className="hero-logo-img"
        />
      </div>

      {/* Scroll indicator */}
      <div className={`hero-scroll-indicator ${mounted ? 'fade-in-delayed' : ''}`}>
        <span className="scroll-arrow">↓</span>
      </div>
    </header>
  );
}
