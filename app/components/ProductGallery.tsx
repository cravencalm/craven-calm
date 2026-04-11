"use client";

import AudioPlayer from "./AudioPlayer";

type Product = {
  id: number;
  name: string;
  price_cents: number;
  youtube_id: string | null;
  mp3_preview_url: string | null;
  zip_file_url: string | null;
  image_url: string | null;
  audio_length: string | null;
  is_physical?: boolean;
  category?: string | null;
};

interface ProductGalleryProps {
  products: Product[];
  loading: boolean;
  emptyMessage?: string;
}

export default function ProductGallery({ products, loading, emptyMessage = "No products found in this collection." }: ProductGalleryProps) {
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
    <section className="releases-section">
      <div className="products-grid">
        {loading ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", fontStyle: "italic", padding: "2rem" }}>
            Unveiling visions...
          </p>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-wrapper">
                <img
                  src={product.image_url || "/assets/album_art_1_1775220324510.png"}
                  alt={product.name}
                  className={(product.category || "").split(",").map(c => c.trim()).includes("mobile-wallpaper") ? "zoom-on-hover" : ""}
                />
                <span className="price-tag">${(product.price_cents / 100).toFixed(2)}</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                  <span className="sub-text" style={{ margin: 0 }}>
                    {product.is_physical ? "Physical Metal Poster" : "Craven Calm Exclusive"}
                  </span>
                  {product.category && !product.is_physical && (product.category || "").split(",").map(cat => (
                    <span key={cat} style={{ fontSize: "0.65rem", background: "rgba(227, 169, 104, 0.1)", color: "var(--accent-color)", padding: "1px 6px", border: "1px solid rgba(227, 169, 104, 0.3)", borderRadius: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {cat.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>

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
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
