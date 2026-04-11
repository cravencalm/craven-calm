"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductGallery from "../../components/ProductGallery";
import { supabase } from "@/lib/supabase";

export default function DarkCalmPage() {
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
          (p.category || "").split(",").map((c: string) => c.trim()).includes("session-dark-calm")
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
        <h1 className="music-page-title">Dark Calm</h1>
        <p className="music-page-subtitle">Deep, still guided meditations rooted in shadow and silence</p>
      </div>

      <main style={{ paddingTop: "2rem" }}>
        <ProductGallery
          products={products}
          loading={loading}
          emptyMessage="The Dark Calm awaits — sessions coming soon."
        />
      </main>

      <Footer />
    </>
  );
}
