"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Force redeploy for logo transparency fix
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (name: string) => {
    if (window.innerWidth <= 768) {
      setActiveDropdown(activeDropdown === name ? null : name);
    }
  };

  // Close menu on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  return (
    <nav className="navbar">
      <Link href="/" className="logo-link" onClick={closeMenu}>
        <img
          src="/assets/final_logo_v9_transparent.png"
          alt="Craven Calm Logo"
          className="logo-img"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const fallback = document.getElementById("fallback-logo");
            if (fallback) fallback.style.display = "block";
          }}
        />
        <div id="fallback-logo" className="logo" style={{ display: "none" }}>
          cravencalm.com
        </div>
      </Link>

      <button
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle Navigation"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links ${isOpen ? "active" : ""}`}>
        <Link href="/" onClick={closeMenu}>
          Home
        </Link>
        <Link href="/sanctuary" onClick={closeMenu}>
          Sanctuary
        </Link>
        <div
          className={`nav-item-wrapper ${
            activeDropdown === "books" ? "active" : ""
          }`}
        >
          <Link
            href="/books"
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                e.preventDefault();
                toggleDropdown("books");
              } else {
                closeMenu();
              }
            }}
          >
            Books <span className="nav-arrow">▼</span>
          </Link>
          <div className="nav-dropdown">
            <Link href="/books/horror" onClick={closeMenu}>
              Horror
            </Link>
            <Link href="/books/meditation" onClick={closeMenu}>
              Meditation
            </Link>
            <Link href="/books/mystery" onClick={closeMenu}>
              Mystery
            </Link>
            <Link href="/books/western" onClick={closeMenu}>
              Western
            </Link>
            <Link href="/books" onClick={closeMenu}>
              All Volumes
            </Link>
          </div>
        </div>

        <div
          className={`nav-item-wrapper ${
            activeDropdown === "music" ? "active" : ""
          }`}
        >
          <Link
            href="/music"
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                e.preventDefault();
                toggleDropdown("music");
              } else {
                closeMenu();
              }
            }}
          >
            Music <span className="nav-arrow">▼</span>
          </Link>
          <div className="nav-dropdown">
            <Link href="/music/gothic" onClick={closeMenu}>
              Gothic Collection
            </Link>
            <Link href="/music/sleep-relaxation" onClick={closeMenu}>
              Sleep & Relaxation
            </Link>
            <Link href="/music/western" onClick={closeMenu}>
              Western / Folk
            </Link>
            <Link href="/music/world-music" onClick={closeMenu}>
              World Music
            </Link>
            <Link href="/music/meditation" onClick={closeMenu}>
              Meditation
            </Link>
            <Link href="/music/uplifting" onClick={closeMenu}>
              Uplifting Collection
            </Link>
            <Link href="/music" onClick={closeMenu}>
              All Releases
            </Link>
          </div>
        </div>

        <div
          className={`nav-item-wrapper ${
            activeDropdown === "art" ? "active" : ""
          }`}
        >
          <Link
            href="/art"
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                e.preventDefault();
                toggleDropdown("art");
              } else {
                closeMenu();
              }
            }}
          >
            Art <span className="nav-arrow">▼</span>
          </Link>
          <div className="nav-dropdown">
            <Link href="/art/wall-art" onClick={closeMenu}>
              Wall-Art (Posters)
            </Link>
            <Link href="/art/mobile-wallpapers" onClick={closeMenu}>
              Mobile Wallpapers
            </Link>
            <Link href="/art" onClick={closeMenu}>
              All Artwork
            </Link>
          </div>
        </div>

        <div
          className={`nav-item-wrapper ${
            activeDropdown === "sessions" ? "active" : ""
          }`}
        >
          <Link
            href="/sessions"
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                e.preventDefault();
                toggleDropdown("sessions");
              } else {
                closeMenu();
              }
            }}
          >
            Sessions <span className="nav-arrow">▼</span>
          </Link>
          <div className="nav-dropdown">
            <Link href="/sessions/dark-calm" onClick={closeMenu}>
              Dark Calm
            </Link>
            <Link href="/sessions/gothic-meditation" onClick={closeMenu}>
              Gothic Meditation
            </Link>
            <Link href="/sessions" onClick={closeMenu}>
              All Sessions
            </Link>
          </div>
        </div>

        <Link href="/admin" onClick={closeMenu}>
          Admin
        </Link>
      </div>
    </nav>
  );
}
