"use client";

import { useEffect, useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
};

export default function MusicPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      if (data) setProducts(data);
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
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Navbar />

      {/* Page header — sits below the absolute navbar */}
      <div className="music-page-header">
        <h1 className="music-page-title">The Complete Collection</h1>
        <p className="music-page-subtitle">Every release from the Sanctuary — explore, listen &amp; own</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        <section className="releases-section">
          <div className="products-grid">
            {loading ? (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic", padding: "2rem" }}>
                Summoning melodies…
              </p>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    <img
                      src={product.image_url || "/assets/album_art_1_1775220324510.png"}
                      alt={product.name}
                    />
                    <span className="price-tag">${(product.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="sub-text">{product.is_physical ? "Physical Metal Poster" : "Craven Calm Exclusive"}</p>

                    {product.audio_length && !product.is_physical && (
                      <p style={{ fontSize: "0.8rem", color: "var(--accent-hover)", marginBottom: "1rem", fontStyle: "italic" }}>
                        ⏱️ {product.audio_length}
                      </p>
                    )}

                    {product.mp3_preview_url && (
                      <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                        <p style={{ fontSize: "0.8rem", color: "var(--accent-color)", fontStyle: "italic", marginBottom: "0.5rem" }}>
                          {product.is_physical ? "Artwork Preview" : "Audio Preview"}
                        </p>
                        <AudioPlayer src={product.mp3_preview_url} />
                      </div>
                    )}

                    <button
                      className="btn-buy stripe-buy"
                      onClick={() => handleCheckout(product.id.toString())}
                    >
                      {product.is_physical ? "Buy Metal Poster" : "Buy MP3/ZIP"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic" }}>
                No albums published yet. Check back soon.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
