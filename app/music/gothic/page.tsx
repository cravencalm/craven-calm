"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductGallery from "../../components/ProductGallery";
import { supabase } from "@/lib/supabase";

export default function GothicMusicPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      // Fetch all digital products and filter client-side for precision
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_physical", false)
        .order("id", { ascending: false });
      
      if (data) {
        const filtered = data.filter(p => 
          (p.category || "").split(",").map((c: string) => c.trim()).includes("gothic")
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
        <h1 className="music-page-title">Gothic Collection</h1>
        <p className="music-page-subtitle">Haunting melodies & Dark Academia atmospheres</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        <ProductGallery 
          products={products} 
          loading={loading} 
          emptyMessage="No gothic tracks currently in the collection." 
        />
      </main>

      <Footer />
    </>
  );
}
