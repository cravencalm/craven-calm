"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";

type Book = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  image_url: string | null;
  bookshop_url: string;
  category: "Horror" | "Meditation" | "Mystery" | "Western" | null;
  is_featured: boolean;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setBooks(data);
      setLoading(false);
    }
    fetchBooks();
  }, []);

  const categories = ["Horror", "Meditation", "Mystery", "Western"] as const;

  return (
    <>
      <Navbar />

      <div className="music-page-header" style={{ background: 'linear-gradient(to bottom, rgba(7, 7, 10, 0.98) 0%, rgba(7, 7, 10, 0.8) 100%)' }}>
        <h1 className="music-page-title">The Curated Library</h1>
        <p className="music-page-subtitle">Hand-picked volumes for the dark academia soul — supported by Bookshop.org</p>
      </div>

      <main style={{ paddingBottom: "6rem", minHeight: "60vh" }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontStyle: 'italic', opacity: 0.6 }}>Opening the ancient archives...</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', fontStyle: 'italic', opacity: 0.6 }}>The shelves are currently bare. Check back soon.</div>
        ) : (
          categories.map(cat => {
            const catBooks = books.filter(b => b.category === cat);
            if (catBooks.length === 0) return null;

            return (
              <div key={cat} style={{ marginTop: "4rem" }}>
                <div className="section-divider">
                  <span className="ornament left">&#10086;</span>
                  <h2>{cat}</h2>
                  <span className="ornament right">&#10086;</span>
                </div>

                <div className="products-grid">
                  {catBooks.map(book => (
                    <div key={book.id} className="product-card book-card">
                      <div className="product-image-wrapper book-image-wrapper">
                        {book.image_url ? (
                          <img src={book.image_url} alt={book.title} />
                        ) : (
                          <div className="book-placeholder">
                            <span>{book.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{book.title}</h3>
                        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '0.8rem' }}>by {book.author}</p>
                        {book.description && (
                          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {book.description}
                          </p>
                        )}
                        <a 
                          href={book.bookshop_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-buy book-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          View on Bookshop
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        
        <p style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.6, marginTop: "6rem", fontStyle: "italic", padding: "0 10%" }}>
          As a Bookshop.org affiliate, Craven Calm earns a commission from qualifying purchases.
        </p>
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
        }
        .book-image-wrapper img {
          box-shadow: 5px 5px 15px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
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
