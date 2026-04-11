"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AudioPlayer from "./components/AudioPlayer";
import NewsletterForm from "./components/NewsletterForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number;
  name: string;
  price_cents: number;
  youtube_id: string;
  mp3_preview_url: string;
  zip_file_url: string;
  image_url: string;
  audio_length: string;
  is_physical?: boolean;
  category?: string | null;
};

type FeaturedVideo = {
  id: number;
  title: string;
  youtube_url: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  image_url: string | null;
  bookshop_url: string;
  is_featured: boolean;
};

/** Extract YouTube video ID from a URL */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    async function fetchVideos() {
      try {
        const { data, error } = await supabase.from("featured_videos").select("*").order("sort_order", { ascending: true });
        if (data && !error) setFeaturedVideos(data);
      } catch (_) {}
    }
    async function fetchFeaturedBooks() {
      try {
        const { data, error } = await supabase.from("books").select("*").eq("is_featured", true).order("id", { ascending: false });
        if (data && !error) setFeaturedBooks(data);
      } catch (_) {}
    }
    fetchProducts();
    fetchVideos();
    fetchFeaturedBooks();
  }, []);

  const handleCheckout = async (productId: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />

      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Healing Music & Dark Academia Art for the Soul</h1>
          <div className="hero-divider"></div>
          <p className="hero-subtitle">Ambient & Gothic journeys for deep rest🌙🌙</p>
        </div>
      </header>

      <main>
        {/* Features Section */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="card-title">Candlelit Reprieve</h3>
              <div className="card-img-wrapper">
                <img src="/assets/candlelit_reprieve_1775280300978.png" alt="Candlelit Reprieve" />
              </div>
              <p className="card-text">
                Retreat into the quiet sanctuary of your mind. Let heavy, atmospheric drones wash over you to ease anxiety and silence the chaos of the modern world.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="card-title">The Scholar's Focus</h3>
              <div className="card-img-wrapper">
                <img src="/assets/scholars_focus_1775280317109.png" alt="The Scholar's Focus" />
              </div>
              <p className="card-text">
                Continuous, rhythmic ambient textures designed to anchor your wandering thoughts. The perfect companion for reading dusty tomes, writing, or deep midnight study.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="card-title">Abyssal Stillness</h3>
              <div className="card-img-wrapper">
                <img src="/assets/abyssal_stillness_v2_1775280576528.png" alt="Abyssal Stillness" />
              </div>
              <p className="card-text">
                Descend into profound states of meditation. Our lowest frequencies guide you downward, helping you reach total stillness and explore the quieter depths of your soul.
              </p>
            </div>
          </div>
        </section>

        <div className="section-divider" id="music">
          <span className="ornament left">&#10086;</span>
          <h2>Latest Music Releases</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section id="music-store" className="releases-section">
          <div className="products-grid">
            {loading ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic", padding: "2rem" }}>Summoning melodies...</p>
            ) : products.filter(p => !p.is_physical && !((p.category || "").split(",").includes("mobile-wallpaper"))).length > 0 ? (
              products.filter(p => !p.is_physical && !((p.category || "").split(",").includes("mobile-wallpaper"))).slice(0, 4).map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    <img src={product.image_url || "/assets/album_art_1_1775220324510.png"} alt={product.name} />
                    <span className="price-tag">${(product.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="sub-text">Craven Calm Exclusive</p>
                    {product.audio_length && (
                      <p style={{ fontSize: "0.8rem", color: "var(--accent-hover)", marginBottom: "1rem", fontStyle: "italic" }}>
                        ⏱️ {product.audio_length}
                      </p>
                    )}
                    {product.mp3_preview_url && (
                      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                          <p style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontStyle: "italic", marginBottom: "0.5rem" }}>Audio Preview</p>
                          <AudioPlayer src={product.mp3_preview_url} />
                      </div>
                    )}
                    <button className="btn-buy stripe-buy" onClick={() => handleCheckout(product.id.toString())}>
                      Buy MP3/ZIP
                    </button>
                  </div>
                </div>
              ))
            ) : (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic" }}>No albums published yet.</p>
            )}
          </div>
          {!loading && products.filter(p => !p.is_physical && !((p.category || "").split(",").includes("mobile-wallpaper"))).length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <a href="/music" className="view-all-link">View All Music &rarr;</a>
            </div>
          )}
        </section>

        <div className="section-divider" id="artwork">
          <span className="ornament left">&#10086;</span>
          <h2>Ethereal Wall Art</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section id="art-store" className="releases-section">
          <div className="products-grid">
            {loading ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic", padding: "2rem" }}>Unveiling visions...</p>
            ) : products.filter(p => p.is_physical).length > 0 ? (
              products.filter(p => p.is_physical).slice(0, 4).map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    <img src={product.image_url || "/assets/album_art_1_1775220324510.png"} alt={product.name} />
                    <span className="price-tag">${(product.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="sub-text">Physical Metal Poster</p>
                    {product.mp3_preview_url && (
                      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                          <p style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontStyle: "italic", marginBottom: "0.5rem" }}>Artwork Preview</p>
                          <AudioPlayer src={product.mp3_preview_url} />
                      </div>
                    )}
                    <button className="btn-buy stripe-buy" onClick={() => handleCheckout(product.id.toString())}>
                      Buy Metal Poster
                    </button>
                  </div>
                </div>
              ))
            ) : (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic" }}>No artwork pieces available yet.</p>
            )}
          </div>
          {!loading && products.filter(p => p.is_physical).length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <a href="/music" className="view-all-link">View Full Gallery &rarr;</a>
            </div>
          )}
        </section>

        {/* Featured Books Section */}
        {featuredBooks.length > 0 && (
          <>
            <div className="section-divider" id="library">
              <span className="ornament left">&#10086;</span>
              <h2>Featured Volumes</h2>
              <span className="ornament right">&#10086;</span>
            </div>

            <section id="featured-books" style={{ marginBottom: "4rem" }}>
              <div className="products-grid">
                {featuredBooks.map((book) => (
                  <div className="product-card book-card-home" key={book.id}>
                    <div className="product-image-wrapper" style={{ aspectRatio: '2/3' }}>
                      <img src={book.image_url || "/assets/album_art_1_1775220324510.png"} alt={book.title} style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="product-info">
                      <h3 style={{ fontSize: '1.1rem' }}>{book.title}</h3>
                      <p className="sub-text" style={{ fontStyle: 'italic' }}>by {book.author}</p>
                      <a href={book.bookshop_url} target="_blank" rel="noopener noreferrer" className="btn-buy book-btn" style={{ textDecoration: 'none' }}>
                        View on Bookshop
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.6, marginTop: "2rem", fontStyle: "italic", padding: "0 10%" }}>
                As a Bookshop.org affiliate, Craven Calm earns a commission from qualifying purchases.
              </p>
              <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                <a href="/books" className="view-all-link">Visit The Library &rarr;</a>
              </div>
            </section>
          </>
        )}

        {/* Featured Visuals Section */}
        <div className="section-divider">
          <span className="ornament left">&#10086;</span>
          <h2>Featured Visuals</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", marginBottom: "4rem", padding: "0 4%" }}>
          {featuredVideos.length > 0 ? (
            featuredVideos.map((video) => {
              const videoId = extractYouTubeId(video.youtube_url);
              if (!videoId) return null;
              return (
                <div key={video.id} style={{ width: "100%", maxWidth: "800px" }}>
                  {video.title && (
                    <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--accent-color)", marginBottom: "0.75rem", textAlign: "center", fontSize: "1.1rem", letterSpacing: "0.08em" }}>
                      {video.title}
                    </h3>
                  )}
                  <div style={{ padding: "10px", background: "var(--card-bg)", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
                    <iframe
                      width="100%"
                      height="450"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: "none", display: "block" }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ fontStyle: "italic", color: "var(--text-color)", opacity: 0.5 }}>
              No featured videos yet — add some via the Admin CMS.
            </p>
          )}
        </section>

        <NewsletterForm />
      </main>

      <Footer />
    </>
  );
}
