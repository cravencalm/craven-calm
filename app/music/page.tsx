"use client";

import { useEffect, useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGallery from "../components/ProductGallery";
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

export default function MusicPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Show all digital music (specifically excluding mobile wallpapers)
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_physical", false)
        .order("id", { ascending: false });
      
      if (data) {
        // Filter out mobile wallpapers which are handled elsewhere
        const musicProducts = data.filter(p => {
          const cats = (p.category || "").split(",").map((c: string) => c.trim());
          return !cats.includes('mobile-wallpaper');
        });
        setProducts(musicProducts);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Helper to filter by category
  const getByCategory = (catName: string) => {
    return products.filter(p => {
      const cats = (p.category || "").split(",").map((c: string) => c.trim());
      return cats.includes(catName);
    });
  };

  const gothicProducts = getByCategory('gothic');
  const sleepProducts = getByCategory('sleep-relaxation');
  const westernProducts = getByCategory('western');
  const worldMusicProducts = getByCategory('world-music');
  const meditationProducts = getByCategory('meditation');

  const otherProducts = products.filter(p => {
    const cats = (p.category || "").split(",").map((c: string) => c.trim());
    return !cats.includes('gothic') && 
           !cats.includes('sleep-relaxation') && 
           !cats.includes('western') && 
           !cats.includes('world-music') &&
           !cats.includes('meditation');
  });

  return (
    <>
      <Navbar />

      <div className="music-page-header">
        <h1 className="music-page-title">The Complete Collection</h1>
        <p className="music-page-subtitle">Every release from the Sanctuary — explore & define your path</p>
      </div>

      <main style={{ paddingBottom: "4rem" }}>
        {/* Gothic Section */}
        <div style={{ marginTop: "3rem" }}>
          <div className="section-divider">
            <span className="ornament left">&#10086;</span>
            <h2>The Gothic Collection</h2>
            <span className="ornament right">&#10086;</span>
          </div>
          <ProductGallery 
            products={gothicProducts} 
            loading={loading} 
            emptyMessage="No gothic melodies found." 
          />
        </div>

        {/* Sleep & Relaxation Section */}
        <div style={{ marginTop: "3rem" }}>
          <div className="section-divider">
            <span className="ornament left">&#10086;</span>
            <h2>Sleep & Relaxation</h2>
            <span className="ornament right">&#10086;</span>
          </div>
          <ProductGallery 
            products={sleepProducts} 
            loading={loading} 
            emptyMessage="No tranquil tones found." 
          />
        </div>

        {/* Western / Folk Section */}
        <div style={{ marginTop: "3rem" }}>
          <div className="section-divider">
            <span className="ornament left">&#10086;</span>
            <h2>Western / Folk</h2>
            <span className="ornament right">&#10086;</span>
          </div>
          <ProductGallery 
            products={westernProducts} 
            loading={loading} 
            emptyMessage="The pioneer's collection is empty." 
          />
        </div>

        {/* World Music Section */}
        <div style={{ marginTop: "3rem" }}>
          <div className="section-divider">
            <span className="ornament left">&#10086;</span>
            <h2>World Music</h2>
            <span className="ornament right">&#10086;</span>
          </div>
          <ProductGallery 
            products={worldMusicProducts} 
            loading={loading} 
            emptyMessage="Exploring the global sounds... no releases yet." 
          />
        </div>

        {/* Meditation Section */}
        <div style={{ marginTop: "3rem" }}>
          <div className="section-divider">
            <span className="ornament left">&#10086;</span>
            <h2>Meditation</h2>
            <span className="ornament right">&#10086;</span>
          </div>
          <ProductGallery 
            products={meditationProducts} 
            loading={loading} 
            emptyMessage="Preparing the sanctuary for meditation... no releases yet." 
          />
        </div>

        {/* Miscellaneous / Other Section */}
        {otherProducts.length > 0 && (
          <div style={{ marginTop: "3rem" }}>
            <div className="section-divider">
              <span className="ornament left">&#10086;</span>
              <h2>Additional Releases</h2>
              <span className="ornament right">&#10086;</span>
            </div>
            <ProductGallery 
              products={otherProducts} 
              loading={loading} 
              emptyMessage="No other releases found." 
            />
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
