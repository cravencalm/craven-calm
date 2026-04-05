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
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
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
          <h1 className="hero-title">Calm & Gothic Music for the Soul</h1>
          <div className="hero-divider"></div>
          <p className="hero-subtitle">Find Your Inner Peace</p>
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
          <h2>Latest Releases</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section id="store" className="releases-section">
          <div className="products-grid">
            {loading ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic", padding: "2rem" }}>Summoning melodies...</p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    {/* Fallback to default styling if no image_url is returned */}
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
                    
                    <button
                      className="btn-buy stripe-buy"
                      onClick={() => handleCheckout(product.id.toString())}
                    >
                      Buy MP3/ZIP
                    </button>
                  </div>
                </div>
              ))
            ) : (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic" }}>No albums published yet. Check the Admin Dashboard.</p>
            )}
          </div>
        </section>

        <div className="section-divider">
          <span className="ornament left">&#10086;</span>
          <h2>Featured Visuals</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section style={{ display: "flex", justifyContent: "center", marginBottom: "4rem" }}>
          <div style={{ width: "100%", maxWidth: "800px", padding: "10px", background: "var(--card-bg)", border: "1px solid var(--border-color)", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
             <iframe 
                width="100%" 
                height="450" 
                src="https://www.youtube.com/embed/YPAsG5iXafE?autoplay=0&controls=1&showinfo=0&rel=0" 
                title="Craven Calm - Gothic Ambience" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                style={{ border: "none" }}
             ></iframe>
          </div>
        </section>



        <NewsletterForm />
      </main>

      <Footer />
    </>
  );
}
