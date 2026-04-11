"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGallery from "../components/ProductGallery";
import { supabase } from "@/lib/supabase";

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

export default function ArtHubPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Fetch all art-related products (Physical items + Mobile Wallpapers)
      const { data } = await supabase
        .from("products")
        .select("*")
        .or("is_physical.eq.true,category.eq.mobile-wallpaper")
        .order("id", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const wallArt = products.filter(p => p.is_physical);
  const mobileWallpapers = products.filter(p => (p.category || "").split(",").map(c => c.trim()).includes("mobile-wallpaper"));

  return (
    <>
      <Navbar />

      <div className="music-page-header">
        <h1 className="music-page-title">Ethereal Gallery</h1>
        <p className="music-page-subtitle">Dark Academic Wall Art & Digital Collections</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        {/* Wall-Art Section */}
        <div className="section-divider">
          <span className="ornament left">&#10086;</span>
          <h2>Wall-Art Collections</h2>
          <span className="ornament right">&#10086;</span>
        </div>
        <ProductGallery 
          products={wallArt} 
          loading={loading} 
          emptyMessage="New physical visions are currently being prepared. Check back soon." 
        />

        {/* Mobile Wallpapers Section */}
        <div className="section-divider" style={{ marginTop: "6rem" }}>
          <span className="ornament left">&#10086;</span>
          <h2>Mobile Wallpapers</h2>
          <span className="ornament right">&#10086;</span>
        </div>
        <ProductGallery 
          products={mobileWallpapers} 
          loading={loading} 
          emptyMessage="No wallpapers currently in the collection. Check back soon." 
        />
      </main>

      <Footer />
    </>
  );
}
