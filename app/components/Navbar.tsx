"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="logo-link">
        <img
          src="/assets/final_logo_v7.png"
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
      <div className="nav-links">
        <Link href="/sanctuary">Sanctuary</Link>
        <Link href="/#music">Music</Link>
        <Link href="/#store">Store</Link>
        <Link href="/admin">Admin (CMS)</Link>
      </div>
    </nav>
  );
}
