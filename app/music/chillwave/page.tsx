"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductGallery from "../../components/ProductGallery";
import { supabase } from "@/lib/supabase";

export default function ChillwaveMusicPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_physical", false)
        .order("id", { ascending: false });
      
      if (data) {
        const filtered = data.filter(p => 
          (p.category || "").split(",").map((c: string) => c.trim()).includes("chillwave")
        );
        setProducts(filtered);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />

      <div className="music-page-header">
        <h1 className="music-page-title">Chillwave Collection</h1>
        <p className="music-page-subtitle">Nostalgic, synth-heavy coastal vibes</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        <ProductGallery 
          products={products} 
          loading={loading} 
          emptyMessage="No Chillwave releases yet." 
        />
      </main>

      <Footer />
    </>
  );
}
