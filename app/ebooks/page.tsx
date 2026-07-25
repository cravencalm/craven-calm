"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

type Ebook = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  file_url: string;
  is_featured: boolean;
};

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEbooks() {
      const { data } = await supabase
        .from("ebooks")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setEbooks(data);
      setLoading(false);
    }
    fetchEbooks();
  }, []);

  const handleCheckout = async (productId: number) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: productId.toString() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(`Checkout error: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during checkout setup.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="music-page-header" style={{ background: 'linear-gradient(to bottom, rgba(7, 7, 10, 0.98) 0%, rgba(7, 7, 10, 0.8) 100%)' }}>
        <h1 className="music-page-title">Digital eBooks</h1>
        <p className="music-page-subtitle">Haunting literary volumes delivered instantly to your digital library</p>
      </div>

      <main style={{ paddingBottom: "6rem", minHeight: "60vh" }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontStyle: 'italic', opacity: 0.6 }}>Unlocking the digital vaults...</div>
        ) : ebooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontStyle: 'italic', opacity: 0.6 }}>The digital shelves are currently quiet. Check back soon.</div>
        ) : (
          <div style={{ marginTop: "2rem" }}>
            <div className="products-grid">
              {ebooks.map(ebook => (
                <div key={ebook.id} className="product-card book-card">
                  <div className="product-image-wrapper book-image-wrapper">
                    {ebook.image_url ? (
                      <img src={ebook.image_url} alt={ebook.title} />
                    ) : (
                      <div className="book-placeholder">
                        <span>{ebook.title}</span>
                      </div>
                    )}
                    <span className="price-tag">${(ebook.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <div className="product-info">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{ebook.title}</h3>
                    <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '0.8rem' }}>by {ebook.author}</p>
                    {ebook.description && (
                      <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ebook.description}
                      </p>
                    )}
                    <button 
                      onClick={() => handleCheckout(ebook.id)} 
                      className="btn-buy book-btn"
                      style={{ border: "none", width: "100%", cursor: "pointer" }}
                    >
                      Buy EPUB/PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .book-card {
          border: 1px solid rgba(227, 169, 104, 0.2);
          background: rgba(18, 18, 26, 0.8);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .book-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--accent-color);
          box-shadow: 0 15px 30px rgba(0,0,0,0.6), 0 0 15px rgba(227, 169, 104, 0.1);
        }
        .book-image-wrapper {
          aspect-ratio: 2 / 3;
          background: #0d0d0f;
          padding: 10px;
          position: relative;
        }
        .book-image-wrapper img {
          box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .book-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a1a1f;
          border: 1px solid #333;
          padding: 2rem;
          text-align: center;
          font-family: var(--font-heading);
          color: #555;
        }
      `}</style>
    </>
  );
}
