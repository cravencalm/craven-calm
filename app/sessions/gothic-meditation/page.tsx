"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductGallery from "../../components/ProductGallery";
import { supabase } from "@/lib/supabase";

export default function GothicMeditationPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      
      if (data) {
        const filtered = data.filter(p => 
          (p.category || "").split(",").map((c: string) => c.trim()).includes("session-gothic-meditation")
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
        <h1 className="music-page-title">Gothic Meditation</h1>
        <p className="music-page-subtitle">Hauntingly peaceful guided sessions for deep introspection and soulful stillness</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        <ProductGallery
          products={products}
          loading={loading}
          emptyMessage="The Gothic Sanctuary is preparing — sessions coming soon."
        />
      </main>

      <Footer />
    </>
  );
}
